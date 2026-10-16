import { describe, expect, it } from 'vitest';
import { detectTableSeparator, parseTableRows } from './table-tools.service';
describe('automatic input delimiter', () => {
  it.each([',',';','\t','|'])('detects %j for files and clipboard tables', separator => {
    const text=`name${separator}age\nAlice${separator}20`;
    expect(detectTableSeparator(text)).toBe(separator);
    expect(parseTableRows(text,detectTableSeparator(text))).toEqual([['name','age'],['Alice','20']]);
  });
  it('ignores separator characters inside quoted values', () => {
    expect(detectTableSeparator('name;note\nAlice;"a,b|c\td"')).toBe(';');
    expect(detectTableSeparator('name,note\nAlice,"a;b|c\td"')).toBe(',');
  });
  it('uses the header for incomplete records and supports header-only tables', () => {
    expect(detectTableSeparator('a;b\n1')).toBe(';');
    expect(detectTableSeparator('a|b')).toBe('|');
    const invalid='name;note\nAlice;"unterminated';
    expect(() => parseTableRows(invalid,detectTableSeparator(invalid))).toThrow('unclosedQuote');
  });
  it('falls back for a single column and still allows manual override', () => {
    expect(parseTableRows('"hello, world"\n"plain"',detectTableSeparator('"hello, world"\n"plain"'))).toEqual([['hello, world'],['plain']]);
    expect(parseTableRows('a;b',',')).toEqual([['a;b']]);
    expect(detectTableSeparator('')).toBe(',');
  });
});
