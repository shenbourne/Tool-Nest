export type NumberSequenceType = 'fibonacci' | 'primes' | 'even' | 'odd';

const MAX_COUNT = 10_000;

function isSequenceType(type: string): type is NumberSequenceType {
  return type === 'fibonacci' || type === 'primes' || type === 'even' || type === 'odd';
}

/**
 * Returns the generated sequence as a comma-separated string, an empty string
 * for a non-positive count, or null for an unknown type. Negative counts used
 * to crash the component via `Array.from({ length: -n })`, and unbounded counts
 * froze the page, so both are guarded here.
 */
export function generateNumbers(type: string, n: number): string | null {
  if (!isSequenceType(type)) return null;
  if (!Number.isFinite(n) || n < 1) return '';

  const count = Math.min(Math.floor(n), MAX_COUNT);

  if (type === 'fibonacci') {
    const s = [0, 1];
    for (let i = 2; i < count; i++) s.push(s[i - 1] + s[i - 2]);
    return s.slice(0, count).join(', ');
  }

  if (type === 'primes') {
    const p: number[] = [];
    for (let i = 2; p.length < count; i++) {
      const isPrime = i > 1 && Array.from({ length: Math.floor(Math.sqrt(i)) - 1 }, (_, j) => j + 2).every(d => i % d !== 0);
      if (isPrime) p.push(i);
    }
    return p.join(', ');
  }

  if (type === 'even') return Array.from({ length: count }, (_, i) => i * 2).join(', ');
  return Array.from({ length: count }, (_, i) => i * 2 + 1).join(', ');
}
