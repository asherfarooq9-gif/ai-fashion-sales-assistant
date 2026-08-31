import clsx from 'clsx';
import { Badge } from '../ui.jsx';

export default function MessageBubble({ message }) {
  const outbound = message.direction === 'outbound';
  return (
    <div className={clsx('flex', outbound ? 'justify-start' : 'justify-end')}>
      <div className={clsx('max-w-[80%] rounded-2xl px-3.5 py-2 text-sm', outbound ? 'bg-white border border-black/10' : 'bg-blush-600 text-white')}>
        <p className="whitespace-pre-wrap">{message.text}</p>
        {(message.intent || message.sentiment) && (
          <div className="mt-1.5 flex gap-1">
            {message.intent && <Badge tone="gray">{message.intent}</Badge>}
            {message.sentiment && <Badge tone="gray">{message.sentiment}</Badge>}
          </div>
        )}
      </div>
    </div>
  );
}
