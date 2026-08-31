import { Customer, Conversation, Message, Product, Order } from '../../models/index.js';
import { logger } from '../../config/logger.js';
import { detectIntent } from '../ai/intent.chain.js';
import { detectSentiment } from '../ai/sentiment.chain.js';
import { generateReply, formatProductLines } from '../ai/replyGen.chain.js';
import { recommendProducts } from '../ai/recommend.js';
import { alsoBought } from '../ai/upsell.js';
import { transcribe } from '../voice/transcribe.js';
import { detectLang } from '../i18n/detectLang.js';
import { t } from '../i18n/strings.js';
import { normalizeInbound } from './normalize.js';
import { transition } from './stateMachine.js';
import { advanceOrder } from './orderFlow.js';
import { sendMessage } from '../channels/index.js';

const HISTORY_LIMIT = 6;

async function loadHistory(conversationId) {
  const rows = await Message.find({ conversationId })
    .sort({ createdAt: -1 })
    .limit(HISTORY_LIMIT)
    .lean();
  return rows.reverse();
}

async function buildDiscountReply(lang, entities) {
  const filter = { isActive: true, stock: { $gt: 0 } };
  if (entities.budget) filter.price = { $lte: entities.budget };
  else filter.discount = { $gt: 0 };
  const items = await Product.find(filter).sort({ discount: -1, price: 1 }).limit(4).lean();
  if (!items.length) return { reply: t(lang, 'noResults'), products: [] };
  return { reply: t(lang, 'discounts', formatProductLines(items)), products: items };
}

async function buildTrackingReply(lang, entities, customer) {
  let order = null;
  if (entities.orderId) {
    order = await Order.findOne({
      $or: [{ orderId: entities.orderId }, { trackingNumber: entities.orderId }],
    }).lean();
  }
  if (!order) {
    order = await Order.findOne({ customerId: customer._id }).sort({ createdAt: -1 }).lean();
  }
  if (!order) return t(lang, 'trackNotFound');
  return t(lang, 'trackFound', order.orderId, order.status, order.trackingNumber);
}

/**
 * handleInboundMessage — the single conversation pipeline shared by every channel.
 *
 * @param {object} args
 * @param {string} args.channel
 * @param {string} [args.senderId]
 * @param {string} [args.senderName]
 * @param {string} [args.text]
 * @param {Array}  [args.attachments]
 * @param {object} [args.raw]      raw channel payload (used when senderId/text absent)
 * @param {boolean} [args.send]    actually dispatch the reply on the channel
 * @returns {Promise<{reply:string,intent:string,sentiment:string,state:string,products:Array,orderId?:string,conversationId:string}>}
 */
export async function handleInboundMessage({
  channel,
  senderId,
  senderName,
  text,
  attachments,
  raw,
  send = true,
}) {
  const normalized =
    raw != null
      ? normalizeInbound(channel, raw)
      : {
          channel,
          senderId,
          senderName,
          text: text || '',
          attachments: attachments || [],
        };

  let messageText = normalized.text;
  const audio = (normalized.attachments || []).find((a) => a.type === 'audio');
  if (!messageText && audio) {
    messageText = await transcribe(audio).catch(() => '');
  }

  const language = detectLang(messageText);
  const customer = await Customer.findOrCreateByChannel({
    channel: normalized.channel,
    senderId: normalized.senderId,
    name: normalized.senderName,
  });
  const conversation = await Conversation.getOpen({
    customerId: customer._id,
    channel: normalized.channel,
  });

  const history = await loadHistory(conversation._id);

  await Message.create({
    conversationId: conversation._id,
    direction: 'inbound',
    text: messageText,
    channel: normalized.channel,
    attachments: normalized.attachments,
  });

  const [intentResult, sentimentResult] = await Promise.all([
    detectIntent(messageText, history),
    detectSentiment(messageText, history),
  ]);
  const { intent, entities } = intentResult;
  const { sentiment } = sentimentResult;

  const ctx = conversation.context || {};
  const orderish =
    intent === 'order_placement' ||
    ['COLLECTING_ORDER', 'AWAITING_ADDRESS', 'AWAITING_CONFIRMATION'].includes(conversation.state);

  const decision = transition(conversation.state, {
    intent,
    hasItems: (ctx.items || []).length > 0,
    hasAddress: Boolean(ctx.address),
    confirmed: Boolean(ctx.confirmed),
    hasPendingOrder: (ctx.items || []).length > 0,
  });

  let reply = '';
  let products = [];
  let orderId;
  let nextState = decision.nextState;

  if (orderish) {
    const res = await advanceOrder({
      conversation,
      customer,
      text: messageText,
      entities,
      history,
      language,
    });
    reply = res.reply;
    nextState = res.state;
    orderId = res.orderId;
    products = res.products || [];
    if (res.order) {
      const upsells = await alsoBought(res.order.items.map((i) => i.productId), 2);
      if (upsells.length) reply += `\n\n${t(language, 'upsell', formatProductLines(upsells))}`;
    }
  } else {
    switch (decision.action) {
      case 'send_menu':
        reply = t(language, 'menu', customer.name);
        break;
      case 'recommend': {
        products = await recommendProducts({
          customer,
          entities,
          queryText: messageText,
          limit: 3,
        });
        if (products.length) {
          reply = `${t(language, 'foundOptions')}\n${formatProductLines(products)}\n\n${t(
            language,
            'seePictures'
          )}`;
          conversation.context = {
            ...ctx,
            lastRecommended: products.map((p) => String(p._id)),
          };
          conversation.markModified('context');
          const upsells = await alsoBought(products.map((p) => p._id), 2);
          if (upsells.length) {
            reply += `\n\n${t(language, 'upsell', formatProductLines(upsells))}`;
          }
        } else {
          reply = t(language, 'noResults');
        }
        break;
      }
      case 'show_discounts': {
        const res = await buildDiscountReply(language, entities);
        reply = res.reply;
        products = res.products;
        break;
      }
      case 'track_or_delivery':
        reply =
          entities.orderId || /track|parcel|status|order/i.test(messageText)
            ? await buildTrackingReply(language, entities, customer)
            : t(language, 'delivery');
        break;
      case 'handle_complaint':
        reply = t(language, 'complaint');
        conversation.needsHuman = true;
        break;
      case 'handle_return':
        reply = t(language, 'returns');
        break;
      default:
        reply = await generateReply({
          text: messageText,
          intent,
          sentiment,
          language,
          customerName: customer.name,
          products: [],
          history,
        });
    }
  }

  conversation.state = nextState;
  conversation.lastIntent = intent;
  conversation.lastSentiment = sentiment;
  conversation.language = language;
  if (sentiment === 'angry' && conversation.lastSentiment === 'angry') conversation.needsHuman = true;
  await conversation.save();

  await Message.create({
    conversationId: conversation._id,
    direction: 'outbound',
    text: reply,
    channel: normalized.channel,
    intent,
    sentiment,
    entities,
  });

  const images = products.flatMap((p) => p.images || []).slice(0, 5);
  if (send) {
    await sendMessage(normalized.channel, normalized.senderId, { text: reply, images }).catch((err) =>
      logger.error({ err }, 'sendMessage failed')
    );
  }

  return {
    reply,
    intent,
    sentiment,
    state: conversation.state,
    products,
    orderId,
    conversationId: String(conversation._id),
    customerId: String(customer._id),
  };
}

export default handleInboundMessage;
