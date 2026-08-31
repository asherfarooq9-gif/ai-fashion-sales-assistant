import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { toCsv } from '../utils/csv.js';
import { Product, Customer, Order, Conversation, Message } from '../models/index.js';

const ENTITIES = {
  products: () => Product.find().lean(),
  customers: () => Customer.find().lean(),
  orders: () => Order.find().populate('customerId', 'name phone').lean(),
  conversations: async () => {
    const conversations = await Conversation.find().populate('customerId', 'name').lean();
    const messages = await Message.find().lean();
    const byConversation = new Map();
    for (const m of messages) {
      const key = String(m.conversationId);
      if (!byConversation.has(key)) byConversation.set(key, []);
      byConversation.get(key).push({ direction: m.direction, text: m.text, intent: m.intent });
    }
    return conversations.map((c) => ({ ...c, messages: byConversation.get(String(c._id)) || [] }));
  },
};

export const exportEntity = asyncHandler(async (req, res) => {
  const { entity, format } = req.params;
  if (!ENTITIES[entity]) throw ApiError.notFound(`Unknown entity: ${entity}`);
  if (!['csv', 'json'].includes(format)) throw ApiError.badRequest('format must be csv or json');

  const rows = await ENTITIES[entity]();
  const filename = `${entity}-${new Date().toISOString().slice(0, 10)}.${format}`;

  if (format === 'json') {
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.json({ data: rows });
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(toCsv(rows));
});
