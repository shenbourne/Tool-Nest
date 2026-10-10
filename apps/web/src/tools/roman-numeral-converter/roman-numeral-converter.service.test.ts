import { describe, expect, it } from 'vitest';
import { arabicToRoman, isValidRomanNumber, romanToArabic } from './roman-numeral-converter.service';

describe('isValidRomanNumber', () => {
  it('accepts valid roman numerals', () => {
    expect(isValidRomanNumber('XIV')).toBe(true);
  });

  it('rejects the empty string so it never decodes to 0', () => {
    expect(isValidRomanNumber('')).toBe(false);
    expect(romanToArabic('')).toBeNull();
  });

  it('rejects invalid letters', () => {
    expect(isValidRomanNumber('ABC')).toBe(false);
  });
});

describe('round trip', () => {
  it('arabic → roman → arabic is stable', () => {
    expect(romanToArabic(arabicToRoman(1984) || '')).toBe(1984);
  });

  it('arabicToRoman rejects out-of-range values', () => {
    expect(arabicToRoman(0)).toBe('');
    expect(arabicToRoman(4000)).toBe('');
  });
});
