import mongoose from 'mongoose';
import {
  CHANNELS,
  CONVERSATION_STATES,
  INTENTS,
  SENTIMENTS,
  LANGUAGES,
} from '@afsa/shared/enums';

const { Schema, model } = mongoose;

const conversationSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    channel: { type: String, enum: CHANNELS, required: true },
    state: { type: String, enum: CONVERSATION_STATES, default: 'NEW' },
    lastIntent: { type: String, enum: INTENTS },
    lastSentiment: { type: String, enum: SENTIMENTS },
    language: { type: String, enum: LANGUAGES, default: 'en' },
    isOpen: { type: Boolean, default: true },
    needsHuman: { type: Boolean, default: false },
    summary: String,
    // scratch space for the state machine (pending order draft, etc.)
    context: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

conversationSchema.index({ customerId: 1, channel: 1 });
conversationSchema.index({ isOpen: 1, updatedAt: -1 });

conversationSchema.statics.getOpen = async function getOpen({ customerId, channel }) {
  const existing = await this.findOne({ customerId, channel, isOpen: true });
  if (existing) return existing;
  return this.create({ customerId, channel });
};

export const Conversation = model('Conversation', conversationSchema);
export default Conversation;
