export type NumberSequenceType = 'fibonacci' | 'primes' | 'even' | 'odd' | 'arithmetic' | 'geometric';
const MAX_COUNT = 10_000;
export const MAX_SEQUENCE_START = 1_000_000;
const fibonacci = [0, 1];
while (Number.isSafeInteger(fibonacci[fibonacci.length - 1] + fibonacci[fibonacci.length - 2])) {
  fibonacci.push(fibonacci[fibonacci.length - 1] + fibonacci[fibonacci.length - 2]);
}
export function sequenceCountLimit(type: NumberSequenceType, start: number): number {
  return type === 'fibonacci' ? fibonacci.filter(value => value >= start).length : MAX_COUNT;
}
function isSequenceType(type: string): type is NumberSequenceType {
  return type === 'fibonacci' || type === 'primes' || type === 'even' || type === 'odd' || type === 'arithmetic' || type === 'geometric';
}
/** Generate from the first sequence value at or above start; invalid input yields empty output. */
export function generateNumbers(type: string, n: number, start = 0, difference = 3): string | null {
  if (!isSequenceType(type)) return null;
  if (type === 'arithmetic' || type === 'geometric') {
    if (!Number.isFinite(n) || n < 1 || !Number.isFinite(start) || !Number.isFinite(difference)) return '';
    const values = Array.from({ length: Math.min(Math.floor(n), MAX_COUNT) }, (_, index) => type === 'geometric' ? start * difference ** index : start + index * difference);
    return values.every(Number.isFinite) ? values.join(', ') : '';
  }
  if (!Number.isFinite(n) || n < 1 || !Number.isInteger(start) || start < 0 || start > MAX_SEQUENCE_START) return '';
  const count = Math.min(Math.floor(n), MAX_COUNT);
  if (type === 'fibonacci') {
    const values = fibonacci.filter(value => value >= start);
    return count <= values.length ? values.slice(0, count).join(', ') : '';
  }
  if (type === 'primes') {
    const values: number[] = [];
    for (let candidate = Math.max(2, start); values.length < count; candidate++) {
      let prime = true;
      for (let divisor = 2; divisor * divisor <= candidate; divisor++) {
        if (candidate % divisor === 0) { prime = false; break; }
      }
      if (prime) values.push(candidate);
    }
    return values.join(', ');
  }
  const first = start + (start % 2 === (type === 'even' ? 0 : 1) ? 0 : 1);
  return Array.from({ length: count }, (_, index) => first + index * 2).join(', ');
}
