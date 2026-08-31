import axios from 'axios';
import { config } from '../../config/env.js';

const base = () =>
  `https://graph.facebook.com/${config.WHATSAPP_GRAPH_VERSION}/${config.WHATSAPP_PHONE_NUMBER_ID}/messages`;

/** Send a message to a WhatsApp user via the WhatsApp Business (Cloud) API. */
export async function sendWhatsApp(to, payload) {
  if (!config.WHATSAPP_TOKEN || !config.WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error('WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID not set');
  }
  const headers = { Authorization: `Bearer ${config.WHATSAPP_TOKEN}` };
  const bodies = [];
  if (payload.text) {
    bodies.push({ messaging_product: 'whatsapp', to, type: 'text', text: { body: payload.text } });
  }
  for (const link of payload.images || []) {
    bodies.push({
      messaging_product: 'whatsapp',
      to,
      type: 'image',
      image: { link },
    });
  }
  const results = [];
  for (const body of bodies) {
    const res = await axios.post(base(), body, { headers });
    results.push(res.data);
  }
  return results;
}

export default sendWhatsApp;
