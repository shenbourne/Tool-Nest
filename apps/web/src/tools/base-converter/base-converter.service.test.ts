import { describe, expect, it } from 'vitest';
import { i18n } from '@/i18n';
import { convertBase } from './base-converter.service';

const INVALID = i18n.global.t('tools.baseConverter.invalidInput');

describe('convertBase', () => {
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
