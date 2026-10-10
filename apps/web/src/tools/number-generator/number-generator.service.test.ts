import { describe, expect, it } from 'vitest';
import { generateNumbers } from './number-generator.service';

describe('generateNumbers', () => {
  it('returns null for an unknown type', () => {
    expect(generateNumbers('banana', 5)).toBeNull();
  });

  it('returns empty for a non-positive count instead of crashing', () => {
    expect(generateNumbers('even', -5)).toBe('');
    expect(generateNumbers('even', 0)).toBe('');
  });

  it('generates even numbers', () => {
    expect(generateNumbers('even', 4)).toBe('0, 2, 4, 6');
  });

  it('generates odd numbers', () => {
    expect(generateNumbers('odd', 3)).toBe('1, 3, 5');
  });

  it('generates fibonacci numbers', () => {
    expect(generateNumbers('fibonacci', 6)).toBe('0, 1, 1, 2, 3, 5');
  });

  it('generates primes', () => {
    expect(generateNumbers('primes', 5)).toBe('2, 3, 5, 7, 11');
  });

  it('caps huge counts', () => {
    const result = generateNumbers('even', 1e9) ?? '';
    expect(result.split(', ')).toHaveLength(10000);
  });
});
