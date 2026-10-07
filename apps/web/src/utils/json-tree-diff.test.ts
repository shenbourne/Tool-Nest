import { describe, expect, it } from 'vitest';
import { diffJsonTree, summarizeJsonTree } from './json-tree-diff';

describe('diffJsonTree', () => {
  it('compares equal scalars as same', () => {
    expect(diffJsonTree(1, 1)).toEqual([
      { depth: 0, label: '(root)', type: 'same', leftValue: '1', rightValue: '1' },
    ]);
  });

  it('compares different scalars as changed', () => {
    expect(diffJsonTree(1, 2)).toEqual([
      { depth: 0, label: '(root)', type: 'changed', leftValue: '1', rightValue: '2' },
    ]);
  });

  it('lists unchanged object keys as same rows', () => {
    const rows = diffJsonTree({ a: 1, b: 'x' }, { a: 1, b: 'x' });
    expect(rows).toEqual([
      { depth: 0, label: '(root)', type: 'same', leftValue: '{2}', rightValue: '{2}' },
      { depth: 1, label: 'a', type: 'same', leftValue: '1', rightValue: '1' },
      { depth: 1, label: 'b', type: 'same', leftValue: '"x"', rightValue: '"x"' },
    ]);
  });

  it('marks added and removed object keys', () => {
    const rows = diffJsonTree({ a: 1, old: true }, { a: 1, new: 'hi' });
    expect(rows).toEqual([
      { depth: 0, label: '(root)', type: 'same', leftValue: '{2}', rightValue: '{2}' },
      { depth: 1, label: 'a', type: 'same', leftValue: '1', rightValue: '1' },
      { depth: 1, label: 'old', type: 'removed', leftValue: 'true', rightValue: undefined },
      { depth: 1, label: 'new', type: 'added', leftValue: undefined, rightValue: '"hi"' },
    ]);
  });

  it('aligns arrays by index and marks extras', () => {
    const rows = diffJsonTree([1, 2], [1, 3, 4]);
    expect(rows).toEqual([
      { depth: 0, label: '(root)', type: 'same', leftValue: '[2]', rightValue: '[3]' },
      { depth: 1, label: '[0]', type: 'same', leftValue: '1', rightValue: '1' },
      { depth: 1, label: '[1]', type: 'changed', leftValue: '2', rightValue: '3' },
      { depth: 1, label: '[2]', type: 'added', leftValue: undefined, rightValue: '4' },
    ]);
  });

  it('recurses into nested objects with increasing depth', () => {
    const rows = diffJsonTree(
      { user: { name: 'A', age: 30 } },
      { user: { name: 'B', age: 30 } },
    );
    expect(rows).toEqual([
      { depth: 0, label: '(root)', type: 'same', leftValue: '{1}', rightValue: '{1}' },
      { depth: 1, label: 'user', type: 'same', leftValue: '{2}', rightValue: '{2}' },
      { depth: 2, label: 'name', type: 'changed', leftValue: '"A"', rightValue: '"B"' },
      { depth: 2, label: 'age', type: 'same', leftValue: '30', rightValue: '30' },
    ]);
  });

  it('recurses into array of objects', () => {
    const rows = diffJsonTree(
      { courses: [{ id: 1, title: 'OS' }] },
      { courses: [{ id: 1, title: 'DB' }] },
    );
    expect(rows).toEqual([
      { depth: 0, label: '(root)', type: 'same', leftValue: '{1}', rightValue: '{1}' },
      { depth: 1, label: 'courses', type: 'same', leftValue: '[1]', rightValue: '[1]' },
      { depth: 2, label: '[0]', type: 'same', leftValue: '{2}', rightValue: '{2}' },
      { depth: 3, label: 'id', type: 'same', leftValue: '1', rightValue: '1' },
      { depth: 3, label: 'title', type: 'changed', leftValue: '"OS"', rightValue: '"DB"' },
    ]);
  });

  it('emits added subtree rows recursively', () => {
    const rows = diffJsonTree({}, { extra: { x: 1, y: [2] } });
    expect(rows).toEqual([
      { depth: 0, label: '(root)', type: 'same', leftValue: '{0}', rightValue: '{1}' },
      { depth: 1, label: 'extra', type: 'added', leftValue: undefined, rightValue: '{"x":1,"y":[2]}' },
      { depth: 2, label: 'x', type: 'added', leftValue: undefined, rightValue: '1' },
      { depth: 2, label: 'y', type: 'added', leftValue: undefined, rightValue: '[2]' },
      { depth: 3, label: '[0]', type: 'added', leftValue: undefined, rightValue: '2' },
    ]);
  });

  it('marks container-vs-scalar as changed', () => {
    const rows = diffJsonTree({ a: [1, 2] }, { a: 'plain' });
    expect(rows).toEqual([
      { depth: 0, label: '(root)', type: 'same', leftValue: '{1}', rightValue: '{1}' },
      { depth: 1, label: 'a', type: 'changed', leftValue: '[1,2]', rightValue: '"plain"' },
    ]);
  });

  it('treats null as a scalar', () => {
    const rows = diffJsonTree({ a: null }, { a: null });
    expect(rows[1]).toEqual({ depth: 1, label: 'a', type: 'same', leftValue: 'null', rightValue: 'null' });
  });
});

describe('summarizeJsonTree', () => {
  it('counts row types', () => {
    const rows = diffJsonTree({ a: 1, b: 2, c: 3 }, { a: 1, b: 9, d: 4 });
    expect(summarizeJsonTree(rows)).toEqual({ same: 2, added: 1, removed: 1, changed: 1 });
  });
});
