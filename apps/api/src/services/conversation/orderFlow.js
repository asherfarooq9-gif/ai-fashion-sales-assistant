import { Product } from '../../models/index.js';
import { extractOrder } from '../ai/orderExtract.chain.js';
import { createOrder } from '../orders/orderService.js';
import { formatProductLines, sellingPrice } from '../ai/replyGen.chain.js';
import { t } from '../i18n/strings.js';

async function resolveProduct(item) {
  if (item.productId) {
    const byId = await Product.findById(item.productId).lean().catch(() => null);
    if (byId) return byId;
  }
  const name = item.productName;
  if (!name) return null;
  const words = name.split(/\s+/).map((w) => w.replace(/[^\w]/g, '')).filter(Boolean);

  // 1. exact (case-insensitive) name match
  const exact = await Product.findOne({
    name: new RegExp(`^${words.join('\\s+')}$`, 'i'),
    isActive: true,
  }).lean();
  if (exact) return exact;

  // 2. all words present in the name
  const allWords = await Product.find({
    isActive: true,
    $and: words.map((w) => ({ name: new RegExp(w, 'i') })),
  })
    .sort({ salesCount: -1 })
    .limit(5)
    .lean();
  if (allWords.length) return allWords[0];

  // 3. any word, ranked by popularity
  const anyWord = await Product.find({ name: new RegExp(words.join('|'), 'i'), isActive: true })
    .sort({ salesCount: -1 })
    .limit(5)
    .lean();
  if (anyWord.length) return anyWord[0];
  const textHit = await Product.find({ $text: { $search: name }, isActive: true })
    .select({ score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(1)
    .lean()
    .catch(() => []);
  return textHit[0] || null;
}

function parseCity(raw = '') {
  const cities = ['lahore', 'karachi', 'islamabad', 'rawalpindi', 'faisalabad', 'multan', 'peshawar', 'quetta', 'sialkot', 'gujranwala'];
  const lower = raw.toLowerCase();
  const city = cities.find((c) => lower.includes(c));
  return { raw, city: city ? city[0].toUpperCase() + city.slice(1) : undefined, country: 'Pakistan' };
}

/**
 * advanceOrder — run one turn of the order-collection sub-flow.
 * Mutates conversation.context.{items,address,confirmed}; returns the reply + result.
 */
export async function advanceOrder({ conversation, customer, text, entities, history, language }) {
  const ctx = conversation.context || {};
  ctx.items = ctx.items || [];
  const lang = language || conversation.language || 'en';

  const extracted = await extractOrder(text, history);

  // Merge newly mentioned items.
  for (const item of extracted.items || []) {
    const product = await resolveProduct(item);
    if (!product) continue;
    const existing = ctx.items.find((i) => String(i.productId) === String(product._id));
    if (existing) {
      existing.quantity = item.quantity || existing.quantity;
      if (item.size) existing.size = item.size;
      if (item.color) existing.color = item.color;
    } else {
      ctx.items.push({
        productId: String(product._id),
        name: product.name,
        price: sellingPrice(product),
        quantity: item.quantity || 1,
        size: item.size || entities.size,
        color: item.color || entities.color,
      });
    }
  }

  // Fall back to a single product from the browse context / entities.
  if (!ctx.items.length && (entities.productName || conversation.context?.lastRecommended?.length)) {
    const seed = entities.productName
      ? await resolveProduct({ productName: entities.productName })
      : await Product.findById(conversation.context.lastRecommended[0]).lean();
    if (seed) {
      ctx.items.push({
        productId: String(seed._id),
        name: seed.name,
        price: sellingPrice(seed),
        quantity: entities.quantity || 1,
        size: entities.size,
        color: entities.color,
      });
    }
  }

  if (extracted.addressText) ctx.address = parseCity(extracted.addressText);
  if (extracted.confirm) ctx.confirmed = true;

  conversation.markModified('context');

  const total = ctx.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const summary = ctx.items
    .map((i) => `${i.quantity} × ${i.name}${i.size ? ` (${i.size})` : ''}${i.color ? ` ${i.color}` : ''}`)
    .join('\n');

  if (!ctx.items.length) {
    return { reply: t(lang, 'askOrderDetails'), state: 'COLLECTING_ORDER' };
  }
  if (!ctx.address) {
    return {
      reply: `${summary}\n\n${t(lang, 'askAddress')}`,
      state: 'AWAITING_ADDRESS',
    };
  }
  if (!ctx.confirmed) {
    return {
      reply: t(lang, 'confirmPrompt', summary, total.toLocaleString('en-PK')),
      state: 'AWAITING_CONFIRMATION',
    };
  }

  const order = await createOrder({
    customerId: customer._id,
    items: ctx.items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      size: i.size,
      color: i.color,
    })),
    channel: conversation.channel,
    shippingAddress: ctx.address,
  });

  conversation.context = {};
  conversation.markModified('context');

  return {
    reply: t(lang, 'orderPlaced', order.orderId, order.trackingNumber, order.total.toLocaleString('en-PK')),
    state: 'ORDER_PLACED',
    orderId: order.orderId,
    order,
    products: ctx.items,
  };
}

export { formatProductLines };
export default advanceOrder;
