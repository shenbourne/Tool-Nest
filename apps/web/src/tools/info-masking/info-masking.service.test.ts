import { describe, expect, it } from 'vitest';
import { maskText, type MaskPattern } from './info-masking.service';

function makeOptions(overrides: Partial<Parameters<typeof maskText>[1]> = {}) {
  return {
    maskChar: '*',
    enabledPatterns: new Set<MaskPattern>(['email']),
    preserveFirst: 2,
    preserveLast: 2,
    ...overrides,
  };
}

describe('maskText', () => {
  it('masks the tail when preserveLast is 0 without leaking the original', () => {
    const result = maskText('support@example.com', makeOptions({ preserveLast: 0 }));

    expect(result).not.toContain('example.com');
    expect(result.startsWith('su')).toBe(true);
    expect(result).toBe('su' + '*'.repeat(17));
  });

  it('masks everything when both preserve values are 0', () => {
    const result = maskText('support@example.com', makeOptions({ preserveFirst: 0, preserveLast: 0 }));
    expect(result).toBe('*'.repeat(19));
  });

  it('preserves the requested edges', () => {
    const result = maskText('support@example.com', makeOptions({ preserveFirst: 2, preserveLast: 2 }));
    expect(result).toBe('su' + '*'.repeat(15) + 'om');
  });

  it('fully masks values too short to preserve anything', () => {
    const result = maskText('ab@cd.ef', makeOptions({ preserveFirst: 4, preserveLast: 4 }));
    expect(result).toBe('*'.repeat(8));
  });

  it('leaves the text untouched when no pattern is enabled', () => {
    const result = maskText('support@example.com', makeOptions({ enabledPatterns: new Set<MaskPattern>() }));
    expect(result).toBe('support@example.com');
  });

  it('handles empty input', () => {
    expect(maskText('', makeOptions())).toBe('');
  });
});
