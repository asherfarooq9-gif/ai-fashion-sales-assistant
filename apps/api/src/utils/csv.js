import { stringify } from 'csv-stringify/sync';

/** Flatten a nested value to a CSV-safe scalar. */
function flatten(value) {
  if (value == null) return '';
  if (Array.isArray(value)) return value.map(flatten).join('; ');
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
}

/** Convert an array of plain objects to a CSV string with a header row. */
export function toCsv(rows, columns) {
  const list = rows.map((r) => (typeof r.toObject === 'function' ? r.toObject() : r));
  const cols = columns || [...new Set(list.flatMap((r) => Object.keys(r)))];
  const records = list.map((r) => cols.map((c) => flatten(r[c])));
  return stringify([cols, ...records]);
}

export default toCsv;
