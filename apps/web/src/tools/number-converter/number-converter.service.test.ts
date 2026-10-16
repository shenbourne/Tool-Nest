import { describe, expect, it } from 'vitest';
import { parseNumber, formatNumber, numberKinds, convertNumber } from './number-converter.service';

describe('synchronized number conversion', () => {
  it.each(numberKinds)('round trips %s', kind => {
    for (const n of [1, 4, 42, 2026, 3999]) expect(parseNumber(kind, formatNumber(kind, n))).toBe(n);
  });
  it.each(['decimal', 'english', 'binary', 'octal', 'hex'] as const)('supports signed safe range in %s', kind => {
    for (const n of [0, -42, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]) expect(parseNumber(kind, formatNumber(kind, n))).toBe(n);
  });
  it.each([['decimal', '12.5'], ['decimal', '9007199254740992'], ['binary', '102'], ['octal', '8'], ['hex', 'xyz'], ['roman', 'IIII'], ['roman', ''], ['english', 'one two'], ['english', 'one million million']] as const)('rejects %s %s', (kind, text) => expect(parseNumber(kind, text)).toBeNull());
  it('accepts case, prefixes and surrounding whitespace', () => {
    expect(parseNumber('roman', ' xiv ')).toBe(14);
    expect(parseNumber('hex', '-0xFF')).toBe(-255);
    expect(parseNumber('english', 'One Hundred Twenty Three')).toBe(123);
  });
  it('clears invalid and empty conversions without stale results', () => {
    expect(Object.values(convertNumber('decimal', '')).every(x => x === '')).toBe(true);
    expect(Object.values(convertNumber('binary', '102')).every(x => x === '')).toBe(true);
    expect(convertNumber('roman', 'XLII')).toMatchObject({ decimal: '42', english: 'forty-two', binary: '101010' });
    expect(convertNumber('decimal', '4000').roman).toBe('');
  });
});

