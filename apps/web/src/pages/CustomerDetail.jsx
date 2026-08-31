import { useParams, Link } from 'react-router-dom';
import { customers } from '../api/resources.js';
import { useAsync } from '../hooks/useAsync.js';
import { PageHeader, DataTable, Badge, money } from '../components/ui.jsx';

export default function CustomerDetail() {
  const { id } = useParams();
  const { data: c, loading } = useAsync(() => customers.get(id), [id]);

  if (loading || !c) return <p className="text-sm text-black/40">Loading…</p>;

  return (
    <div>
      <PageHeader title={c.name || 'Customer'} subtitle={c.instagramId || c.whatsappId || c.phone} />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <p className="mb-2 text-sm font-semibold text-black/60">Profile</p>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-black/40">Language</dt><dd>{c.language}</dd></div>
            <div className="flex justify-between"><dt className="text-black/40">Favourite colour</dt><dd>{c.preferences?.favoriteColor || '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-black/40">Budget</dt><dd>{c.preferences?.budget ? money(c.preferences.budget) : '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-black/40">Categories</dt><dd>{(c.preferences?.categories || []).join(', ') || '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-black/40">Address</dt><dd className="text-right">{c.address?.raw || '—'}</dd></div>
          </dl>
        </div>
        <div className="card p-5">
          <p className="mb-2 text-sm font-semibold text-black/60">Conversations</p>
          {(c.conversations || []).length === 0 && <p className="text-sm text-black/40">None yet</p>}
          <ul className="space-y-2 text-sm">
            {(c.conversations || []).map((conv) => (
              <li key={conv._id}>
                <Link to={`/conversations/${conv._id}`} className="text-blush-700 hover:underline">
                  {conv.channel} · {conv.state}
                </Link>{' '}
                {conv.needsHuman && <Badge tone="red">needs human</Badge>}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mb-2 mt-6 text-sm font-semibold text-black/60">Order history</p>
      <DataTable
        columns={[
          { key: 'orderId', header: 'Order' },
          { key: 'status', header: 'Status', render: (o) => <Badge tone="blue">{o.status}</Badge> },
          { key: 'total', header: 'Total', render: (o) => money(o.total) },
          { key: 'trackingNumber', header: 'Tracking' },
        ]}
        rows={c.orderHistory}
        empty="No orders yet"
      />
    </div>
  );
}
