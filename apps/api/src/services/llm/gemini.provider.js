import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { config } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { mockProvider } from './mock.provider.js';

const chatByTemp = new Map();

function modelFor(temperature = 0.4) {
  if (!config.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set');
  const key = String(temperature);
  if (!chatByTemp.has(key)) {
    chatByTemp.set(
      key,
      new ChatGoogleGenerativeAI({
        apiKey: config.GEMINI_API_KEY,
        model: config.GEMINI_CHAT_MODEL,
        temperature,
        maxRetries: 2,
      })
    );
  }
  return chatByTemp.get(key);
}

async function withBackoff(fn, tries = 3) {
  let lastErr;
  for (let attempt = 0; attempt < tries; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const status = err?.status || err?.response?.status;
      if (status !== 429 && status !== 503) throw err;
      const delay = 500 * 2 ** attempt;
      logger.warn({ attempt, delay }, 'gemini rate limited, backing off');
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

export const geminiProvider = {
  name: 'gemini',

  async chat({ system, messages, temperature = 0.4 }) {
    const input = [];
    if (system) input.push({ role: 'system', content: system });
    input.push(...messages);
    const res = await withBackoff(() => modelFor(temperature).invoke(input));
    return {
      text:
        typeof res.content === 'string'
          ? res.content
          : res.content.map((c) => c.text || '').join(''),
      usage: res.usage_metadata,
    };
  },

  async json({ system, prompt, schema }) {
    const structured = modelFor(0).withStructuredOutput(schema);
    const input = [];
    if (system) input.push({ role: 'system', content: system });
    input.push({ role: 'user', content: prompt });
    return withBackoff(() => structured.invoke(input));
  },

  // Embeddings run through the deterministic local vectorizer so the stored
  // product vectors (seeded at EMBEDDING_DIMS) always match query vectors.
  // Swap in GoogleGenerativeAIEmbeddings + a reseed if you want live embeddings.
  async embed(texts) {
    return mockProvider.embed(texts);
  },
};

export default geminiProvider;
