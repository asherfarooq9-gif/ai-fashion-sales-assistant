import { CannedResponse } from '../../models/index.js';
import { llm } from '../llm/index.js';
import { REPLY_SYSTEM, historyBlock } from './prompts/index.js';

const money = (n) => `Rs ${Number(n).toLocaleString('en-PK')}`;

export function sellingPrice(p) {
  if (p.discountedPrice != null) return p.discountedPrice;
  return p.discount ? Math.round(p.price * (1 - p.discount / 100)) : p.price;
}

export function formatProductLines(products = []) {
  return products
    .map((p) => {
      const sell = sellingPrice(p);
      const price = sell < p.price ? `${money(sell)} (was ${money(p.price)})` : money(p.price);
      return `• ${p.name} — ${price}`;
    })
    .join('\n');
}

async function fewShotBlock(intent, language) {
  const examples = await CannedResponse.find({ isFewShot: true, enabled: true, intent })
    .select('triggerExamples responseTemplate language')
    .limit(3)
    .lean()
    .catch(() => []);
  const filtered = examples.filter((e) => !language || e.language === language);
  const use = filtered.length ? filtered : examples;
  if (!use.length) return '';
  return `\nStyle examples:\n${use
    .map((e) => `Customer: ${e.triggerExamples?.[0] || ''}\nAssistant: ${e.responseTemplate}`)
    .join('\n---\n')}\n`;
}

/**
 * generateReply — free-form sales reply, tone-matched to sentiment and language,
 * grounded in the provided products.
 */
export async function generateReply({
  text,
  intent,
  sentiment = 'neutral',
  language = 'en',
  customerName,
  products = [],
  history = [],
}) {
  const system = REPLY_SYSTEM.replace('{language}', language).replace('{sentiment}', sentiment);
  const fewShot = await fewShotBlock(intent, language);
  const productBlock = products.length
    ? `\nProducts to present:\n${formatProductLines(products)}\n`
    : '';
  const prompt = `${fewShot}${historyBlock(history)}${productBlock}
Customer${customerName ? ` (${customerName})` : ''} said: "${text}"
Write the assistant's reply.`;

  const { text: reply } = await llm().chat({
    system,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
  });
  return reply.trim();
}

export default generateReply;
