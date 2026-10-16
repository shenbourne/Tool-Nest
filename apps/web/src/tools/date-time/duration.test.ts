import { describe, it, expect } from 'vitest';
import { durationSeconds, durationClock } from './duration';
describe('unified duration conversion', () => {
  it('converts fractional days and unbounded duration hours', () => {
    expect(durationSeconds('1.5', 'days')).toBe(129600);
    expect(durationSeconds('36:00:00', 'clock')).toBe(129600);
    expect(durationClock(129600)).toBe('36:00:00');
  });
  it('preserves fractional seconds and carries rounding', () => {
    expect(durationSeconds('00:00:01.5', 'clock')).toBe(1.5);
    expect(durationClock(1.5)).toBe('00:00:01.5');
    expect(durationClock(59.9999999)).toBe('00:01:00');
  });
  it('rejects invalid, negative, missing and overflowing values', () => {
    for (const input of ['', '-1', 'Infinity', '1e100', '9007199254740992']) expect(durationSeconds(input, 'seconds')).toBeNull();
    for (const input of ['12:60:00', '12:00:60', 'bad']) expect(durationSeconds(input, 'clock')).toBeNull();
    expect(durationSeconds('0', 'seconds')).toBe(0);
  });
});
