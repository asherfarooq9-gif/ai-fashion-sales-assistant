import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { startMemoryDb, stopMemoryDb, clearDb } from '../helpers/db.js';
import { Product, Customer, Order, Conversation } from '../../src/models/index.js';

beforeAll(startMemoryDb);
afterAll(stopMemoryDb);
afterEach(clearDb);

describe('Product', () => {
  it('buildFilter composes gender, category, price and colors', () => {
    const filter = Product.buildFilter({
      gender: 'women',
      category: 'dresses',
      maxPrice: 5000,
      colors: ['Black', 'red'],
    });
    expect(filter).toMatchObject({
      isActive: true,
      stock: { $gt: 0 },
      gender: 'women',
      category: 'dresses',
      price: { $lte: 5000 },
      colors: { $in: ['black', 'red'] },
    });
  });

  it('lowercases colors on save and exposes discountedPrice', async () => {
    const p = await Product.create({
      name: 'Black Embroidered Maxi',
      category: 'dresses',
      price: 4999,
      colors: ['Black'],
      discount: 10,
      stock: 5,
    });
    expect(p.colors).toEqual(['black']);
    expect(p.discountedPrice).toBe(4499);
  });
});

describe('Customer.findOrCreateByChannel', () => {
  it('creates once then returns the same doc', async () => {
    const a = await Customer.findOrCreateByChannel({
      channel: 'whatsapp',
      senderId: '9230000',
      name: 'Sara',
    });
    const b = await Customer.findOrCreateByChannel({ channel: 'whatsapp', senderId: '9230000' });
    expect(String(a._id)).toBe(String(b._id));
    expect(b.name).toBe('Sara');
    expect(await Customer.countDocuments()).toBe(1);
  });
});

describe('Order', () => {
  it('generates an orderId and computes totals in a pre-validate hook', async () => {
    const c = await Customer.create({ name: 'Test' });
    const order = await Order.create({
      customerId: c._id,
      items: [{ name: 'Maxi', price: 4499, quantity: 2 }],
      discountTotal: 1000,
    });
    expect(order.orderId).toMatch(/^AFS-\d{8}-\d{4}$/);
    expect(order.subtotal).toBe(8998);
    expect(order.total).toBe(8998);
  });

  it('genTracking has the TRK prefix', () => {
    expect(Order.genTracking()).toMatch(/^TRK[0-9A-Z]{9}$/);
  });
});

describe('Conversation.getOpen', () => {
  it('reuses an open conversation per customer+channel', async () => {
    const c = await Customer.create({ name: 'Test' });
    const a = await Conversation.getOpen({ customerId: c._id, channel: 'simulator' });
    const b = await Conversation.getOpen({ customerId: c._id, channel: 'simulator' });
    expect(String(a._id)).toBe(String(b._id));
  });
});
