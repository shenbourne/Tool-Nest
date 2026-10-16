import { assertTableRows, assertTableSize } from './table-budget';
import Papa from 'papaparse';
import { serializeCSV } from '@/utils/csv';
import type { TableOperation } from './operations';
export interface TableOptions {
  operation: TableOperation; separator?: string; outputSeparator?: string;
  position?: number | null; header?: string; defaultValue?: string;
  columnA?: number | null; columnB?: number | null;
}
export interface TableIssue { record: number; columns: number; expected: number }
export interface TableResult {
  result: string; error: string | null; issues: TableIssue[]; records: number; expected: number;
}
function index(value: number | null | undefined, fallback: number, min: number): number {
  const selected = value === undefined ? fallback : value;
  if (selected === null || !Number.isInteger(selected) || selected < min) throw new Error('invalidIndex');
  return selected;
}
export function parseTableRows(input: string, separator = ',', preserveEmpty = false): string[][] {
  if (!preserveEmpty && !input.trim()) return [];
    const parsed = Papa.parse<string[]>(input.replace(/^\uFEFF/, ''), { delimiter: separator, skipEmptyLines:false });
    if (parsed.errors.length) {
      const code = parsed.errors[0].code;
      throw new Error(code === 'MissingQuotes' ? 'unclosedQuote' : code === 'InvalidQuotes' ? 'invalidQuote' : 'invalidCsv');
    }
    const rows = parsed.data;
    if (/[\r\n]$/.test(input) && rows.at(-1)?.length === 1 && rows.at(-1)?.[0] === '') rows.pop();
  assertTableRows(rows);
  return rows;
}
export function processTable(input: string, options: TableOptions): TableResult {
  const empty: TableResult = { result:'', error:null, issues:[], records:0, expected:0 };
  if (!input.trim()) return empty;
  try {
    const separator = options.separator ?? ',';
    const rows = parseTableRows(input, separator);
    if (!rows.length) return empty;
    const expected = rows[0].length;
    const base = { ...empty, records: rows.length, expected };
    let output = rows;
    switch (options.operation) {
      case 'separator': return { ...base, result: serializeCSV(rows, options.outputSeparator ?? ';') };
      case 'transpose': {
        const width = rows.reduce((max,row) => Math.max(max,row.length),0);
        output = Array.from({length:width}, (_, col) => rows.map(row => row[col] ?? ''));
        break;
      }
      case 'insert': {
        assertTableSize(rows.length, Math.max(...rows.map(row => row.length)) + 1);
        const position = index(options.position, 1, 0);
        output = rows.map((row, i) => {
          const p = Math.min(position, row.length);
          return [...row.slice(0,p), i === 0 ? options.header ?? 'new_col' : options.defaultValue ?? '', ...row.slice(p)];
        });
        break;
      }
      case 'swap': {
        const a = index(options.columnA, 1, 1) - 1;
        const b = index(options.columnB, 2, 1) - 1;
        const width = rows.reduce((max,row) => Math.max(max,row.length),0);
        if (a >= width || b >= width) throw new Error('columnRange');
        output = rows.map(row => {
          const copy = [...row];
          if (a < copy.length && b < copy.length) [copy[a],copy[b]] = [copy[b],copy[a]];
          return copy;
        });
        break;
      }
      case 'check': return { ...base, issues: rows.slice(1).flatMap((row,i) => row.length === expected ? [] : [{record:i+2, columns:row.length, expected}]) };
    }
    return { ...base, result:serializeCSV(output, separator) };
  } catch (error) {
    return { ...empty, error:error instanceof Error ? error.message : String(error) };
  }
}

export function detectTableSeparator(input: string): string {
  let selected = ',', best = -Infinity;
  for (const delimiter of [',', ';', '\t', '|']) {
    const sample = Papa.parse<string[]>(input.replace(/^\uFEFF/, ''), {delimiter,preview:50,skipEmptyLines:true});
    const width = sample.data[0]?.length ?? 0;
    if(width < 2) continue;
    const matching = sample.data.filter(row => row.length === width).length;
    const score = matching / sample.data.length * 100 + width - sample.errors.length * 10;
    if(score > best){best = score;selected = delimiter;}
  }
  return selected;
}
