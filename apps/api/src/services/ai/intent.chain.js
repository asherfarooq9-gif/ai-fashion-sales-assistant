import { intentResultSchema } from '@afsa/shared/schemas';
import { CannedResponse } from '../../models/index.js';
import { llm } from '../llm/index.js';
import { INTENT_SYSTEM, historyBlock } from './prompts/index.js';
import { extractEntities } from '../llm/mock.provider.js';

const norm = (s) => s.toLowerCase().replace(/[^\w\s]/g, '').trim();

/** Deterministic shortcut: exact-ish match against a canned trigger example. */
async function cannedMatch(text) {
  const target = norm(text);
  if (!target) return null;
  const canned = await CannedResponse.find({ enabled: true, isFewShot: false })
    .select('intent triggerExamples')
    .lean();
  for (const c of canned) {
    for (const ex of c.triggerExamples || []) {
      const e = norm(ex);
      if (e && (e === target || (e.length > 6 && target.includes(e)))) return c.intent;
    }
  }
  return null;
}

/**
 * detectIntent — classify a customer message and pull out entities.
 * @returns {Promise<{intent:string, confidence:number, entities:object}>}
 */
export async function detectIntent(text, history = []) {
  const shortcut = await cannedMatch(text).catch(() => null);
  if (shortcut) {
    return { intent: shortcut, confidence: 0.95, entities: { ...extractEntities(text) } };
  }

  const prompt = `${historyBlock(history)}Customer message: "${text}"`;
  const result = await llm().json({
    task: 'intent',
    system: INTENT_SYSTEM,
    prompt,
    input: text,
    schema: intentResultSchema,
  });

  // Always merge cheap heuristic entities so downstream has something to work with.
  result.entities = { ...extractEntities(text), ...pruneNullish(result.entities) };
  return result;
}

function pruneNullish(obj = {}) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null && v !== ''));
}

export default detectIntent;
