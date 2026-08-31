import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { Order } from '../models/index.js';
import { createOrder } from '../services/orders/orderService.js';

export const listOrders = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const page = Number(req.query.page) || 1;
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.customerId) filter.customerId = req.query.customerId;
  const [items, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('customerId', 'name phone instagramId whatsappId'),
    Order.countDocuments(filter),
  ]);
  res.json({ data: items, meta: { total, page, limit } });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('customerId');
  if (!order) throw ApiError.notFound('Order not found');
  res.json({ data: order });
});

export const createOrderHandler = asyncHandler(async (req, res) => {
  const order = await createOrder(req.body);
  res.status(201).json({ data: order });
});

export const updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!order) throw ApiError.notFound('Order not found');
  res.json({ data: order });
});
