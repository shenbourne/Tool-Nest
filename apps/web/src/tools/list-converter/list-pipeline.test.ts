import { describe, expect, it } from 'vitest';
import { DEFAULT_PIPELINE_OPTIONS, runListPipeline, listFrequencies, seededRandom, legacyListQuery, reorderListItems } from './list-pipeline';

describe('composed list operations', () => {
  it.each(['  a, b,a,, ', 'a\r\nb\nc\r\n', 'a\t\tb', '', '  single  '])('preserves original text with identity defaults: %j', input => {
    expect(runListPipeline(input, DEFAULT_PIPELINE_OPTIONS).output).toBe(input);
  });
  it('applies confirmed actions successively without re-sorting or replaying them', () => {
    const options = { ...DEFAULT_PIPELINE_OPTIONS, sortItems: 'asc' as const };
    const initial = runListPipeline('c,a,b', options);
    const reversed = reorderListItems(initial.beforeSlice, 'reverse');
    expect(runListPipeline('c,a,b', options, Math.random, reversed).output).toBe('c,b,a');
    const rotated = reorderListItems(reversed, 'rotate', 1);
    expect(rotated).toEqual(['b','a','c']);
    expect(reorderListItems(rotated, 'rotate', 1)).toEqual(['a','c','b']);
    expect(reorderListItems(reversed, 'reverse')).toEqual(initial.beforeSlice);
    const shuffled = reorderListItems(rotated, 'shuffle', 0, seededRandom(9));
    const wrapped = { ...options, itemPrefix: '[' };
    expect(runListPipeline('c,a,b', wrapped, Math.random, shuffled).items).toEqual(shuffled);
    expect(rotated).toEqual(['b','a','c']);
  });
  it('treats zero grouping as identity and keeps full range beyond ten items', () => {
    const input = Array.from({ length: 24 }, (_, i) => String(i)).join(',');
    const result = runListPipeline(input, DEFAULT_PIPELINE_OPTIONS);
    expect(result.items).toHaveLength(24);
    expect(result.output).toBe(input);
    expect(runListPipeline(input, { ...DEFAULT_PIPELINE_OPTIONS, groupSize: 5 }).groups.map(group => group.length)).toEqual([5,5,5,5,4]);
  });
  it('cleans before sorting, then slices and groups before wrapping', () => {
    const result = runListPipeline('"c", "a", "b", "a"', {
      ...DEFAULT_PIPELINE_OPTIONS, trimItems: true, unwrap: true, removeDuplicates: true,
      reorderEnabled: true, sortItems: 'asc', sliceEnabled: true, start: 2, end: 3,
      groupEnabled: true, groupSize: 1, groupSeparator: '|', separator: ',', itemPrefix: '[', itemSuffix: ']',
    });
    expect(result.items).toEqual(['b', 'c']);
    expect(result.output).toBe('[b]|[c]');
    expect(result.beforeSlice).toEqual(['a', 'b', 'c']);
    expect(listFrequencies(result.items)).toEqual([{ item: 'b', count: 1 }, { item: 'c', count: 1 }]);
  });
  it('ignores disabled tabs without discarding their settings', () => {
    expect(runListPipeline('b,a,b', { ...DEFAULT_PIPELINE_OPTIONS, conversionEnabled: false,
      reorderEnabled: false, sliceEnabled: false, groupEnabled: false,
      removeDuplicates: true, itemPrefix: '!', sortItems: 'asc', start: 2, end: 2, groupSize: 1,
    }).output).toBe('b,a,b');
  });
  it('composes reverse and signed rotation without mutating input items', () => {
    expect(runListPipeline('a,b,c,d', { ...DEFAULT_PIPELINE_OPTIONS, reorderEnabled: true,
      reverse: true, rotate: true, positions: -1,
    }).items).toEqual(['a', 'd', 'c', 'b']);
  });
  it('bounds range and grouping parameters, including empty input', () => {
    const options = { ...DEFAULT_PIPELINE_OPTIONS, sliceEnabled: true, start: 99, end: -2,
      groupEnabled: true, groupSize: 0 };
    expect(runListPipeline('', options).output).toBe('');
    expect(runListPipeline('a,b', options).items).toEqual(['b']);
    expect(runListPipeline('a,b,c', { ...options, start: 1, end: 3, groupSize: 1.8 }).groups).toEqual([['a'], ['b'], ['c']]);
  });
  it('keeps shuffled results stable with a seed and preserves every item', () => {
    const options = { ...DEFAULT_PIPELINE_OPTIONS, reorderEnabled: true, shuffle: true };
    const first = runListPipeline('a,b,c,d,e,f', options, seededRandom(12)).items;
    expect(runListPipeline('a,b,c,d,e,f', options, seededRandom(12)).items).toEqual(first);
    expect([...first].sort()).toEqual(['a','b','c','d','e','f']);
    expect(runListPipeline('a,b,c,d,e,f', options, seededRandom(90)).items).not.toEqual(first);
  });
  it('counts logical items safely and preserves ties in encounter order', () => {
    expect(listFrequencies(['__proto__', 'x', 'x', '__proto__', ''])).toEqual([
      { item: '__proto__', count: 2 }, { item: 'x', count: 2 }, { item: '', count: 1 },
    ]);
  });
  it('routes retired operations to their controls', () => {
    expect(legacyListQuery('/list-reverse')).toEqual({ tab: 'reorder', operation: 'reverse' });
    expect(legacyListQuery('/list-truncate')).toEqual({ tab: 'slice', operation: 'slice' });
    expect(legacyListQuery('/list-find-popular')).toEqual({ tab: 'statistics' });
    expect(legacyListQuery('/json-prettify')).toBeUndefined();
  });
});
