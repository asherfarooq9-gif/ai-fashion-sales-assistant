import axios from 'axios';
import { config } from '../../config/env.js';

const base = () =>
  `https://graph.facebook.com/${config.IG_GRAPH_VERSION}/me/messages`;

/** Send a message to an Instagram user via the Graph API. */
export async function sendInstagram(to, payload) {
  if (!config.IG_PAGE_ACCESS_TOKEN) throw new Error('IG_PAGE_ACCESS_TOKEN is not set');
  const messages = [];
  if (payload.text) messages.push({ text: payload.text });
  for (const url of payload.images || []) {
    messages.push({ attachment: { type: 'image', payload: { url } } });
  }
  const results = [];
  for (const message of messages) {
    const res = await axios.post(
      base(),
      { recipient: { id: to }, message },
      { params: { access_token: config.IG_PAGE_ACCESS_TOKEN } }
    );
    results.push(res.data);
  }
  return results;
}

export default sendInstagram;
