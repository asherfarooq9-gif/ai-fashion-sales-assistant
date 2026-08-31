import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startMemoryDb, stopMemoryDb } from '../helpers/db.js';
import { exampleQueries } from '@afsa/eval';
import { detectIntent } from '../../src/services/ai/intent.chain.js';
import { INTENTS } from '@afsa/shared/enums';

beforeAll(startMemoryDb);
afterAll(stopMemoryDb);

describe('detectIntent over the spec corpus (mock provider)', () => {
  it('classifies at least 90% of the corpus correctly', async () => {
    const results = await Promise.all(
      exampleQueries.map(async (q) => ({
        q,
        got: (await detectIntent(q.text)).intent,
      }))
    );
    const correct = results.filter((r) => r.got === r.q.expectIntent);
    const accuracy = correct.length / results.length;
    const misses = results.filter((r) => r.got !== r.q.expectIntent);
    if (accuracy < 0.9) {
      process.stdout.write(
        `intent misses: ${misses
          .map((m) => `"${m.q.text}" -> ${m.got} (want ${m.q.expectIntent})`)
          .join('; ')}\n`
      );
    }
    expect(accuracy).toBeGreaterThanOrEqual(0.9);
  });

  it('exercises every intent label somewhere in the corpus', () => {
    const covered = new Set(exampleQueries.map((q) => q.expectIntent));
    for (const intent of INTENTS) expect(covered.has(intent)).toBe(true);
  });

  it('extracts entities: colour, budget and size', async () => {
    const { entities } = await detectIntent('Show me black dresses under 5000 in medium');
    expect(entities.color).toBe('black');
    expect(entities.budget).toBe(5000);
    expect(entities.size).toBe('M');
  });
});
