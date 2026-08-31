import mongoose from 'mongoose';
import { GENDERS, PRODUCT_CATEGORIES, LANGUAGES, CHANNELS } from '@afsa/shared/enums';

const { Schema, model } = mongoose;

const addressSchema = new Schema(
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

const customerSchema = new Schema(
  {
    name: { type: String, trim: true },
    phone: { type: String, index: { unique: true, sparse: true } },
    instagramId: { type: String, index: { unique: true, sparse: true } },
    whatsappId: { type: String, index: { unique: true, sparse: true } },
    address: { type: addressSchema, default: undefined },
    orderHistory: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
    preferences: {
      gender: { type: String, enum: GENDERS },
      favoriteColor: String,
      budget: Number,
      categories: { type: [String], enum: PRODUCT_CATEGORIES, default: [] },
    },
    language: { type: String, enum: LANGUAGES, default: 'en' },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

const CHANNEL_ID_FIELD = {
  instagram: 'instagramId',
  whatsapp: 'whatsappId',
  simulator: 'instagramId',
};

/** Upsert a customer keyed by their channel-specific sender id. */
customerSchema.statics.findOrCreateByChannel = async function findOrCreateByChannel({
  channel,
  senderId,
  name,
}) {
  if (!CHANNELS.includes(channel)) throw new Error(`unknown channel: ${channel}`);
  const field = CHANNEL_ID_FIELD[channel];
  const existing = await this.findOne({ [field]: senderId });
  if (existing) {
    if (name && !existing.name) {
      existing.name = name;
      await existing.save();
    }
    return existing;
  }
  return this.create({ [field]: senderId, name });
};

export const Customer = model('Customer', customerSchema);
export default Customer;
