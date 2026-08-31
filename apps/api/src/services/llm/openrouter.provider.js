import { ChatOpenAI } from '@langchain/openai';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { config } from '../../config/env.js';
import { mockProvider } from './mock.provider.js';

const modelByTemp = new Map();

function modelFor(temperature = 0.4) {
  if (!config.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is not set');
  const key = String(temperature);
  if (!modelByTemp.has(key)) {
    modelByTemp.set(
      key,
      new ChatOpenAI({
        apiKey: config.OPENROUTER_API_KEY,
        model: config.OPENROUTER_CHAT_MODEL,
        temperature,
        configuration: { baseURL: config.OPENROUTER_BASE_URL },
        maxRetries: 2,
      })
    );
  }
  return modelByTemp.get(key);
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
    const input = [];
    if (system) input.push({ role: 'system', content: system });
    input.push(...messages);
    const res = await modelFor(temperature).invoke(input);
    return { text: String(res.content), usage: res.usage_metadata };
  },

  async json({ system, prompt, schema }) {
    const model = modelFor(0);
    const jsonSchema = JSON.stringify(zodToJsonSchema(schema));
    const sys = `${system || ''}\nRespond ONLY with JSON matching this schema:\n${jsonSchema}`.trim();
    let lastErr;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const res = await model.invoke([
        { role: 'system', content: sys },
        { role: 'user', content: prompt },
      ]);
      try {
        return schema.parse(extractJson(String(res.content)));
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr || new Error('openrouter json parse failed');
  },

  // OpenRouter has no free embeddings — fall back to deterministic local vectors.
  async embed(texts) {
    return mockProvider.embed(texts);
  },
};

export default openrouterProvider;
