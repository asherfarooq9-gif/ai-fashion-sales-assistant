import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { Conversation, Message } from '../models/index.js';

export const listConversations = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const page = Number(req.query.page) || 1;
  const filter = {};
  if (req.query.channel) filter.channel = req.query.channel;
  if (req.query.needsHuman != null) filter.needsHuman = req.query.needsHuman === 'true';
  const [items, total] = await Promise.all([
    Conversation.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('customerId', 'name phone instagramId whatsappId'),
    Conversation.countDocuments(filter),
  ]);
  res.json({ data: items, meta: { total, page, limit } });
});

export const getConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id).populate('customerId');
  if (!conversation) throw ApiError.notFound('Conversation not found');
  const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 });
  res.json({ data: { ...conversation.toObject(), messages } });
});
