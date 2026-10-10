import { describe, expect, it } from 'vitest';
import { moveItem } from './file-reorder';

describe('moveItem', () => {
  it('moves an item forward', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
  });

  it('moves an item backward', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c']);
  });

  it('swaps neighbours in both directions', () => {
    expect(moveItem(['a', 'b'], 0, 1)).toEqual(['b', 'a']);
    expect(moveItem(['a', 'b'], 1, 0)).toEqual(['b', 'a']);
  });

  it('returns a copy when the move is a no-op', () => {
    const list = ['a', 'b', 'c'];
    const same = moveItem(list, 1, 1);
    expect(same).toEqual(list);
    expect(same).not.toBe(list);
  });

  it('ignores out-of-range indices', () => {
    const list = ['a', 'b', 'c'];
    expect(moveItem(list, -1, 1)).toEqual(list);
    expect(moveItem(list, 0, 3)).toEqual(list);
    expect(moveItem(list, 3, 0)).toEqual(list);
    expect(moveItem(list, 0.5, 1)).toEqual(list);
    expect(moveItem(list, 0, Number.NaN)).toEqual(list);
  });

  it('handles an empty list', () => {
    expect(moveItem([], 0, 0)).toEqual([]);
  });

  it('does not mutate the input', () => {
    const list = ['a', 'b', 'c'];
    moveItem(list, 2, 0);
    expect(list).toEqual(['a', 'b', 'c']);
  });
});
