import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { startMemoryDb, stopMemoryDb, clearDb } from '../helpers/db.js';
import { seedCatalog, seedAdmin } from '../helpers/seedProducts.js';
import { createApp } from '../../src/app.js';

const app = createApp();

beforeAll(startMemoryDb);
afterAll(stopMemoryDb);
beforeEach(async () => {
  await clearDb();
  await seedCatalog();
  await seedAdmin('admin@brand.test', 'secret123');
});

async function token() {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@brand.test', password: 'secret123' });
  return res.body.token;
}

describe('auth', () => {
  it('issues a token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@brand.test', password: 'secret123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it('rejects bad credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@brand.test', password: 'wrong' });
    expect(res.status).toBe(401);
  });
});

describe('products', () => {
  it('lists products publicly with filters', async () => {
    const res = await request(app).get('/api/products').query({ gender: 'women', maxPrice: 5000 });
    expect(res.status).toBe(200);
    const names = res.body.data.map((p) => p.name);
    expect(names).toContain('Black Embroidered Maxi');
    for (const p of res.body.data) expect(p.price).toBeLessThanOrEqual(5000);
  });

  it('requires auth to create', async () => {
    const res = await request(app).post('/api/products').send({ name: 'X', category: 'tops', price: 10 });
    expect(res.status).toBe(401);
  });

  it('creates a product with a valid token', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${await token()}`)
      .send({ name: 'Test Kurti', category: 'kurtas', price: 1500, gender: 'women', stock: 5 });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Test Kurti');
  });

  it('validation errors use the error envelope', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${await token()}`)
      .send({ name: 'X', category: 'not-a-category', price: -1 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('validation_error');
  });
});

describe('chat ingest + export', () => {
  it('runs the pipeline through the internal endpoint', async () => {
    const res = await request(app)
      .post('/api/chat/ingest')
      .set('x-internal-token', 'change-me-internal')
      .send({ channel: 'simulator', senderId: 'u1', text: 'hi' });
    expect(res.status).toBe(200);
    expect(res.body.data.intent).toBe('greeting');
  });

  it('exports products as CSV', async () => {
    const res = await request(app)
      .get('/api/export/products/csv')
      .set('Authorization', `Bearer ${await token()}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/csv/);
    expect(res.text.split('\n').length).toBeGreaterThan(10);
  });
});
