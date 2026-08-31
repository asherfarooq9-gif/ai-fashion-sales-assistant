import { sentimentResultSchema } from '@afsa/shared/schemas';
import { llm } from '../llm/index.js';
import { SENTIMENT_SYSTEM, historyBlock } from './prompts/index.js';

/**
 * detectSentiment — classify the emotional tone of the latest customer message.
 * @returns {Promise<{sentiment:string, score:number}>}
 */
export async function detectSentiment(text, history = []) {
  const prompt = `${historyBlock(history)}Customer message: "${text}"`;
  return llm().json({
    task: 'sentiment',
    system: SENTIMENT_SYSTEM,
    prompt,
    input: text,
    schema: sentimentResultSchema,
  });
}

export default detectSentiment;
