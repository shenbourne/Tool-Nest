/**
 * Date helpers for the weekday calculator.
 *
 * `new Date("YYYY-MM-DD")` parses as UTC midnight, so west of the prime
 * meridian the local date is still the previous day and `getDay()` reports the
 * wrong weekday. Parse by constructing the date from local components instead.
 */
export function parseLocalDate(input: string): Date | null {
  const m = input.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const date = new Date(year, month - 1, day);

  // Reject out-of-range components that JavaScript would silently roll over
  // (e.g. 2026-02-30 becomes March 2).
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
}

export function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
