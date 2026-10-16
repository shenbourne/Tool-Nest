/**
 * Minimal RFC-4180-style CSV parsing and serialization shared by the CSV
 * tools. The previous per-tool `parseCSV` copies dropped quotes, split on
 * newlines inside quoted fields, and never re-escaped on output, so cells
 * containing separators silently broke column structure.
 */

export function parseCSV(text: string, sep = ','): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  const s = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];

    if (inQuotes) {
      if (ch === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"' && field === '') {
      inQuotes = true;
    } else if (ch === sep) {
      row.push(field);
      field = '';
    } else if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }

  // Flush a trailing row that is not newline-terminated.
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

export function serializeCSV(rows: string[][], sep = ','): string {
  return rows
    .map(row =>
      row
        .map(cell =>
          cell.includes(sep) || cell.includes('"') || cell.includes('\n') || cell.includes('\r')
            ? '"' + cell.replace(/"/g, '""') + '"'
            : cell,
        )
        .join(sep),
    )
    .join('\n');
}
