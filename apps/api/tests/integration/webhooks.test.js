import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { startMemoryDb, stopMemoryDb, clearDb } from '../helpers/db.js';
import { seedCatalog } from '../helpers/seedProducts.js';
import { clearOutbox, getOutbox } from '../../src/services/channels/outbox.js';
import { Conversation, Message } from '../../src/models/index.js';
import { createApp } from '../../src/app.js';

const app = createApp();

beforeAll(startMemoryDb);
afterAll(stopMemoryDb);
beforeEach(async () => {
  await clearDb();
  clearOutbox();
  await seedCatalog();
});

describe('GET /api/webhooks/:channel (verify handshake)', () => {
  it('echoes the challenge when the verify token matches', async () => {
    const res = await request(app)
      .get('/api/webhooks/whatsapp')
      .query({ 'hub.mode': 'subscribe', 'hub.verify_token': 'change-me-verify', 'hub.challenge': '42' });
    expect(res.status).toBe(200);
    expect(res.text).toBe('42');
  });

  it('rejects a wrong verify token', async () => {
    const res = await request(app)
      .get('/api/webhooks/instagram')
      .query({ 'hub.mode': 'subscribe', 'hub.verify_token': 'nope', 'hub.challenge': '42' });
    expect(res.status).toBe(403);
  });
});

describe('POST /api/webhooks/whatsapp (receive)', () => {
  it('creates a conversation and replies via the outbox', async () => {
    const payload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          changes: [
            {
              value: {
                contacts: [{ profile: { name: 'Sana' }, wa_id: '923001112233' }],
                messages: [
                  { from: '923001112233', id: 'wamid.1', timestamp: '1700000000', type: 'text', text: { body: 'hi' } },
                ],
              },
            },
          ],
        },
      ],
    };
    const res = await request(app).post('/api/webhooks/whatsapp').send(payload);
    expect(res.status).toBe(200);

    await vi.waitFor(async () => {
      expect(await Conversation.countDocuments()).toBe(1);
      expect(await Message.countDocuments({ direction: 'outbound' })).toBe(1);
      expect(getOutbox({ channel: 'whatsapp' }).length).toBe(1);
    });
  });
});
