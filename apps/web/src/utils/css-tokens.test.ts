import { describe, expect, it, vi } from 'vitest';
import { resolveCssColorToken } from './css-tokens';

describe('resolveCssColorToken', () => {
  it('returns the trimmed computed value of a CSS custom property', () => {
    // getComputedStyle().getPropertyValue() keeps a leading space in front of
    // the value, e.g. ' #0f766e'. Canvas/Konva cannot use that raw string.
    const read = vi.fn((name: string) => (name === '--color-primary' ? ' #0f766e ' : ''));

    expect(resolveCssColorToken('--color-primary', read)).toBe('#0f766e');
    expect(read).toHaveBeenCalledWith('--color-primary');
  });

  it('trims the token name before reading it', () => {
    const read = vi.fn(() => '#2dd4bf');

    expect(resolveCssColorToken('  --color-primary  ', read)).toBe('#2dd4bf');
    expect(read).toHaveBeenCalledWith('--color-primary');
  });

  it('returns an empty string instead of throwing when no DOM is available', () => {
    // The default reader falls back to the DOM, which does not exist in the
    // Node test environment.
    expect(resolveCssColorToken('--color-primary')).toBe('');
  });
});
