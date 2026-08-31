import { useParams } from 'react-router-dom';
import { conversations } from '../api/resources.js';
import { useAsync } from '../hooks/useAsync.js';
import { PageHeader, Badge } from '../components/ui.jsx';
import MessageBubble from '../components/chat/MessageBubble.jsx';

export default function ConversationDetail() {
  const { id } = useParams();
  const { data: c, loading } = useAsync(() => conversations.get(id), [id]);

  if (loading || !c) return <p className="text-sm text-black/40">Loading…</p>;

  return (
    <div>
      <PageHeader
        title={c.customerId?.name || 'Conversation'}
        subtitle={`${c.channel} · ${c.state}`}
        action={c.needsHuman ? <Badge tone="red">needs human</Badge> : null}
      />
      <div className="card space-y-3 p-5">
        {(c.messages || []).map((m) => (
          <MessageBubble key={m._id} message={m} />
        ))}
      </div>
    </div>
  );
}
