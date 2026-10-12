import { describe, expect, it } from 'vitest';
import { i18n } from '@/i18n';
import { convertBase, convertByteUnit, byteUnits } from './byte-converter.service';

describe('convertBase', () => {
  const INVALID = i18n.global.t('tools.byteConverter.invalidInput');

  it('converts between bases', () => {
    expect(convertBase('255', 10, 16)).toBe('FF');
    expect(convertBase('FF', 16, 10)).toBe('255');
    expect(convertBase('1010', 2, 10)).toBe('10');
  });

  it('rejects digits that are invalid for the source base', () => {
    expect(convertBase('1A3', 10, 16)).toBe(INVALID);
    expect(convertBase('255.9', 10, 16)).toBe(INVALID);
    expect(convertBase('8', 8, 10)).toBe(INVALID);
  });

  it('returns empty for empty input', () => {
    expect(convertBase('', 10, 16)).toBe('');
  });

  it('round-trips through a common base', () => {
    expect(convertBase(convertBase('12345', 10, 36), 36, 10)).toBe('12345');
  });
});

describe('linked byte inputs', () => {
  it.each(byteUnits)('converts from $id to bytes and back', unit => {
    const bytes = convertByteUnit(1.5, unit.id, 'Bytes');
    expect(bytes).toBe(1.5 * unit.factor);
    expect(convertByteUnit(bytes, 'Bytes', unit.id)).toBe(1.5);
  });
  it('uses 1024 and eight bits per byte', () => {
    expect(convertByteUnit(1, 'TB', 'GB')).toBe(1024);
    expect(convertByteUnit(8, 'Bits', 'Bytes')).toBe(1);
    expect(convertByteUnit(1, 'KB', 'Bits')).toBe(8192);
  });
  it('preserves fractional bytes without rounding', () => {
    expect(convertByteUnit(1, 'Bits', 'Bytes')).toBe(0.125);
    expect(convertByteUnit(1, 'Bytes', 'TB')).toBe(1 / 1024 ** 4);
  });
  it('keeps cleared fields empty and accepts zero', () => {
    expect(convertByteUnit(null, 'MB', 'Bytes')).toBeNull();
    expect(convertByteUnit(0, 'GB', 'Bits')).toBe(0);
  });
});
