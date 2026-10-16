import { describe, expect, it, vi } from 'vitest';
import { createListProcessingState } from './list-processing-state';
import { seededRandom, type PipelineOptions } from './list-pipeline';

describe('list processing state', () => {
  it('repeats confirmed actions on the full list before slicing', () => {
    const state = createListProcessingState('a,b,c,d');
    expect(state.confirm('reverse').result.output).toBe('d,c,b,a');
    expect(state.confirm('reverse').result.output).toBe('a,b,c,d');
    state.updateOptions({ positions: 1 });
    expect(state.confirm('rotate').result.output).toBe('b,c,d,a');
    expect(state.confirm('rotate').result.output).toBe('c,d,a,b');
    state.updateOptions({ start: 2, end: 3 });
    expect(state.confirm('reverse').result).toMatchObject({ beforeSlice: ['b','a','d','c'], output: 'a,d' });
  });
  it.each([
    ['inputSeparator', '|'], ['conversionEnabled', false], ['trimItems', true], ['removeEmpty', true],
    ['lowerCase', true], ['removeDuplicates', true], ['unwrap', true], ['reorderEnabled', false], ['sortItems', 'asc'],
  ] as [keyof PipelineOptions, string | boolean][])('invalidates confirmed order for upstream %s', (key, value) => {
    const state = createListProcessingState('b,d,a,c'); state.confirm('reverse');
    expect(state.updateOptions({ [key]: value }).result.beforeSlice).not.toEqual(['c','a','d','b']);
  });
  it('preserves confirmed order for no-op updates and downstream presentation', () => {
    const state = createListProcessingState('a,b,c'); state.confirm('reverse');
    expect(state.setInput('a,b,c').result.items).toEqual(['c','b','a']);
    expect(state.updateOptions({ trimItems: false, positions: 2 }).result.items).toEqual(['c','b','a']);
    const result = state.updateOptions({ itemPrefix: '[', itemSuffix: ']', separator: '|', groupSize: 1, groupSeparator: ';' }).result;
    expect(result.output).toBe('[c];[b];[a]'); expect(result.items).toEqual(['c','b','a']);
    expect(state.updateOptions({ start: 2, end: 2 }).result.output).toBe('[b]');
  });
  it('consumes random values only for explicit shuffle, not reads or format changes', () => {
    const random = vi.fn(seededRandom(12)); const state = createListProcessingState('a,b,c,d', random);
    state.updateOptions({ reverse: true, rotate: true, shuffle: true }); state.read();
    expect(random).not.toHaveBeenCalled(); expect(state.read().result.output).toBe('a,b,c,d');
    const shuffled = state.confirm('shuffle').result.items; expect(random).toHaveBeenCalledTimes(3);
    state.read(); expect(state.updateOptions({ itemPrefix: '!' }).result.items).toEqual(shuffled);
    expect(random).toHaveBeenCalledTimes(3); state.confirm('shuffle'); expect(random).toHaveBeenCalledTimes(6);
  });
  it('resets for changed input, handles automatic separators and output-as-input', () => {
    const state = createListProcessingState('a\r\nb\r\nc');
    expect(state.read().result.output).toBe('a\r\nb\r\nc');
    const result = state.confirm('reverse').result.output;
    expect(state.setInput(result).result.items).toEqual(['c','b','a']);
    expect(state.confirm('reverse').result.items).toEqual(['a','b','c']);
    expect(state.setInput('x;y').result.items).toEqual(['x','y']);
  });
  it('normalizes ranges, follows the tail and preserves non-tail selection', () => {
    const state = createListProcessingState('a,b,c,d');
    expect(state.setInput('a,b,c,d,e,f').options.end).toBe(6);
    state.updateOptions({ end: 2 }); expect(state.setInput('a,b,c,d,e,f,g').options.end).toBe(2);
    expect(state.updateOptions({ start: 5 }).options).toMatchObject({ start: 5, end: 5 });
    expect(state.updateOptions({ end: 3 }).options).toMatchObject({ start: 3, end: 3 });
    expect(state.updateOptions({ start: 2, end: 7 }).options).toMatchObject({ start: 2, end: 7 });
    expect(state.setInput('a').options).toMatchObject({ start: 1, end: 1 });
    expect(state.setInput('')).toMatchObject({ result: { output: '', items: [] }, max: 1, options: { start: 1, end: 1 } });
  });
  it('applies legacy option initialization and returns independent nested snapshots', () => {
    const state = createListProcessingState('"c","a","b"');
    expect(state.updateOptions({ unwrap: true, sortItems: 'asc', groupSize: 1 }).result.items).toEqual(['a','b','c']);
    const copy = state.read(); copy.options.sortItems = 'desc'; copy.result.items[0] = 'corrupt'; copy.result.groups[0][0] = 'corrupt';
    expect(state.read().options.sortItems).toBe('asc'); expect(state.read().result.items).toEqual(['a','b','c']);
    expect(state.read().result.groups).toEqual([['a'],['b'],['c']]);
  });
});
