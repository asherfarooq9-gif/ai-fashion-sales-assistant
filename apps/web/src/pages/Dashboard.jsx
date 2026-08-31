import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { products, customers, orders, conversations } from '../api/resources.js';
import { useAsync } from '../hooks/useAsync.js';
import { PageHeader, StatCard, money } from '../components/ui.jsx';

export default function Dashboard() {
  const { data } = useAsync(async () => {
    const [p, c, o, conv] = await Promise.all([
      products.list({ limit: 1 }),
      customers.list({ limit: 1 }),
      orders.list({ limit: 100 }),
      conversations.list({ limit: 1 }),
    ]);
    return { p, c, o, conv };
  });

  const orderRows = data?.o.data || [];
  const revenue = orderRows.reduce((s, o) => s + (o.total || 0), 0);
  const byStatus = Object.entries(
    orderRows.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ status, count }));

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Store overview" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Products" value={data?.p.meta.total ?? '—'} />
        <StatCard label="Customers" value={data?.c.meta.total ?? '—'} />
        <StatCard label="Orders" value={data?.o.meta.total ?? '—'} />
        <StatCard label="Conversations" value={data?.conv.meta.total ?? '—'} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <p className="mb-3 text-sm font-semibold text-black/60">Orders by status</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#00000010" />
                <XAxis dataKey="status" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#cf436e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <StatCard label="Revenue (all orders)" value={money(revenue)} hint="COD + paid" />
      </div>
    </div>
  );
}
