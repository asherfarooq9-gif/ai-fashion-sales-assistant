import mongoose from 'mongoose';
import { PRODUCT_CATEGORIES, GENDERS } from '@afsa/shared/enums';

const { Schema, model } = mongoose;

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: PRODUCT_CATEGORIES, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'PKR' },
    description: { type: String, default: '' },
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [], set: (v) => v.map((c) => String(c).toLowerCase()) },
    stock: { type: Number, default: 0, min: 0 },
    images: { type: [String], default: [] },
    discount: { type: Number, default: 0, min: 0, max: 70 },
    rating: { type: Number, default: 4.2, min: 0, max: 5 },
    gender: { type: String, enum: GENDERS, default: 'women', index: true },
    tags: { type: [String], default: [] },
    salesCount: { type: Number, default: 0, min: 0 },
    embedding: { type: [Number], default: undefined, select: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, gender: 1, price: 1 });
productSchema.index({ salesCount: -1 });
productSchema.index({ tags: 1 });

productSchema.virtual('discountedPrice').get(function () {
  return Math.round(this.price * (1 - (this.discount || 0) / 100));
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

/** Build a Mongo filter from recommendation entities. */
productSchema.statics.buildFilter = function buildFilter({
  gender,
  category,
  maxPrice,
  minPrice,
  colors,
  inStockOnly = true,
} = {}) {
  const filter = { isActive: true };
  if (inStockOnly) filter.stock = { $gt: 0 };
  if (gender) filter.gender = gender;
  if (category) filter.category = category;
  if (maxPrice != null || minPrice != null) {
    filter.price = {};
    if (minPrice != null) filter.price.$gte = minPrice;
    if (maxPrice != null) filter.price.$lte = maxPrice;
  }
  const colorList = (Array.isArray(colors) ? colors : [colors])
    .filter(Boolean)
    .map((c) => String(c).toLowerCase());
  if (colorList.length) filter.colors = { $in: colorList };
  return filter;
};

export const Product = model('Product', productSchema);
export default Product;
