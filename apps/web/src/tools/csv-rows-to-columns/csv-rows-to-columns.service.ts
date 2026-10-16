import { parseCSV, serializeCSV } from '@/utils/csv';

export function transposeCsv(input: string): string {
  const rows = parseCSV(input);
  if (!rows.length) return '';
  const columns = Math.max(...rows.map(row => row.length));
  return serializeCSV(Array.from({ length: columns }, (_, column) => rows.map(row => row[column] ?? '')));
}
