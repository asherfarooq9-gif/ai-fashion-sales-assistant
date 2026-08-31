import { useState } from 'react';
import toast from 'react-hot-toast';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '@afsa/shared/enums';
import { orders } from '../api/resources.js';
import { useAsync } from '../hooks/useAsync.js';
import { PageHeader, DataTable, Badge, Modal, money } from '../components/ui.jsx';

const STATUS_TONE = {
  pending: 'amber',
  confirmed: 'blue',
  packed: 'blue',
  shipped: 'blue',
  delivered: 'green',
  cancelled: 'red',
  returned: 'red',
};

export default function Orders() {
  const { data, loading, reload } = useAsync(() => orders.list({ limit: 100 }));
  const [active, setActive] = useState(null);

  async function patch(id, body) {
    await orders.update(id, body);
    toast.success('Order updated');
    reload();
    setActive((a) => (a ? { ...a, ...body } : a));
  }

  const columns = [
    { key: 'orderId', header: 'Order' },
    { key: 'customer', header: 'Customer', render: (o) => o.customerId?.name || '—' },
    { key: 'total', header: 'Total', render: (o) => money(o.total) },
    { key: 'status', header: 'Status', render: (o) => <Badge tone={STATUS_TONE[o.status]}>{o.status}</Badge> },
    { key: 'paymentStatus', header: 'Payment', render: (o) => <Badge>{o.paymentStatus}</Badge> },
    { key: 'channel', header: 'Channel' },
  ];

  return (
    <div>
      <PageHeader title="Orders" subtitle={`${data?.meta.total ?? 0} orders`} />
      {loading ? (
        <p className="text-sm text-black/40">Loading…</p>
      ) : (
        <DataTable columns={columns} rows={data?.data} onRowClick={setActive} />
      )}
      <Modal open={!!active} onClose={() => setActive(null)} title={active?.orderId}>
        {active && (
          <div className="space-y-4 text-sm">
            <ul className="space-y-1">
              {active.items?.map((it, i) => (
                <li key={i} className="flex justify-between">
                  <span>
                    {it.quantity} × {it.name} {it.size && `(${it.size})`} {it.color}
                  </span>
                  <span>{money(it.price * it.quantity)}</span>
                </li>
              ))}
            </ul>
            <p className="text-black/50">Ship to: {active.shippingAddress?.raw || '—'}</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Status</label>
                <select
                  className="input"
                  value={active.status}
                  onChange={(e) => patch(active._id, { status: e.target.value })}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Payment</label>
                <select
                  className="input"
                  value={active.paymentStatus}
                  onChange={(e) => patch(active._id, { paymentStatus: e.target.value })}
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Tracking number</label>
              <input
                className="input"
                defaultValue={active.trackingNumber}
                onBlur={(e) => e.target.value !== active.trackingNumber && patch(active._id, { trackingNumber: e.target.value })}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
