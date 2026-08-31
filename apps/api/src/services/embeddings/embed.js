import crypto from 'node:crypto';
import { LRUCache } from 'lru-cache';
import { config } from '../../config/env.js';
import { getProvider } from '../llm/index.js';

const cache = new LRUCache({ max: 2000 });

const keyOf = (text) =>
  crypto.createHash('sha1').update(`${config.LLM_PROVIDER}:${text}`).digest('hex');

/**
 * embedTexts — provider embeddings with an in-process LRU cache.
 * Returns vectors in the same order as the input.
 */
export async function embedTexts(texts) {
  const list = Array.isArray(texts) ? texts : [texts];
  const missing = [];
  const result = new Array(list.length);

  list.forEach((text, i) => {
    const cached = cache.get(keyOf(text));
    if (cached) result[i] = cached;
    else missing.push(i);
  });

  if (missing.length) {
    const vectors = await getProvider().embed(missing.map((i) => list[i]));
    missing.forEach((originalIndex, k) => {
      const vec = vectors[k];
      cache.set(keyOf(list[originalIndex]), vec);
      result[originalIndex] = vec;
    });
  }

  return result;
}

export async function embedOne(text) {
  const [vec] = await embedTexts([text]);
  return vec;
}

export function clearEmbedCache() {
  cache.clear();
}

export default embedTexts;
