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
  it('starts at the first matching value at or above the lower bound', () => {
    expect(generateNumbers('primes', 4, 10)).toBe('11, 13, 17, 19');
    expect(generateNumbers('even', 3, 11)).toBe('12, 14, 16');
    expect(generateNumbers('odd', 3, 10)).toBe('11, 13, 15');
    expect(generateNumbers('fibonacci', 4, 10)).toBe('13, 21, 34, 55');
  });
  it('preserves duplicate Fibonacci ones when starting at one', () => {
    expect(generateNumbers('fibonacci', 4, 1)).toBe('1, 1, 2, 3');
  });
  it('rejects invalid starts and unsafe Fibonacci lengths', () => {
    expect(generateNumbers('primes', 4, NaN)).toBe('');
    expect(generateNumbers('even', 4, -1)).toBe('');
    expect(generateNumbers('fibonacci', 79, 10)).toBe('');
  });

 describe('arithmetic sequence', () => {
 it('supports arbitrary first terms and positive, negative and zero differences', () => {
 expect(generateNumbers('arithmetic', 4, 1, 3)).toBe('1, 4, 7, 10');
 expect(generateNumbers('arithmetic', 3, -1.5, -0.5)).toBe('-1.5, -2, -2.5');
 expect(generateNumbers('arithmetic', 3, 2, 0)).toBe('2, 2, 2');
 });
 it('rejects invalid arithmetic parameters and overflow', () => {
 expect(generateNumbers('arithmetic', 3, 1, NaN)).toBe('');
 expect(generateNumbers('arithmetic', 3, 1e308, 1e308)).toBe('');
 });
 });

import { tool } from './index';
import { canonicalToolPath, normalizeToolPreferences } from '../../utils/tool-paths';
it('preserves legacy arithmetic routes and preferences', () => {
 expect(canonicalToolPath('/arithmetic-sequence', [tool])).toBe('/number-generator');
 expect(normalizeToolPreferences({favorites: ['/arithmetic-sequence', '/number-generator'], recentTools: []}, [tool]).favorites).toEqual(['/number-generator']);
});

describe('geometric sequences and statistics', () => {
  it('supports fractional, negative and zero ratios', () => {
    expect(generateNumbers('geometric', 4, 2, 3)).toBe('2, 6, 18, 54');
    expect(generateNumbers('geometric', 3, 4, -0.5)).toBe('4, -2, 1');
    expect(generateNumbers('geometric', 3, 4, 0)).toBe('4, 0, 0');
    expect(generateNumbers('geometric', 3, 1e308, 10)).toBe('');
  });
});

it('redirects legacy sum routes and preferences', () => {
 expect(canonicalToolPath('/number-sum', [tool])).toBe('/number-generator');
 expect(normalizeToolPreferences({favorites: ['/number-sum'], recentTools: []}, [tool]).favorites).toEqual(['/number-generator']);
});
