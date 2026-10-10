import { describe, expect, it } from 'vitest';
import { parseCSV, serializeCSV } from './csv';

describe('parseCSV', () => {
  it('parses simple rows', () => {
    expect(parseCSV('a,b\nc,d')).toEqual([['a', 'b'], ['c', 'd']]);
  });

  it('keeps separators inside quoted fields', () => {
    expect(parseCSV('"foo,bar",baz')).toEqual([['foo,bar', 'baz']]);
  });

  it('unescapes doubled quotes', () => {
    expect(parseCSV('"say ""hi""",x')).toEqual([['say "hi"', 'x']]);
  });

  it('keeps newlines inside quoted fields', () => {
    expect(parseCSV('"line1\nline2",b')).toEqual([['line1\nline2', 'b']]);
  });

  it('handles CRLF input', () => {
    expect(parseCSV('a,b\r\nc,d')).toEqual([['a', 'b'], ['c', 'd']]);
  });

  it('does not invent an extra row for a trailing newline', () => {
    expect(parseCSV('a,b\n')).toEqual([['a', 'b']]);
  });
});

describe('serializeCSV', () => {
  it('re-escapes cells containing the target separator', () => {
    expect(serializeCSV([['foo;bar', 'baz']], ';')).toBe('"foo;bar";baz');
  });

  it('re-escapes cells containing the default separator', () => {
    expect(serializeCSV([['foo,bar', 'baz']])).toBe('"foo,bar",baz');
  });

  it('re-escapes cells containing quotes', () => {
    expect(serializeCSV([['say "hi"', 'x']])).toBe('"say ""hi""",x');
  });

  it('round-trips through parseCSV', () => {
    const rows = [['a,b', 'c"d'], ['e', 'f\ng']];
    expect(parseCSV(serializeCSV(rows))).toEqual(rows);
  });
});
