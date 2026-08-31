import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { Product } from '../models/index.js';

export const listProducts = asyncHandler(async (req, res) => {
  const { category, gender, color, maxPrice, minPrice, q, trending, limit, page } = req.query;

  const filter = Product.buildFilter({
    gender,
    category,
    maxPrice,
    minPrice,
    colors: color,
    inStockOnly: false,
  });
  if (q) filter.$text = { $search: q };

  const sort = trending ? { salesCount: -1 } : { createdAt: -1 };
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({ data: items, meta: { total, page, limit } });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  res.json({ data: product });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ data: product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw ApiError.notFound('Product not found');
  res.json({ data: product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  res.json({ data: { id: product._id } });
});
