import mongoose from 'mongoose';
import { INTENTS, LANGUAGES } from '@afsa/shared/enums';

const { Schema, model } = mongoose;

const cannedResponseSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    intent: { type: String, enum: INTENTS, required: true },
    language: { type: String, enum: LANGUAGES, default: 'en' },
    triggerExamples: { type: [String], default: [] },
    responseTemplate: { type: String, required: true },
    isFewShot: { type: Boolean, default: false },
    enabled: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
  },
  { timestamps: true }
);

cannedResponseSchema.index({ intent: 1, language: 1, enabled: 1 });

export const CannedResponse = model('CannedResponse', cannedResponseSchema);
export default CannedResponse;
