import mongoose from 'mongoose';
import dayjs from 'dayjs';
import { customAlphabet } from 'nanoid';
import { ORDER_STATUSES, PAYMENT_STATUSES, CHANNELS } from '@afsa/shared/enums';

const { Schema, model } = mongoose;

const nanoDigits = customAlphabet('0123456789', 4);
const nanoTrack = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 9);

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: { type: Number, default: 0 },
    quantity: { type: Number, default: 1, min: 1 },
    size: String,
    color: String,
  },
  { _id: false }
);

const shippingAddressSchema = new Schema(
  {
    line1: String,
    line2: String,
    city: String,
    country: { type: String, default: 'Pakistan' },
    postalCode: String,
    raw: String,
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    orderId: { type: String, unique: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    items: { type: [orderItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    discountTotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    currency: { type: String, default: 'PKR' },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending', index: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'cod_pending' },
    trackingNumber: String,
    channel: { type: String, enum: CHANNELS, default: 'simulator' },
    shippingAddress: { type: shippingAddressSchema, default: undefined },
    notes: String,
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });

orderSchema.statics.genOrderId = function genOrderId() {
  return `AFS-${dayjs().format('YYYYMMDD')}-${nanoDigits()}`;
};

orderSchema.statics.genTracking = function genTracking() {
  return `TRK${nanoTrack()}`;
};

orderSchema.pre('validate', function computeTotals(next) {
  // item.price is the actual per-unit selling price (already discounted).
  // discountTotal is informational (list price - selling price) and not re-subtracted.
  const subtotal = this.items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0);
  this.subtotal = subtotal;
  this.total = subtotal;
  if (!this.orderId) this.orderId = this.constructor.genOrderId();
  next();
});

export const Order = model('Order', orderSchema);
export default Order;
