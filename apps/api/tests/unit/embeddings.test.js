import { describe, it, expect, afterEach } from 'vitest';
import { cosine } from '../../src/utils/cosine.js';
import { embedTexts, clearEmbedCache } from '../../src/services/embeddings/embed.js';

afterEach(clearEmbedCache);

describe('cosine', () => {
  it('is 1 for identical vectors and 0 for orthogonal', () => {
    expect(cosine([1, 0, 0], [1, 0, 0])).toBeCloseTo(1);
    expect(cosine([1, 0, 0], [0, 1, 0])).toBeCloseTo(0);
  });
  it('handles mismatched lengths', () => {
    expect(cosine([1, 2], [1, 2, 3])).toBe(0);
  });
});

describe('embedTexts (mock provider)', () => {
  it('is deterministic and self-similar', async () => {
    const [a] = await embedTexts(['black embroidered maxi dress']);
    const [b] = await embedTexts(['black embroidered maxi dress']);
    expect(cosine(a, b)).toBeCloseTo(1);
  });

  it('ranks a near-duplicate above an unrelated string', async () => {
    const [q, near, far] = await embedTexts([
      'black formal dress for a wedding',
      'black embroidered formal maxi dress wedding',
      'blue denim mens cargo pants',
    ]);
    expect(cosine(q, near)).toBeGreaterThan(cosine(q, far));
  });
});
