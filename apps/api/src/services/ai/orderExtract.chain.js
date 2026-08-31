import { orderExtractResultSchema } from '@afsa/shared/schemas';
import { llm } from '../llm/index.js';
import { ORDER_EXTRACT_SYSTEM, historyBlock } from './prompts/index.js';

/**
 * extractOrder — pull items, address text and a confirm flag from the message.
 * @returns {Promise<{items:Array, addressText:?string, confirm:boolean}>}
 */
export async function extractOrder(text, history = []) {
  const prompt = `${historyBlock(history)}Customer message: "${text}"`;
  return llm().json({
    task: 'orderExtract',
    system: ORDER_EXTRACT_SYSTEM,
    prompt,
    input: text,
    schema: orderExtractResultSchema,
  });
}

export default extractOrder;
