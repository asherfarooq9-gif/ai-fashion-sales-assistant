import crypto from 'node:crypto';
import { config } from '../../config/env.js';

const DIMS = config.EMBEDDING_DIMS;

const COLORS = [
  'black', 'white', 'red', 'maroon', 'navy', 'blue', 'beige', 'olive', 'mustard',
  'pink', 'teal', 'grey', 'gray', 'cream', 'green', 'ivory', 'tan', 'peach', 'brown',
];
const CATEGORY_WORDS = {
  dresses: ['dress', 'maxi', 'gown', 'frock'],
  kurtas: ['kurta', 'kurti'],
  shalwar_kameez: ['shalwar', 'kameez', 'shalwar kameez'],
  lawn_suits: ['lawn', 'suit', '3-piece', 'three piece'],
  tops: ['top', 'shirt', 'tee', 't-shirt', 'blouse'],
  bottoms: ['trouser', 'jeans', 'pants', 'bottom', 'palazzo'],
  outerwear: ['jacket', 'coat', 'waistcoat', 'shrug'],
  footwear: ['shoe', 'shoes', 'heel', 'khussa', 'sneaker', 'sandal'],
  accessories: ['bag', 'handbag', 'clutch', 'belt', 'scarf', 'dupatta', 'jewellery', 'jewelry'],
};
const PRODUCT_NOUNS = Object.values(CATEGORY_WORDS).flat();
const SIZE_MAP = {
  xs: 'XS', s: 'S', m: 'M', l: 'L', xl: 'XL', xxl: 'XXL',
  small: 'S', medium: 'M', large: 'L', 'extra large': 'XL',
};

const has = (t, ...words) => words.some((w) => t.includes(w));

export function classifyIntent(text = '') {
  const t = text.toLowerCase().trim();

  if (/^(hi|hello|hey|yo|salam|assalam|aoa|assalam o alaikum|assalamualaikum|good (morning|evening|afternoon))\b/.test(t) || t === 'hi' || t === 'hello') {
    return 'greeting';
  }
  if (has(t, 'track', 'parcel', 'tracking id', 'tracking number', 'order status', 'where is my', 'my order')) {
    return 'delivery_inquiry';
  }
  if (has(t, 'return policy', 'return', 'exchange', 'refund')) return 'return_request';
  if (has(t, 'damaged', 'wrong product', 'wrong item', 'broken', 'torn', 'defective', 'unacceptable', 'poor quality', 'stained')) {
    return 'complaint';
  }
  if (has(t, 'place an order', 'place order', 'how can i order', 'how do i order', 'how to order', "i'll take", 'i will take', 'i want to order', 'order kar', 'confirm my order', 'checkout')) {
    return 'order_placement';
  }
  if (has(t, 'delivery', 'deliver', 'shipping', 'same day', 'how many days', 'how long', 'dispatch')) {
    return 'delivery_inquiry';
  }
  const productNounPresent = has(t, ...PRODUCT_NOUNS);
  if (has(t, 'discount', 'sale', 'cheapest', 'cheap') || (/under\s*(rs|pkr|\d)/.test(t) && !productNounPresent) || t === 'price?' || t === 'price' || /^any /.test(t)) {
    return 'discount_inquiry';
  }
  return 'product_search';
}

export function classifySentiment(text = '') {
  const t = text.toLowerCase();
  if (has(t, 'angry', 'furious', 'unacceptable', 'terrible', 'worst', 'ridiculous', 'pathetic', 'scam') || /!!!/.test(t)) {
    return { sentiment: 'angry', score: -0.8 };
  }
  if (has(t, 'still waiting', 'disappointed', 'frustrated', 'again', 'not yet', 'too late', 'delayed', 'why is')) {
    return { sentiment: 'frustrated', score: -0.4 };
  }
  if (has(t, "i'll take", 'i want to buy', 'interested', 'how do i order', 'place an order', 'looks great', 'love this', 'want this')) {
    return { sentiment: 'interested_buyer', score: 0.6 };
  }
  if (has(t, 'thank', 'thanks', 'great', 'awesome', 'perfect', 'love it', 'amazing', 'good')) {
    return { sentiment: 'happy', score: 0.7 };
  }
  return { sentiment: 'neutral', score: 0 };
}

