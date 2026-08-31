import { useEffect } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <div>
        <h1 className="font-display text-2xl text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-black/50">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, hint }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-black/40">{label}</p>
      <p className="mt-1 font-display text-3xl text-ink">{value}</p>
      {hint && <p className="text-xs text-black/40">{hint}</p>}
    </div>
  );
}

const BADGE_TONES = {
  green: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-rose-100 text-rose-700',
  blue: 'bg-sky-100 text-sky-700',
  gray: 'bg-black/10 text-black/60',
  pink: 'bg-blush-100 text-blush-700',
};

export function Badge({ tone = 'gray', children }) {
  return (
    <span className={clsx('rounded-full px-2 py-0.5 text-xs font-medium', BADGE_TONES[tone])}>
      {children}
    </span>
  );
}

export function EmptyState({ children }) {
  return <div className="card p-10 text-center text-sm text-black/40">{children}</div>;
}

export function DataTable({ columns, rows, onRowClick, empty = 'Nothing here yet' }) {
  if (!rows?.length) return <EmptyState>{empty}</EmptyState>;
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/10 text-left text-xs uppercase tracking-wide text-black/40">
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 font-semibold">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row._id || i}
              onClick={() => onRowClick?.(row)}
              className={clsx(
                'border-b border-black/5 last:border-0',
                onRowClick && 'cursor-pointer hover:bg-blush-50/50'
              )}
            >
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-16">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-3">
          <h2 className="font-display text-lg">{title}</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-black/5">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

export function money(n) {
  return `Rs ${Number(n || 0).toLocaleString('en-PK')}`;
}
