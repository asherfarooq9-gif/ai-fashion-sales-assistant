import toast from 'react-hot-toast';
import { Download } from 'lucide-react';
import { exportUrl } from '../api/resources.js';
import { getToken } from '../api/client.js';
import { PageHeader } from '../components/ui.jsx';

const ENTITIES = ['products', 'customers', 'orders', 'conversations'];
const FORMATS = ['csv', 'json'];

async function download(entity, format) {
  const res = await fetch(exportUrl(entity, format), {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) {
    toast.error('Export failed');
    return;
  }
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${entity}.${format}`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function ExportData() {
  return (
    <div>
      <PageHeader title="Export Data" subtitle="Download store data as CSV or JSON" />
      <div className="grid gap-4 sm:grid-cols-2">
        {ENTITIES.map((entity) => (
          <div key={entity} className="card p-5">
            <p className="mb-3 font-medium capitalize">{entity}</p>
            <div className="flex gap-2">
              {FORMATS.map((format) => (
                <button key={format} className="btn-ghost" onClick={() => download(entity, format)}>
                  <Download size={15} /> {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
