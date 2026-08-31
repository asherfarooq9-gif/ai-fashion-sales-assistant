import { describe, it, expect } from 'vitest';
import { extractOrder } from '../../src/services/ai/orderExtract.chain.js';

describe('extractOrder (mock provider)', () => {
  it('pulls quantity, colour and size from a buy message', async () => {
    const res = await extractOrder('I want 2 black kurtas in medium');
    expect(res.items).toHaveLength(1);
    expect(res.items[0]).toMatchObject({ color: 'black', size: 'M', quantity: 2 });
  });

  it('detects an address-only message', async () => {
    const res = await extractOrder('House 12, Gulberg, Lahore');
    expect(res.addressText).toMatch(/Gulberg/);
    expect(res.items).toHaveLength(0);
  });

  it('sets confirm on an explicit confirmation', async () => {
    const res = await extractOrder('yes please confirm the order');
    expect(res.confirm).toBe(true);
  });
});
