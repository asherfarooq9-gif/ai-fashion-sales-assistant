import { useState } from 'react';
import { PRODUCT_CATEGORIES, GENDERS } from '@afsa/shared/enums';

const TAG_FIELDS = ['sizes', 'colors', 'images', 'tags'];

function toForm(p = {}) {
  return {
    name: p.name || '',
    category: p.category || 'dresses',
    gender: p.gender || 'women',
    price: p.price ?? 0,
    discount: p.discount ?? 0,
    stock: p.stock ?? 0,
    rating: p.rating ?? 4.2,
    description: p.description || '',
    sizes: (p.sizes || []).join(', '),
    colors: (p.colors || []).join(', '),
    images: (p.images || []).join(', '),
    tags: (p.tags || []).join(', '),
  };
}

export default function ProductForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(toForm(initial));
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    const payload = {
      ...form,
      price: Number(form.price),
      discount: Number(form.discount),
      stock: Number(form.stock),
      rating: Number(form.rating),
    };
    for (const field of TAG_FIELDS) {
      payload[field] = form[field]
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    try {
      await onSubmit(payload);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="label">Name</label>
        <input className="input" value={form.name} onChange={set('name')} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Category</label>
          <select className="input" value={form.category} onChange={set('category')}>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Gender</label>
          <select className="input" value={form.gender} onChange={set('gender')}>
            {GENDERS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label">Price</label>
          <input className="input" type="number" value={form.price} onChange={set('price')} />
        </div>
        <div>
          <label className="label">Discount %</label>
          <input className="input" type="number" value={form.discount} onChange={set('discount')} />
        </div>
        <div>
          <label className="label">Stock</label>
          <input className="input" type="number" value={form.stock} onChange={set('stock')} />
        </div>
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input" rows={2} value={form.description} onChange={set('description')} />
      </div>
      {TAG_FIELDS.map((field) => (
        <div key={field}>
          <label className="label">{field} (comma separated)</label>
          <input className="input" value={form[field]} onChange={set(field)} />
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn-primary" disabled={busy}>
          {busy ? 'Saving…' : 'Save product'}
        </button>
      </div>
    </form>
  );
}
