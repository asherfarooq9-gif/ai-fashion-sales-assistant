import { describe, it, expect } from 'vitest';
import { detectSentiment } from '../../src/services/ai/sentiment.chain.js';

const cases = [
  ['This is unacceptable, worst service ever!!!', 'angry'],
  ['I am still waiting for my parcel, so disappointed', 'frustrated'],
  ["I'll take the black maxi, how do I order?", 'interested_buyer'],
  ['Thank you so much, the dress is perfect!', 'happy'],
  ['What sizes do you have?', 'neutral'],
];

describe('detectSentiment (mock provider)', () => {
  it.each(cases)('classifies %j as %s', async (text, expected) => {
    const { sentiment } = await detectSentiment(text);
    expect(sentiment).toBe(expected);
  });

  it('returns a score in range', async () => {
    const { score } = await detectSentiment('worst!!!');
    expect(score).toBeLessThanOrEqual(1);
    expect(score).toBeGreaterThanOrEqual(-1);
  });
});
