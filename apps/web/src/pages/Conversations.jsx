import { useNavigate } from 'react-router-dom';
import { conversations } from '../api/resources.js';
import { useAsync } from '../hooks/useAsync.js';
import { PageHeader, DataTable, Badge } from '../components/ui.jsx';

const SENTIMENT_TONE = {
  happy: 'green',
  interested_buyer: 'pink',
  angry: 'red',
  frustrated: 'amber',
  neutral: 'gray',
};

export default function Conversations() {
  const navigate = useNavigate();
  const { data, loading } = useAsync(() => conversations.list({ limit: 100 }));

  const columns = [
    { key: 'customer', header: 'Customer', render: (c) => c.customerId?.name || c.customerId?.instagramId || '—' },
    { key: 'channel', header: 'Channel', render: (c) => <Badge tone="pink">{c.channel}</Badge> },
    { key: 'state', header: 'State' },
    { key: 'lastIntent', header: 'Last intent', render: (c) => c.lastIntent || '—' },
    {
      key: 'lastSentiment',
      header: 'Sentiment',
      render: (c) => (c.lastSentiment ? <Badge tone={SENTIMENT_TONE[c.lastSentiment]}>{c.lastSentiment}</Badge> : '—'),
    },
    { key: 'needsHuman', header: '', render: (c) => (c.needsHuman ? <Badge tone="red">needs human</Badge> : null) },
  ];

  return (
    <div>
      <PageHeader title="Conversations" subtitle={`${data?.meta.total ?? 0} threads`} />
      {loading ? (
        <p className="text-sm text-black/40">Loading…</p>
      ) : (
        <DataTable columns={columns} rows={data?.data} onRowClick={(c) => navigate(`/conversations/${c._id}`)} />
      )}
    </div>
  );
}
