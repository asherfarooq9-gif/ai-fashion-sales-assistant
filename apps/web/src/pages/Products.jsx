import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { products } from '../api/resources.js';
import { useAsync } from '../hooks/useAsync.js';
import { PageHeader, DataTable, Badge, Modal, money } from '../components/ui.jsx';
import ProductForm from '../components/ProductForm.jsx';

export default function Products() {
  const [q, setQ] = useState('');
  const { data, loading, reload } = useAsync(() => products.list({ q: q || undefined, limit: 100 }), [q]);
  const [editing, setEditing] = useState(null); // product | 'new' | null

  async function save(payload) {
    if (editing === 'new') await products.create(payload);
    else await products.update(editing._id, payload);
    toast.success('Saved');
    setEditing(null);
    reload();
  }

  async function remove(p) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    await products.remove(p._id);
    toast.success('Deleted');
    reload();
  }

  const columns = [
    { key: 'name', header: 'Name', render: (p) => <span className="font-medium">{p.name}</span> },
    { key: 'category', header: 'Category', render: (p) => <Badge tone="pink">{p.category}</Badge> },
    { key: 'gender', header: 'Gender' },
    { key: 'price', header: 'Price', render: (p) => money(p.price) },
    { key: 'discount', header: 'Disc.', render: (p) => (p.discount ? `${p.discount}%` : '—') },
    {
      key: 'stock',
      header: 'Stock',
      render: (p) => <Badge tone={p.stock > 0 ? 'green' : 'red'}>{p.stock}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      render: (p) => (
        <div className="flex gap-2">
          <button onClick={(e) => (e.stopPropagation(), setEditing(p))} className="rounded p-1 hover:bg-black/10">
            <Pencil size={15} />
          </button>
          <button onClick={(e) => (e.stopPropagation(), remove(p))} className="rounded p-1 hover:bg-black/10">
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${data?.meta.total ?? 0} items`}
        action={
          <button className="btn-primary" onClick={() => setEditing('new')}>
            <Plus size={16} /> Add product
          </button>
        }
      />
      <input
        className="input mb-4 max-w-xs"
        placeholder="Search products…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {loading ? <p className="text-sm text-black/40">Loading…</p> : <DataTable columns={columns} rows={data?.data} />}
      <Modal
        open={editing != null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Add product' : 'Edit product'}
      >
        {editing != null && (
          <ProductForm
            initial={editing === 'new' ? undefined : editing}
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  );
}
