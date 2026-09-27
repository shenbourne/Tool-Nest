import { describe, expect, it } from 'vitest';
import { generateRandomNumbers } from './random-number-generator.service';

describe('generateRandomNumbers', () => {
  it('rejects an inverted range', () => {
    expect(generateRandomNumbers(10, 6, 3, false)).toEqual({ ok: false, error: 'invalidRange' });
  });

  it('rejects a missing range', () => {
    expect(generateRandomNumbers(null, 6, 3, false)).toEqual({ ok: false, error: 'invalidRange' });
    expect(generateRandomNumbers(6, null, 3, false)).toEqual({ ok: false, error: 'invalidRange' });
  });

  it('rejects unique requests wider than the range', () => {
    expect(generateRandomNumbers(1, 3, 5, true)).toEqual({ ok: false, error: 'rangeTooSmall' });
  });

  it('terminates when unique is off and the range is narrower than count', () => {
    // min == max with count > 1 used to loop forever on the old Set guard.
    expect(generateRandomNumbers(5, 5, 3, false)).toEqual({ ok: true, values: [5, 5, 5] });
  });

  it('generates unique values across the whole range', () => {
    const result = generateRandomNumbers(1, 3, 3, true);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.values).toHaveLength(3);
      expect(new Set(result.values).size).toBe(3);
    }
  });

  it('generates the requested count with an injected rng', () => {
    const result = generateRandomNumbers(1, 10, 5, false, () => 0.5);
    expect(result).toEqual({ ok: true, values: [6, 6, 6, 6, 6] });
  });

  it('clamps a missing or invalid count to 1', () => {
    expect(generateRandomNumbers(1, 10, null, false, () => 0)).toEqual({ ok: true, values: [1] });
    expect(generateRandomNumbers(1, 10, 0, false, () => 0)).toEqual({ ok: true, values: [1] });
  });
});
