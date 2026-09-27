import { describe, expect, it } from 'vitest';
import { censorText } from './text-censor.service';

describe('censorText', () => {
  it('censors whole sensitive words', () => {
    expect(censorText('what the hell')).toBe('what the h***');
  });

  it('does not censor innocent words containing a sensitive substring', () => {
    expect(censorText('hello shell')).toBe('hello shell');
  });

  it('is case-insensitive', () => {
    expect(censorText('HELL')).toBe('H***');
  });

  it('handles multiple words', () => {
    expect(censorText('bad and evil')).toBe('b** and e***');
  });
});