export function extractEntities(text = '') {
  const t = text.toLowerCase();
  const entities = {};
  const color = COLORS.find((c) => t.includes(c));
  if (color) entities.color = color === 'gray' ? 'grey' : color;
  for (const [cat, words] of Object.entries(CATEGORY_WORDS)) {
    if (has(t, ...words)) {
      entities.category = cat;
      break;
    }
  }
  if (has(t, "women", "women's", 'ladies', 'girl')) entities.gender = 'women';
  else if (has(t, "men", "men's", 'gents', 'boy')) entities.gender = 'men';
  const sizeKey = Object.keys(SIZE_MAP).find((k) => new RegExp(`\\b${k}\\b`).test(t));
  if (sizeKey) entities.size = SIZE_MAP[sizeKey];
  const budget = t.match(/(?:under|below|less than|upto|up to)\s*(?:rs\.?|pkr)?\s*(\d[\d,]*)/);
  if (budget) entities.budget = Number(budget[1].replace(/,/g, ''));
  const qty = t.match(/\b(\d+)\s*(x|pcs|pieces|of)?\b/);
  if (qty) entities.quantity = Number(qty[1]);
  const orderId = text.match(/\b(AFS-\d{8}-\d{4}|TRK[0-9A-Z]{6,})\b/i);
  if (orderId) entities.orderId = orderId[1].toUpperCase();
  return entities;
}

function looksLikeAddress(text = '') {
  const t = text.toLowerCase();
  return has(t, 'house', 'street', 'block', 'sector', 'road', 'gulberg', 'dha', 'phase', 'town', 'colony', 'lahore', 'karachi', 'islamabad', 'rawalpindi', 'faisalabad', 'multan', 'peshawar');
}

function pseudoVector(text) {
  const vec = new Array(DIMS).fill(0);
  const tokens = String(text).toLowerCase().match(/[a-z0-9]+/g) || [];
  for (const tok of tokens) {
    const hash = crypto.createHash('md5').update(tok).digest();
    for (let i = 0; i < hash.length; i += 2) {
      const idx = ((hash[i] << 8) | hash[i + 1]) % DIMS;
      vec[idx] += 1;
    }
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

export const mockProvider = {
  name: 'mock',

  async chat({ system = '', messages = [] }) {
    const last = messages.filter((m) => m.role === 'user').at(-1)?.content || '';
    return { text: `[mock reply] ${system ? '' : ''}${last}`.trim(), usage: { inputTokens: 0, outputTokens: 0 } };
  },

  async json({ task, input = '', schema }) {
    let result;
    if (task === 'intent') {
      const intent = classifyIntent(input);
      result = { intent, confidence: 0.9, entities: { ...extractEntities(input), action: null } };
    } else if (task === 'sentiment') {
      result = classifySentiment(input);
    } else if (task === 'orderExtract') {
      const e = extractEntities(input);
      const nameMatch = String(input).match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})\b/);
      const productName = nameMatch ? nameMatch[1] : e.category || null;
      const items = [];
      if (productName || e.color || e.size) {
        items.push({
          productName,
          size: e.size || null,
          color: e.color || null,
          quantity: e.quantity || 1,
        });
      }
      result = {
        items,
        addressText: looksLikeAddress(input) ? input : null,
        confirm: /\b(confirm|yes|place (the )?order|go ahead|proceed)\b/i.test(input),
      };
    } else {
      result = {};
    }
    return schema ? schema.parse(result) : result;
  },

  async embed(texts) {
    return texts.map(pseudoVector);
  },
};

export default mockProvider;
