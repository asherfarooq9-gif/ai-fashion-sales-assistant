import mongoose from 'mongoose';
import { CHANNELS, INTENTS, SENTIMENTS } from '@afsa/shared/enums';

const { Schema, model } = mongoose;

const messageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    direction: { type: String, enum: ['inbound', 'outbound'], required: true },
    text: { type: String, default: '' },
    channel: { type: String, enum: CHANNELS, required: true },
    intent: { type: String, enum: INTENTS },
    sentiment: { type: String, enum: SENTIMENTS },
    entities: { type: Schema.Types.Mixed, default: {} },
    attachments: {
      type: [{ type: { type: String }, url: String }],
      default: [],
    },
    provider: String,
    usage: {
      inputTokens: Number,
      outputTokens: Number,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message = model('Message', messageSchema);
export default Message;
