export type RandomNumberResult =
  | { ok: true; values: number[] }
  | { ok: false; error: 'invalidRange' | 'rangeTooSmall' };

const MAX_ATTEMPTS = 10_000;

export function generateRandomNumbers(
  min: number | null,
  max: number | null,
  count: number | null,
  unique: boolean,
  rand: () => number = Math.random,
): RandomNumberResult {
  if (min == null || max == null || min > max) {
    return { ok: false, error: 'invalidRange' };
  }

  const n = count == null || count < 1 ? 1 : count;
  const range = max - min + 1;

  if (unique && n > range) {
    return { ok: false, error: 'rangeTooSmall' };
  }

  // Capped by attempt count, not set size: a Set stops growing once every
  // attainable value is in it, so a plain `while (set.size < count)` spins
  // forever when the range holds fewer distinct values than requested with
  // uniqueness off.
  const values: number[] = [];
  const seen = new Set<number>();
  let attempts = 0;
  while (values.length < n && attempts < MAX_ATTEMPTS) {
    attempts += 1;
    const value = Math.floor(rand() * range) + min;
    if (!unique || !seen.has(value)) {
      values.push(value);
      seen.add(value);
    }
  }

  return { ok: true, values };
}
