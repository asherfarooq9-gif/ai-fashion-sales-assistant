import axios from 'axios';
import { asyncHandler } from '../utils/asyncHandler.js';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';
import { handleInboundMessage } from '../services/conversation/pipeline.js';

const VERIFY_TOKEN = {
  instagram: () => config.IG_VERIFY_TOKEN,
  whatsapp: () => config.WHATSAPP_VERIFY_TOKEN,
};

/** GET /api/webhooks/:channel — Meta verification handshake. */
export const verifyWebhook = (req, res, next) => {
  const { channel } = req.params;
  const expected = VERIFY_TOKEN[channel]?.();
  if (!expected) return next(ApiError.notFound(`Unknown channel: ${channel}`));

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === expected) {
    return res.status(200).send(String(challenge));
  }
  return next(ApiError.forbidden('Webhook verification failed'));
};

/** POST /api/webhooks/:channel — receive events. */
export const receiveWebhook = asyncHandler(async (req, res) => {
  const { channel } = req.params;
  if (!VERIFY_TOKEN[channel]) throw ApiError.notFound(`Unknown channel: ${channel}`);

  // Ack fast; Meta retries on slow responses.
  res.sendStatus(200);

  try {
    if (config.ORCHESTRATION_MODE === 'n8n' && config.N8N_INBOUND_WEBHOOK_URL) {
      await axios.post(config.N8N_INBOUND_WEBHOOK_URL, { channel, payload: req.body });
      return;
    }
    await handleInboundMessage({ channel, raw: req.body, send: true });
  } catch (err) {
    logger.error({ err, channel }, 'webhook processing failed');
  }
});
