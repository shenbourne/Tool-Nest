import { describe, it, expect } from 'vitest';
import { diffLines, summarize } from './line-diff';

describe('diffLines', () => {
  it('marks identical texts as all same with sequential numbers on both sides', () => {
    const rows = diffLines('a\nb\nc', 'a\nb\nc');
    expect(rows.map(r => r.type)).toEqual(['same', 'same', 'same']);
    expect(rows.map(r => r.leftNum)).toEqual([1, 2, 3]);
    expect(rows.map(r => r.rightNum)).toEqual([1, 2, 3]);
    expect(rows[0].leftText).toBe('a');
    expect(rows[0].rightText).toBe('a');
  });

  it('keeps lines aligned after a mid-text insertion', () => {
    const rows = diffLines('a\nb\nc', 'a\nx\nb\nc');
    expect(rows.map(r => r.type)).toEqual(['same', 'added', 'same', 'same']);
    expect(rows[1].rightText).toBe('x');
    expect(rows[1].rightNum).toBe(2);
    expect(rows[1].leftNum).toBeUndefined();
    expect(rows[2].leftNum).toBe(2);
    expect(rows[2].rightNum).toBe(3);
  });

  it('keeps lines aligned after a mid-text deletion', () => {
    const rows = diffLines('a\nx\nb\nc', 'a\nb\nc');
    expect(rows.map(r => r.type)).toEqual(['same', 'removed', 'same', 'same']);
    expect(rows[1].leftText).toBe('x');
    expect(rows[1].leftNum).toBe(2);
    expect(rows[1].rightNum).toBeUndefined();
  });

  it('pairs replaced lines into changed rows with char-level segments', () => {
    const rows = diffLines('foo 1', 'foo 2');
    expect(rows.map(r => r.type)).toEqual(['changed']);
    const row = rows[0];
    expect(row.leftNum).toBe(1);
    expect(row.rightNum).toBe(1);
    expect(row.leftSegments).toEqual([
      { text: 'foo ', changed: false },
      { text: '1', changed: true },
    ]);
    expect(row.rightSegments).toEqual([
      { text: 'foo ', changed: false },
      { text: '2', changed: true },
    ]);
  });

  it('highlights the whole line when a changed pair shares nothing', () => {
    const rows = diffLines('aaa', 'bbb');
    expect(rows[0].type).toBe('changed');
    expect(rows[0].leftSegments).toEqual([{ text: 'aaa', changed: true }]);
    expect(rows[0].rightSegments).toEqual([{ text: 'bbb', changed: true }]);
  });

  it('splits common prefix and suffix around the changed middle', () => {
    const rows = diffLines('start-middle-end', 'start-MIDDLE-end');
    expect(rows[0].leftSegments).toEqual([
      { text: 'start-', changed: false },
      { text: 'middle', changed: true },
      { text: '-end', changed: false },
    ]);
    expect(rows[0].rightSegments).toEqual([
      { text: 'start-', changed: false },
      { text: 'MIDDLE', changed: true },
      { text: '-end', changed: false },
    ]);
  });

  it('treats an empty original as all added', () => {
    const rows = diffLines('', 'a\nb');
    expect(rows.map(r => r.type)).toEqual(['added', 'added']);
    expect(rows.map(r => r.rightNum)).toEqual([1, 2]);
  });

  it('treats an empty modified text as all removed', () => {
    const rows = diffLines('a\nb', '');
    expect(rows.map(r => r.type)).toEqual(['removed', 'removed']);
    expect(rows.map(r => r.leftNum)).toEqual([1, 2]);
  });

  it('ignores one trailing newline instead of diffing a phantom empty line', () => {
    const rows = diffLines('a\nb\n', 'a\nb');
    expect(rows.map(r => r.type)).toEqual(['same', 'same']);
  });

  it('still sees a real blank trailing line', () => {
    const rows = diffLines('a\n\n', 'a');
    expect(rows.map(r => r.type)).toEqual(['same', 'removed']);
    expect(rows[1].leftText).toBe('');
  });

  it('normalizes CRLF before comparing', () => {
    const rows = diffLines('a\r\nb', 'a\nb');
    expect(rows.map(r => r.type)).toEqual(['same', 'same']);
  });

  it('pairs unequal delete/insert runs, leaving leftovers as removed/added', () => {
    const rows = diffLines('a\n1\n2\n3\nb', 'a\nx\nb');
    expect(rows.map(r => r.type)).toEqual([
      'same', 'changed', 'removed', 'removed', 'same',
    ]);
    expect(rows[1].leftText).toBe('1');
    expect(rows[1].rightText).toBe('x');
  });
});

describe('summarize', () => {
  it('counts each row type', () => {
    const rows = diffLines('a\nb\nc\nd', 'a\nx\nc\ny\nz');
    expect(summarize(rows)).toEqual({ same: 2, added: 1, removed: 0, changed: 2 });
  });
});
