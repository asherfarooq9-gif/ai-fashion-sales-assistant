import crypto from 'node:crypto';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';

const SECRET_BY_CHANNEL = {
  instagram: () => config.IG_APP_SECRET,
  whatsapp: () => config.WHATSAPP_TOKEN,
};

/**
 * Verify the X-Hub-Signature-256 header Meta sends with webhook events.
 * Skipped when no app secret is configured (local/dev) so the simulator path
 * and tests still work.
 */
export function verifyMetaSignature(req, _res, next) {
  const channel = req.params.channel;
  const secret = SECRET_BY_CHANNEL[channel]?.();
  if (!secret) {
    logger.debug({ channel }, 'meta signature check skipped (no secret configured)');
    return next();
  }
  const header = req.get('x-hub-signature-256') || '';
  const expected =
    'sha256=' + crypto.createHmac('sha256', secret).update(req.rawBody || Buffer.from('')).digest('hex');
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return next(ApiError.forbidden('Invalid webhook signature'));
  }
  return next();
}

export default verifyMetaSignature;
