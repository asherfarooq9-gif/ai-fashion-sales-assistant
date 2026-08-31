import { config } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { pushOutbound } from './outbox.js';
import { sendInstagram } from './instagram.adapter.js';
import { sendWhatsApp } from './whatsapp.adapter.js';

/**
 * sendMessage — deliver an outbound message on a channel.
 * Always records to the outbox (for the simulator SSE + tests). When the
 * transport is "live" and the channel is a real one, it also calls the platform API.
 *
 * @param {string} channel  instagram | whatsapp | simulator
 * @param {string} to        recipient id
 * @param {{ text?: string, images?: string[], meta?: object }} payload
 */
export async function sendMessage(channel, to, payload) {
  const record = pushOutbound({ channel, to, ...payload });

  const isRealChannel = channel === 'instagram' || channel === 'whatsapp';
  if (config.CHANNEL_TRANSPORT !== 'live' || !isRealChannel) {
    return { delivered: 'outbox', record };
  }

  try {
    const result =
      channel === 'instagram' ? await sendInstagram(to, payload) : await sendWhatsApp(to, payload);
    return { delivered: channel, result, record };
  } catch (err) {
    logger.error({ err, channel, to }, 'channel send failed');
    return { delivered: 'error', error: String(err?.message || err), record };
  }
}

export default sendMessage;
