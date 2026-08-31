import { asyncHandler } from '../utils/asyncHandler.js';
import { handleInboundMessage } from '../services/conversation/pipeline.js';
import { outboxEvents } from '../services/channels/outbox.js';

/** POST /api/chat/ingest — run the pipeline for one message. */
export const ingest = asyncHandler(async (req, res) => {
  const { channel, senderId, senderName, text, attachments, send } = req.body;
  const result = await handleInboundMessage({
    channel,
    senderId,
    senderName,
    text,
    attachments,
    send: Boolean(send),
  });
  res.json({ data: result });
});

/** GET /api/chat/stream — Server-Sent Events feed of outbound messages. */
export const stream = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write(': connected\n\n');

  const channel = req.query.channel;
  const onMessage = (msg) => {
    if (channel && msg.channel !== channel) return;
    res.write(`data: ${JSON.stringify(msg)}\n\n`);
  };
  outboxEvents.on('message', onMessage);

  const ping = setInterval(() => res.write(': ping\n\n'), 25000);
  req.on('close', () => {
    clearInterval(ping);
    outboxEvents.off('message', onMessage);
  });
};
