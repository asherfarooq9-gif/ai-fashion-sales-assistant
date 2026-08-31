import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { INTENTS, LANGUAGES } from '@afsa/shared/enums';
import { cannedResponses } from '../api/resources.js';
import { useAsync } from '../hooks/useAsync.js';
import { PageHeader, DataTable, Badge, Modal } from '../components/ui.jsx';

const blank = {
  key: '',
  intent: 'greeting',
  language: 'en',
  triggerExamples: '',
  responseTemplate: '',
  isFewShot: false,
  enabled: true,
  priority: 0,
};

export default function AiTraining() {
  const { data, loading, reload } = useAsync(() => cannedResponses.list());
  const [form, setForm] = useState(null);
  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  async function save(e) {
    e.preventDefault();
    const payload = {
      ...form,
      priority: Number(form.priority),
      triggerExamples: form.triggerExamples.split('\n').map((s) => s.trim()).filter(Boolean),
    };
    if (form._id) await cannedResponses.update(form._id, payload);
    else await cannedResponses.create(payload);
    toast.success('Saved');
    setForm(null);
    reload();
  }

  async function remove(row) {
    if (!confirm(`Delete "${row.key}"?`)) return;
    await cannedResponses.remove(row._id);
    reload();
  }

  const columns = [
    { key: 'key', header: 'Key' },
    { key: 'intent', header: 'Intent', render: (r) => <Badge tone="pink">{r.intent}</Badge> },
    { key: 'language', header: 'Lang' },
    { key: 'isFewShot', header: 'Type', render: (r) => (r.isFewShot ? 'few-shot' : 'canned') },
    { key: 'enabled', header: '', render: (r) => <Badge tone={r.enabled ? 'green' : 'gray'}>{r.enabled ? 'on' : 'off'}</Badge> },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <button onClick={(e) => (e.stopPropagation(), remove(r))} className="rounded p-1 hover:bg-black/10">
          <Trash2 size={15} />
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="AI Training"
        subtitle="Canned replies and few-shot examples the assistant learns from"
        action={
          <button className="btn-primary" onClick={() => setForm(blank)}>
            <Plus size={16} /> New response
          </button>
        }
      />
      {loading ? (
        <p className="text-sm text-black/40">Loading…</p>
      ) : (
        <DataTable
          columns={columns}
          rows={data}
          onRowClick={(r) => setForm({ ...r, triggerExamples: (r.triggerExamples || []).join('\n') })}
        />
      )}
      <Modal open={!!form} onClose={() => setForm(null)} title={form?._id ? 'Edit response' : 'New response'}>
        {form && (
          <form onSubmit={save} className="space-y-3">
            <div>
              <label className="label">Key</label>
              <input className="input" value={form.key} onChange={set('key')} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Intent</label>
                <select className="input" value={form.intent} onChange={set('intent')}>
                  {INTENTS.map((i) => (
                    <option key={i}>{i}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Language</label>
                <select className="input" value={form.language} onChange={set('language')}>
                  {LANGUAGES.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Trigger examples (one per line)</label>
              <textarea className="input" rows={3} value={form.triggerExamples} onChange={set('triggerExamples')} />
            </div>
            <div>
              <label className="label">Response template</label>
              <textarea className="input" rows={3} value={form.responseTemplate} onChange={set('responseTemplate')} required />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isFewShot} onChange={set('isFewShot')} /> Use as few-shot example
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.enabled} onChange={set('enabled')} /> Enabled
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-ghost" onClick={() => setForm(null)}>
                Cancel
              </button>
              <button className="btn-primary">Save</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
