import { describe, expect, it } from 'vitest';
import {
  canRedo,
  canUndo,
  commit,
  createHistory,
  historyState,
  moveLine,
  moveLineEndpoint,
  paramsFor,
  redo,
  undo,
  type Annotation,
  type LineAnnotation,
  type TextAnnotation,
} from './image-editor.service';

const line = (points: [number, number, number, number] = [10, 20, 30, 40]): LineAnnotation => ({
  id: 1,
  type: 'line',
  points,
  color: '#ff0000',
  strokeWidth: 3,
});

const text = (): TextAnnotation => ({
  id: 2,
  type: 'text',
  x: 5,
  y: 6,
  text: 'hi',
  fontSize: 24,
  color: '#ff0000',
});

describe('paramsFor', () => {
  it('shows only the text parameters while the text tool is active', () => {
    expect(paramsFor('text', null)).toEqual(['color', 'fontSize', 'text']);
  });

  it('shows only the line parameters while the line tool is active', () => {
    expect(paramsFor('line', null)).toEqual(['color', 'lineWidth']);
  });

  it('shows nothing in select mode with no selection', () => {
    expect(paramsFor('none', null)).toEqual([]);
  });

  it("shows the selected annotation's parameters in select mode", () => {
    expect(paramsFor('none', text())).toEqual(['color', 'fontSize', 'text']);
    expect(paramsFor('none', line())).toEqual(['color', 'lineWidth']);
  });

  it('keeps the active tool in charge while it is drawing', () => {
    // The tool decides while it is active, so an existing selection cannot
    // change the rows under the pointer that is about to add an annotation.
    expect(paramsFor('text', line())).toEqual(['color', 'fontSize', 'text']);
    expect(paramsFor('line', text())).toEqual(['color', 'lineWidth']);
  });
});

describe('annotation history', () => {
  it('starts with nothing to undo or redo', () => {
    const history = createHistory<Annotation[]>([]);
    expect(canUndo(history)).toBe(false);
    expect(canRedo(history)).toBe(false);
    expect(historyState(history)).toEqual([]);
  });

  it('walks back and forward through committed states', () => {
    let history = createHistory<number[]>([]);
    history = commit(history, [1]);
    history = commit(history, [1, 2]);
    expect(canUndo(history)).toBe(true);
    expect(canRedo(history)).toBe(false);
    expect(historyState(history)).toEqual([1, 2]);

    history = undo(history);
    expect(historyState(history)).toEqual([1]);
    expect(canRedo(history)).toBe(true);

    history = undo(history);
    expect(historyState(history)).toEqual([]);
    expect(canUndo(history)).toBe(false);

    // Undoing past the oldest state is a no-op rather than an error.
    history = undo(history);
    expect(historyState(history)).toEqual([]);

    history = redo(history);
    expect(historyState(history)).toEqual([1]);
    history = redo(history);
    expect(historyState(history)).toEqual([1, 2]);
    // Redoing past the newest state is a no-op too.
    history = redo(history);
    expect(historyState(history)).toEqual([1, 2]);
  });

  it('drops the redo tail when a new state is committed', () => {
    let history = createHistory<number[]>([]);
    history = commit(history, [1]);
    history = commit(history, [1, 2]);
    history = undo(history);
    expect(canRedo(history)).toBe(true);

    history = commit(history, [9]);
    expect(canRedo(history)).toBe(false);
    expect(historyState(history)).toEqual([9]);
    history = undo(history);
    expect(historyState(history)).toEqual([1]);
  });

  it('never hands out a reference into its own snapshots', () => {
    // The component edits the annotations in place, so a shared reference
    // would silently rewrite history.
    let history = createHistory<TextAnnotation[]>([]);
    history = commit(history, [text()]);

    const handed = historyState(history);
    handed[0].x = 999;
    expect(historyState(history)[0].x).toBe(5);

    const restored = historyState(history);
    restored.push(text());
    expect(historyState(history)).toHaveLength(1);
  });

  it('keeps only the newest states once the cap is reached', () => {
    let history = createHistory<number[]>([], 3);
    for (const value of [1, 2, 3, 4]) history = commit(history, [value]);

    expect(history.states).toHaveLength(3);
    expect(historyState(history)).toEqual([4]);
    expect(canUndo(history)).toBe(true);

    history = undo(history);
    history = undo(history);
    expect(historyState(history)).toEqual([2]);
    // The oldest retained state is the floor: state [1] was dropped.
    expect(canUndo(history)).toBe(false);
  });
});

describe('line moves', () => {
  it('translates both endpoints by the same delta', () => {
    expect(moveLine(line(), 5, -3).points).toEqual([15, 17, 35, 37]);
  });

  it('moves one endpoint and leaves the other alone', () => {
    expect(moveLineEndpoint(line(), 0, 100, 200).points).toEqual([100, 200, 30, 40]);
    expect(moveLineEndpoint(line(), 1, 7, 8).points).toEqual([10, 20, 7, 8]);
  });

  it('returns a new annotation instead of mutating the given one', () => {
    const original = line();
    const moved = moveLineEndpoint(original, 0, 1, 1);
    expect(original.points).toEqual([10, 20, 30, 40]);
    expect(moved).not.toBe(original);
    expect(moved.color).toBe(original.color);
    expect(moved.strokeWidth).toBe(original.strokeWidth);
    expect(moved.id).toBe(original.id);
  });
});
