import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { config } from '../../config/env.js';
import { logger } from '../../config/logger.js';

let chatModel;
let embedModel;

function getChat(temperature = 0.4) {
  if (!config.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set');
  chatModel ??= new ChatGoogleGenerativeAI({
    apiKey: config.GEMINI_API_KEY,
    model: config.GEMINI_CHAT_MODEL,
    maxRetries: 2,
  });
  return chatModel.bind({ temperature });
}

function getEmbed() {
  if (!config.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set');
  embedModel ??= new GoogleGenerativeAIEmbeddings({
    apiKey: config.GEMINI_API_KEY,
    model: config.GEMINI_EMBED_MODEL,
  });
  return embedModel;
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
    const model = getChat(temperature);
    const input = [];
    if (system) input.push({ role: 'system', content: system });
    input.push(...messages);
    const res = await withBackoff(() => model.invoke(input));
    return {
      text: typeof res.content === 'string' ? res.content : res.content.map((c) => c.text).join(''),
      usage: res.usage_metadata,
    };
  },

  async json({ system, prompt, schema }) {
    const model = getChat(0).withStructuredOutput(schema);
    const input = [];
    if (system) input.push({ role: 'system', content: system });
    input.push({ role: 'user', content: prompt });
    return withBackoff(() => model.invoke(input));
  },

  async embed(texts) {
    return withBackoff(() => getEmbed().embedDocuments(texts));
  },
};

export default geminiProvider;
