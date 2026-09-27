import { describe, expect, it } from 'vitest';
import { getNextExecutions } from './crontab-generator.service';

describe('getNextExecutions day-of-month vs day-of-week', () => {
  it('uses OR semantics when both day fields are restricted', () => {
    // "0 0 13 * 5" = at 00:00 on the 13th OR on Friday (standard cron).
    const next = getNextExecutions(['0', '0', '13', '*', '5'], 8);
    expect(next.length).toBeGreaterThan(0);
    const isThirteenthOrFriday = next.every(
      (d) => d.getDate() === 13 || d.getDay() === 5,
    );
    expect(isThirteenthOrFriday).toBe(true);
    // The set must contain at least one Friday that is not the 13th,
    // which the old AND semantics could never produce.
    expect(next.some((d) => d.getDay() === 5 && d.getDate() !== 13)).toBe(true);
  });

  it('falls back to the single restricted field when the other is *', () => {
    const next = getNextExecutions(['0', '0', '*', '*', '5'], 3);
    expect(next.every((d) => d.getDay() === 5)).toBe(true);
  });
});
