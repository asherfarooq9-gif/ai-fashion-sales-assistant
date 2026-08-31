import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { startMemoryDb, stopMemoryDb, clearDb } from '../helpers/db.js';
import { seedCatalog } from '../helpers/seedProducts.js';
import { handleInboundMessage } from '../../src/services/conversation/pipeline.js';
import { clearOutbox } from '../../src/services/channels/outbox.js';
import { normalizeInbound } from '../../src/services/conversation/normalize.js';
import { Order } from '../../src/models/index.js';

beforeAll(startMemoryDb);
afterAll(stopMemoryDb);
beforeEach(async () => {
  await clearDb();
  clearOutbox();
  await seedCatalog();
});

const send = (text, senderId = 'p1', extra = {}) =>
  handleInboundMessage({ channel: 'simulator', senderId, text, send: false, ...extra });

describe('pipeline branches', () => {
  it('discount inquiry lists sale items', async () => {
    const res = await send('any discount? products under 3000');
    expect(res.intent).toBe('discount_inquiry');
    expect(res.products.length).toBeGreaterThan(0);
    for (const p of res.products) expect(p.price).toBeLessThanOrEqual(3000);
  });

  it('return request answers with the policy', async () => {
    const res = await send('what is your return policy?');
    expect(res.intent).toBe('return_request');
    expect(res.reply).toMatch(/7 days/);
  });

  it('order tracking looks up the latest order', async () => {
    const first = await send("I'll take the White Sneakers");
    await send('House 9, Model Town, Lahore');
    const placed = await send('confirm');
    expect(placed.orderId).toBeTruthy();

    const track = await send('where is my parcel?');
    expect(track.reply).toMatch(placed.orderId);
    expect(first.intent).toBe('order_placement');
  });

  it('recommend attaches upsell suggestions when co-purchase data exists', async () => {
    // create co-purchase history: two products in one order
    const [a, b] = await Promise.all([
      Order.db.model('Product').findOne({ name: 'Black Slim Fit Jeans' }),
      Order.db.model('Product').findOne({ name: 'Black Leather Belt' }),
    ]);
    const cust = await Order.db.model('Customer').create({ name: 'Hist' });
    await Order.create({
      customerId: cust._id,
      items: [
        { productId: a._id, name: a.name, price: a.price, quantity: 1 },
        { productId: b._id, name: b.name, price: b.price, quantity: 1 },
      ],
    });

    const res = await send('show me black slim fit jeans');
    expect(res.reply.toLowerCase()).toContain('also');
  });

  it('voice note is transcribed then handled', async () => {
    const res = await handleInboundMessage({
      channel: 'simulator',
      senderId: 'voice1',
      text: '',
      attachments: [{ type: 'audio', url: 'note.ogg' }],
      send: false,
    });
    expect(res.intent).toBe('product_search');
    expect(res.reply).toMatch(/Rs /);
  });
});

describe('normalizeInbound', () => {
  it('parses an Instagram messaging payload', () => {
    const n = normalizeInbound('instagram', {
      entry: [{ messaging: [{ sender: { id: 'ig1' }, message: { text: 'hello' } }] }],
    });
    expect(n).toMatchObject({ channel: 'instagram', senderId: 'ig1', text: 'hello' });
  });

  it('parses a WhatsApp change payload with an interactive reply', () => {
    const n = normalizeInbound('whatsapp', {
      entry: [
        {
          changes: [
            {
              value: {
                contacts: [{ profile: { name: 'A' }, wa_id: '92300' }],
                messages: [
                  { from: '92300', interactive: { list_reply: { title: "Women's Collection" } } },
                ],
              },
            },
          ],
        },
      ],
    });
    expect(n.text).toBe("Women's Collection");
    expect(n.senderName).toBe('A');
  });
});
