/**
 * normalizeInbound — turn a raw channel payload into a common shape:
 * { channel, senderId, senderName, text, attachments:[{type,url}], timestamp }
 */
export function normalizeInbound(channel, raw = {}) {
  if (channel === 'simulator') {
    return {
      channel,
      senderId: String(raw.senderId || 'sim-user'),
      senderName: raw.senderName,
      text: raw.text || '',
      attachments: raw.attachments || [],
      timestamp: Date.now(),
    };
  }

  if (channel === 'instagram') {
    const entry = raw.entry?.[0];
    const messaging = entry?.messaging?.[0];
    const msg = messaging?.message || {};
    return {
      channel,
      senderId: String(messaging?.sender?.id || ''),
      senderName: undefined,
      text: msg.text || '',
      attachments: (msg.attachments || []).map((a) => ({
        type: a.type,
        url: a.payload?.url,
      })),
      timestamp: messaging?.timestamp || Date.now(),
    };
  }

  if (channel === 'whatsapp') {
    const value = raw.entry?.[0]?.changes?.[0]?.value || {};
    const message = value.messages?.[0] || {};
    const contact = value.contacts?.[0];
    const text =
      message.text?.body ||
      message.button?.text ||
      message.interactive?.list_reply?.title ||
      message.interactive?.button_reply?.title ||
      '';
    const attachments = [];
    if (message.audio) attachments.push({ type: 'audio', url: message.audio.id });
    if (message.image) attachments.push({ type: 'image', url: message.image.id });
    return {
      channel,
      senderId: String(message.from || contact?.wa_id || ''),
      senderName: contact?.profile?.name,
      text,
      attachments,
      timestamp: message.timestamp ? Number(message.timestamp) * 1000 : Date.now(),
    };
  }

  throw new Error(`cannot normalize channel: ${channel}`);
}

export default normalizeInbound;
