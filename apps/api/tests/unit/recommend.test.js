import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { startMemoryDb, stopMemoryDb, clearDb } from '../helpers/db.js';
import { seedCatalog } from '../helpers/seedProducts.js';
import { recommendProducts } from '../../src/services/ai/recommend.js';

beforeAll(startMemoryDb);
afterAll(stopMemoryDb);
beforeEach(async () => {
  await clearDb();
  await seedCatalog();
});

describe('recommendProducts', () => {
  it('respects a budget cap', async () => {
    const picks = await recommendProducts({ entities: { budget: 2000 }, queryText: 'kurta', limit: 5 });
    expect(picks.length).toBeGreaterThan(0);
    for (const p of picks) expect(p.discountedPrice ?? p.price).toBeLessThanOrEqual(2000);
  });

  it('respects gender', async () => {
    const picks = await recommendProducts({ entities: { gender: 'men' }, queryText: 'shirt', limit: 5 });
    for (const p of picks) expect(['men', 'unisex']).toContain(p.gender);
  });

  it('finds the Black Embroidered Maxi for an Eid black dress query', async () => {
    const picks = await recommendProducts({
      entities: { gender: 'women', color: 'black', category: 'dresses' },
      queryText: 'black dress for Eid',
      limit: 3,
    });
    const names = picks.map((p) => p.name);
    expect(names).toContain('Black Embroidered Maxi');
  });

  it('falls back to trending when no query text is given', async () => {
    const picks = await recommendProducts({ entities: {}, limit: 3 });
    expect(picks.length).toBe(3);
    const sales = picks.map((p) => p.salesCount);
    expect(sales[0]).toBeGreaterThanOrEqual(sales[sales.length - 1]);
  });
});
