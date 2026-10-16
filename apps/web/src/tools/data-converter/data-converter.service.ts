import yaml from 'js-yaml';
import { parse as parseToml } from '@iarna/toml';
import stringifyToml from '@iarna/toml/stringify';
import xml from 'xml-js';
import Papa from 'papaparse';
import { serializeCSV } from '@/utils/csv';
import { type DataFormat } from './formats';
export { formats, legacyPaths, legacyConversionQuery, isFormat } from './formats';
function table(text: string, format: DataFormat): string[][] {
  const parsed = Papa.parse<string[]>(text, { delimiter: format === 'tsv' ? '\t' : ',', skipEmptyLines: true });
  if (parsed.errors.length) throw new Error(parsed.errors[0].message);
  return parsed.data;
}
function read(text: string, format: DataFormat): unknown {
  switch (format) {
    case 'json': return JSON.parse(text);
    case 'yaml': return yaml.load(text);
    case 'toml': return parseToml(text);
    case 'xml': return xml.xml2js(text, { compact: true });
    default: {
      const [headers = [], ...rows] = table(text, format);
      if (new Set(headers).size !== headers.length) throw new Error('duplicateHeaders');
      if (rows.some(row => row.length > headers.length)) throw new Error('extraColumns');
      return rows.map(row => Object.fromEntries(headers.map((key, i) => [key, row[i] ?? ''])));
    }
  }
}
function tableXml(data: unknown): unknown {
  const rows = data as Record<string,string>[];
  if (rows.some(row => Object.keys(row).some(key => !/^[A-Za-z_][A-Za-z0-9_.-]*$/.test(key)))) throw new Error('xmlHeaders');
  return { data: { row: rows.map(row => Object.fromEntries(Object.entries(row).map(([key,value]) => [key, { _text: value }]))) } };
}
function write(data: unknown, format: DataFormat): string {
  switch (format) {
    case 'json': return JSON.stringify(data, null, 2) ?? '';
    case 'yaml': return yaml.dump(data);
    case 'toml': return stringifyToml(data as Parameters<typeof stringifyToml>[0]);
    case 'xml': {
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('xmlShape');
      const roots = Object.keys(data).filter(key => !key.startsWith('_'));
      if (roots.length !== 1 || !/^[A-Za-z_][A-Za-z0-9_.-]*$/.test(roots[0])) throw new Error('xmlShape');
      return xml.js2xml(data as Parameters<typeof xml.js2xml>[0], { compact: true, spaces: 2 });
    }
    default: {
      if (!Array.isArray(data) || data.some(row => !row || typeof row !== 'object' || Array.isArray(row))) throw new Error('tableArray');
      const headers = [...new Set(data.flatMap(row => Object.keys(row)))];
      const rows = data.map(row => headers.map(key => {
        const value = row[key];
        if (value !== null && typeof value === 'object') throw new Error('nestedCells');
        return value == null ? '' : String(value);
      }));
      return data.length ? serializeCSV([headers, ...rows], format === 'tsv' ? '\t' : ',') : '';
    }
  }
}
export function convertData(input: string, from: DataFormat, to: DataFormat): { result: string; error: string | null } {
  if (!input.trim()) return { result: '', error: null };
  try {
    // Delimited table conversion retains header-only files and duplicate column labels.
    const result = (from === 'csv' || from === 'tsv') && (to === 'csv' || to === 'tsv')
      ? serializeCSV(table(input, from), to === 'tsv' ? '\t' : ',')
      : write(to === 'xml' && (from === 'csv' || from === 'tsv')
        ? tableXml(read(input, from))
        : read(input, from), to);
    if (!result.trim() && to === 'xml') throw new Error('xmlShape');
    return { result, error: null };
  } catch (error) {
    return { result: '', error: error instanceof Error ? error.message : String(error) };
  }
}




