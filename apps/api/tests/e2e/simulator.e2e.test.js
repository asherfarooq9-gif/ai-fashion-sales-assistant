import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { startMemoryDb, stopMemoryDb, clearDb } from '../helpers/db.js';
import { seedCatalog } from '../helpers/seedProducts.js';
import { handleInboundMessage } from '../../src/services/conversation/pipeline.js';
import { clearOutbox, getOutbox } from '../../src/services/channels/outbox.js';
import { Order, Customer } from '../../src/models/index.js';

beforeAll(startMemoryDb);
afterAll(stopMemoryDb);
beforeEach(async () => {
  await clearDb();
  clearOutbox();
  await seedCatalog();
});

const send = (text) =>
  handleInboundMessage({ channel: 'simulator', senderId: 'shopper-1', text, send: true });

describe('simulator happy path: hi -> browse -> order -> address -> confirm', () => {
  it('walks a customer through to a placed order', async () => {
    const greet = await send('hi');
    expect(greet.intent).toBe('greeting');
    expect(greet.reply).toMatch(/New Arrivals/);

    const browse = await send('show me women\'s dresses under 5000');
    expect(browse.intent).toBe('product_search');
    expect(browse.reply).toMatch(/Black Embroidered Maxi/);
    expect(browse.reply).toMatch(/4,999/);
    expect(browse.reply).toMatch(/pictures/i);

    const order = await send('I\'ll take the Black Embroidered Maxi in M');
    expect(['order_placement', 'product_search']).toContain(order.intent);
    expect(order.reply).toMatch(/address/i);

    const address = await send('House 12, Gulberg, Lahore');
    expect(address.reply).toMatch(/confirm/i);

    const confirm = await send('confirm');
    expect(confirm.orderId).toMatch(/^AFS-\d{8}-\d{4}$/);
    expect(confirm.reply).toMatch(/Tracking/i);

    const orders = await Order.find();
    expect(orders).toHaveLength(1);
    expect(orders[0].items[0].name).toBe('Black Embroidered Maxi');
    expect(orders[0].total).toBe(4499); // 4999 - 10% discount

    const customer = await Customer.findOne({ instagramId: 'shopper-1' });
    expect(customer.orderHistory).toHaveLength(1);

    expect(getOutbox({ channel: 'simulator' }).length).toBeGreaterThanOrEqual(5);
  });
});

describe('other intents', () => {
  it('answers delivery questions deterministically', async () => {
    const res = await send('delivery charges?');
    expect(res.intent).toBe('delivery_inquiry');
    expect(res.reply).toMatch(/Rs 199/);
  });

  it('flags complaints for a human', async () => {
    const res = await send('I received a damaged item and I am furious');
    expect(res.intent).toBe('complaint');
    expect(res.state).toBe('SUPPORT');
  });

  it('responds in Urdu to an Urdu message', async () => {
    const res = await send('mujhe kali dress chahiye kitne ki hai');
    expect(res.reply).toMatch(/[؀-ۿ]/);
  });
});
