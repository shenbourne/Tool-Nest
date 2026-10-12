import { describe, expect, it } from 'vitest';
import { convertByteUnit, byteUnits } from './byte-converter.service';

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
