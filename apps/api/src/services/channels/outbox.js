import { EventEmitter } from 'node:events';

/**
 * In-memory outbox + event bus for outbound messages. Used by the simulator SSE
 * stream and by tests (CHANNEL_TRANSPORT=stub) to assert what the bot sent.
 */
export const outboxEvents = new EventEmitter();
outboxEvents.setMaxListeners(50);

const messages = [];

export function pushOutbound(entry) {
  const record = { ...entry, at: Date.now() };
  messages.push(record);
  if (messages.length > 500) messages.shift();
  outboxEvents.emit('message', record);
  return record;
}

export function getOutbox({ channel, senderId } = {}) {
  return messages.filter(
    (m) => (!channel || m.channel === channel) && (!senderId || m.to === senderId)
  );
}

export function clearOutbox() {
  messages.length = 0;
}
