import { useNavigate } from 'react-router-dom';
import { customers } from '../api/resources.js';
import { useAsync } from '../hooks/useAsync.js';
import { PageHeader, DataTable, Badge } from '../components/ui.jsx';

export default function Customers() {
  const navigate = useNavigate();
  const { data, loading } = useAsync(() => customers.list({ limit: 100 }));

  const columns = [
    { key: 'name', header: 'Name', render: (c) => c.name || '—' },
    { key: 'channel', header: 'Handle', render: (c) => c.instagramId || c.whatsappId || c.phone || '—' },
    { key: 'language', header: 'Lang', render: (c) => <Badge>{c.language}</Badge> },
    {
      key: 'pref',
      header: 'Preferences',
      render: (c) =>
        c.preferences
          ? `${c.preferences.gender || '—'} · ${c.preferences.favoriteColor || '—'} · budget ${
              c.preferences.budget || '—'
            }`
          : '—',
    },
    { key: 'orders', header: 'Orders', render: (c) => c.orderHistory?.length || 0 },
  ];

  return (
    <div>
      <PageHeader title="Customers" subtitle={`${data?.meta.total ?? 0} people`} />
      {loading ? (
        <p className="text-sm text-black/40">Loading…</p>
      ) : (
        <DataTable columns={columns} rows={data?.data} onRowClick={(c) => navigate(`/customers/${c._id}`)} />
      )}
    </div>
  );
}
