import { describe, expect, it } from 'vitest';
import { formatLocalDate, parseLocalDate } from './date-weekday-calculator.service';

describe('parseLocalDate', () => {
  it('parses a valid date', () => {
    const d = parseLocalDate('2026-09-27');
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2026);
    expect(d!.getMonth()).toBe(8);
    expect(d!.getDate()).toBe(27);
  });

  it('rejects non-date text', () => {
    expect(parseLocalDate('abc')).toBeNull();
    expect(parseLocalDate('27/09/2026')).toBeNull();
    expect(parseLocalDate('')).toBeNull();
  });

  it('rejects out-of-range components instead of rolling over', () => {
    expect(parseLocalDate('2026-13-01')).toBeNull();
    expect(parseLocalDate('2026-02-30')).toBeNull();
    expect(parseLocalDate('2026-00-10')).toBeNull();
  });

  it('reports the weekday for the local date, not a UTC-derived one', () => {
    const d = parseLocalDate('2026-09-27');
    expect(d!.getDay()).toBe(new Date(2026, 8, 27).getDay());
  });
});

describe('formatLocalDate', () => {
  it('pads single-digit months and days', () => {
    expect(formatLocalDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('round-trips with parseLocalDate', () => {
    const d = parseLocalDate('2026-09-27')!;
    expect(parseLocalDate(formatLocalDate(d))!.getTime()).toBe(d.getTime());
  });
});
