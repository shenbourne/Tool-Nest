import { describe, expect, it } from 'vitest';
import { diffJsonTree, summarizeJsonTree } from './json-tree-diff';

describe('diffJsonTree', () => {
  it('compares equal scalars as same', () => {
    expect(diffJsonTree(1, 1)).toEqual([
      { depth: 0, label: '(root)', isLast: true, ancestorLast: [], type: 'same', leftValue: '1', rightValue: '1' },
    ]);
  });

  it('compares different scalars as changed', () => {
    expect(diffJsonTree(1, 2)).toEqual([
      { depth: 0, label: '(root)', isLast: true, ancestorLast: [], type: 'changed', leftValue: '1', rightValue: '2' },
    ]);
  });

  it('lists unchanged object keys as same rows with correct isLast', () => {
    const rows = diffJsonTree({ a: 1, b: 'x' }, { a: 1, b: 'x' });
    expect(rows).toEqual([
      { depth: 0, label: '(root)', isLast: true, ancestorLast: [], type: 'same', leftValue: '{2}', rightValue: '{2}' },
      { depth: 1, label: 'a', isLast: false, ancestorLast: [true], type: 'same', leftValue: '1', rightValue: '1' },
      { depth: 1, label: 'b', isLast: true, ancestorLast: [true], type: 'same', leftValue: '"x"', rightValue: '"x"' },
    ]);
  });

  it('marks added and removed object keys', () => {
    const rows = diffJsonTree({ a: 1, old: true }, { a: 1, new: 'hi' });
    expect(rows).toEqual([
      { depth: 0, label: '(root)', isLast: true, ancestorLast: [], type: 'same', leftValue: '{2}', rightValue: '{2}' },
      { depth: 1, label: 'a', isLast: false, ancestorLast: [true], type: 'same', leftValue: '1', rightValue: '1' },
      { depth: 1, label: 'old', isLast: false, ancestorLast: [true], type: 'removed', leftValue: 'true', rightValue: undefined },
      { depth: 1, label: 'new', isLast: true, ancestorLast: [true], type: 'added', leftValue: undefined, rightValue: '"hi"' },
    ]);
  });

  it('aligns arrays by index and marks extras', () => {
    const rows = diffJsonTree([1, 2], [1, 3, 4]);
    expect(rows).toEqual([
      { depth: 0, label: '(root)', isLast: true, ancestorLast: [], type: 'same', leftValue: '[2]', rightValue: '[3]' },
      { depth: 1, label: '[0]', isLast: false, ancestorLast: [true], type: 'same', leftValue: '1', rightValue: '1' },
      { depth: 1, label: '[1]', isLast: false, ancestorLast: [true], type: 'changed', leftValue: '2', rightValue: '3' },
      { depth: 1, label: '[2]', isLast: true, ancestorLast: [true], type: 'added', leftValue: undefined, rightValue: '4' },
    ]);
  });

  it('recurses into nested objects with increasing depth', () => {
    const rows = diffJsonTree(
      { user: { name: 'A', age: 30 } },
      { user: { name: 'B', age: 30 } },
    );
    expect(rows).toEqual([
      { depth: 0, label: '(root)', isLast: true, ancestorLast: [], type: 'same', leftValue: '{1}', rightValue: '{1}' },
      { depth: 1, label: 'user', isLast: true, ancestorLast: [true], type: 'same', leftValue: '{2}', rightValue: '{2}' },
      { depth: 2, label: 'name', isLast: false, ancestorLast: [true, true], type: 'changed', leftValue: '"A"', rightValue: '"B"' },
      { depth: 2, label: 'age', isLast: true, ancestorLast: [true, true], type: 'same', leftValue: '30', rightValue: '30' },
    ]);
  });

  it('recurses into array of objects', () => {
    const rows = diffJsonTree(
      { courses: [{ id: 1, title: 'OS' }] },
      { courses: [{ id: 1, title: 'DB' }] },
    );
    expect(rows).toEqual([
      { depth: 0, label: '(root)', isLast: true, ancestorLast: [], type: 'same', leftValue: '{1}', rightValue: '{1}' },
      { depth: 1, label: 'courses', isLast: true, ancestorLast: [true], type: 'same', leftValue: '[1]', rightValue: '[1]' },
      { depth: 2, label: '[0]', isLast: true, ancestorLast: [true, true], type: 'same', leftValue: '{2}', rightValue: '{2}' },
      { depth: 3, label: 'id', isLast: false, ancestorLast: [true, true, true], type: 'same', leftValue: '1', rightValue: '1' },
      { depth: 3, label: 'title', isLast: true, ancestorLast: [true, true, true], type: 'changed', leftValue: '"OS"', rightValue: '"DB"' },
    ]);
  });

  it('emits added subtree rows recursively with correct isLast', () => {
    const rows = diffJsonTree({}, { extra: { x: 1, y: [2] } });
    expect(rows).toEqual([
      { depth: 0, label: '(root)', isLast: true, ancestorLast: [], type: 'same', leftValue: '{0}', rightValue: '{1}' },
      { depth: 1, label: 'extra', isLast: true, ancestorLast: [true], type: 'added', leftValue: undefined, rightValue: '{"x":1,"y":[2]}' },
      { depth: 2, label: 'x', isLast: false, ancestorLast: [true, true], type: 'added', leftValue: undefined, rightValue: '1' },
      { depth: 2, label: 'y', isLast: true, ancestorLast: [true, true], type: 'added', leftValue: undefined, rightValue: '[2]' },
      { depth: 3, label: '[0]', isLast: true, ancestorLast: [true, true, true], type: 'added', leftValue: undefined, rightValue: '2' },
    ]);
  });

  it('marks container-vs-scalar as changed', () => {
    const rows = diffJsonTree({ a: [1, 2] }, { a: 'plain' });
    expect(rows).toEqual([
      { depth: 0, label: '(root)', isLast: true, ancestorLast: [], type: 'same', leftValue: '{1}', rightValue: '{1}' },
      { depth: 1, label: 'a', isLast: true, ancestorLast: [true], type: 'changed', leftValue: '[1,2]', rightValue: '"plain"' },
    ]);
  });

  it('treats null as a scalar', () => {
    const rows = diffJsonTree({ a: null }, { a: null });
    expect(rows[1]).toEqual({ depth: 1, label: 'a', isLast: true, ancestorLast: [true], type: 'same', leftValue: 'null', rightValue: 'null' });
  });
});

describe('summarizeJsonTree', () => {
  it('counts row types', () => {
    const rows = diffJsonTree({ a: 1, b: 2, c: 3 }, { a: 1, b: 9, d: 4 });
    expect(summarizeJsonTree(rows)).toEqual({ same: 2, added: 1, removed: 1, changed: 1 });
  });
});
