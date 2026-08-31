import { ChatOpenAI } from '@langchain/openai';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { config } from '../../config/env.js';
import { mockProvider } from './mock.provider.js';

let model;

function getModel(temperature = 0.4) {
  if (!config.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is not set');
  model ??= new ChatOpenAI({
    apiKey: config.OPENROUTER_API_KEY,
    model: config.OPENROUTER_CHAT_MODEL,
    configuration: { baseURL: config.OPENROUTER_BASE_URL },
    maxRetries: 2,
  });
  return model.bind({ temperature });
}

function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('no JSON object in response');
  return JSON.parse(candidate.slice(start, end + 1));
}

export const openrouterProvider = {
  name: 'openrouter',

  async chat({ system, messages, temperature = 0.4 }) {
    const m = getModel(temperature);
    const input = [];
    if (system) input.push({ role: 'system', content: system });
    input.push(...messages);
    const res = await m.invoke(input);
    return { text: String(res.content), usage: res.usage_metadata };
  },

  async json({ system, prompt, schema }) {
    const m = getModel(0);
    const jsonSchema = JSON.stringify(zodToJsonSchema(schema));
    const sys = `${system || ''}\nRespond ONLY with JSON matching this schema:\n${jsonSchema}`.trim();
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const res = await m.invoke([
        { role: 'system', content: sys },
        { role: 'user', content: prompt },
      ]);
      try {
        return schema.parse(extractJson(String(res.content)));
      } catch {
        if (attempt === 1) break;
      }
    }
    throw new Error('openrouter json parse failed');
  },

  // OpenRouter has no free embeddings — fall back to deterministic local vectors.
  async embed(texts) {
    return mockProvider.embed(texts);
  },
};

export default openrouterProvider;
