import { describe, expect, it } from 'vitest';
import { sortKeys } from './json-sort.service';

describe('sortKeys', () => {
  it('sorts keys naturally', () => {
    expect(JSON.stringify(sortKeys({ item10: 1, item9: 2, item1: 3 }))).toBe(
      JSON.stringify({ item1: 3, item9: 2, item10: 1 }),
    );
  });

  it('recurses into nested objects and arrays', () => {
    const input = { z: { b: 1, a: 2 }, a: [{ d: 1, c: 2 }] };
    expect(JSON.stringify(sortKeys(input))).toBe(JSON.stringify({ a: [{ c: 2, d: 1 }], z: { a: 2, b: 1 } }));
  });

  it('leaves primitives untouched', () => {
    expect(sortKeys(5)).toBe(5);
    expect(sortKeys('x')).toBe('x');
  });
});
