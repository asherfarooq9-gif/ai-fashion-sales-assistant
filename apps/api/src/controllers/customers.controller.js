import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { Customer, Conversation } from '../models/index.js';

export const listCustomers = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const page = Number(req.query.page) || 1;
  const q = req.query.q;
  const filter = q
    ? { $or: [{ name: new RegExp(q, 'i') }, { phone: new RegExp(q, 'i') }] }
    : {};
  const [items, total] = await Promise.all([
    Customer.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Customer.countDocuments(filter),
  ]);
  res.json({ data: items, meta: { total, page, limit } });
});

export const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id).populate('orderHistory');
  if (!customer) throw ApiError.notFound('Customer not found');
  const conversations = await Conversation.find({ customerId: customer._id }).sort({
    updatedAt: -1,
  });
  res.json({ data: { ...customer.toObject(), conversations } });
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!customer) throw ApiError.notFound('Customer not found');
  res.json({ data: customer });
});
