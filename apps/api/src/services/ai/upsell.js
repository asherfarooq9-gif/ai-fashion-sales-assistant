import mongoose from 'mongoose';
import { Order, Product } from '../../models/index.js';

/**
 * alsoBought — products frequently purchased alongside the given product ids.
 * Falls back to top sellers in the same category when there is no co-purchase data.
 */
export async function alsoBought(productIds = [], limit = 2) {
  const ids = productIds
    .filter(Boolean)
    .map((id) => new mongoose.Types.ObjectId(String(id)));
  if (!ids.length) return [];

  const rows = await Order.aggregate([
    { $match: { 'items.productId': { $in: ids } } },
    { $unwind: '$items' },
    { $match: { 'items.productId': { $nin: ids } } },
    { $group: { _id: '$items.productId', count: { $sum: '$items.quantity' } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);

  let picks = [];
  if (rows.length) {
    picks = await Product.find({ _id: { $in: rows.map((r) => r._id) }, isActive: true }).lean();
  }

  if (picks.length < limit) {
    const seed = await Product.findById(ids[0]).lean();
    if (seed) {
      const extra = await Product.find({
        _id: { $nin: [...ids, ...picks.map((p) => p._id)] },
        category: seed.category,
        isActive: true,
        stock: { $gt: 0 },
      })
        .sort({ salesCount: -1 })
        .limit(limit - picks.length)
        .lean();
      picks = [...picks, ...extra];
    }
  }

  return picks.slice(0, limit);
}

export default alsoBought;
