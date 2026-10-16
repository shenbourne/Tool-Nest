import { describe, expect, it } from 'vitest';
import { createTextProcessingState, type TextProcessingOptions } from './text-processing-state';

describe('text processing state', () => {
  it('repeats actions on the complete confirmed text, before slicing', () => {
    const state = createTextProcessingState('abcd');
    expect(state.confirm('reverse').output).toBe('dcba');
    expect(state.confirm('reverse').output).toBe('abcd');
    expect(state.confirm('rotate').output).toBe('bcda');
    expect(state.confirm('rotate').output).toBe('cdab');
    state.updateOptions({ start: 2, end: 3 });
    expect(state.confirm('reverse')).toMatchObject({ beforeSlice: 'badc', output: 'ad' });
  });
  it.each([
    ['find', 'a'], ['replacement', '!'], ['regex', true], ['deduplicate', true], ['keepEmpty', false],
  ] as [keyof TextProcessingOptions, string | boolean][])('clears confirmed order when upstream %s changes', (key, value) => {
    const state = createTextProcessingState('abcd'); state.confirm('reverse');
    const changed = state.updateOptions({ [key]: value });
    expect(changed.beforeSlice).not.toBe('dcba');
  });
  it('preserves order for identical updates, positions and slicing mode', () => {
    const state = createTextProcessingState('ab cd'); state.confirm('reverse');
    expect(state.setInput('ab cd').beforeSlice).toBe('dc ba');
    expect(state.updateOptions({ find: '', positions: 2 }).beforeSlice).toBe('dc ba');
    expect(state.updateOptions({ mode: 'words' })).toMatchObject({ beforeSlice: 'dc ba', output: 'dc ba', options: { start: 1, end: 2 } });
    expect(state.updateOptions({ start: 2, end: 2 }).output).toBe('ba');
  });
  it('resets confirmed state for new input, including output-as-input', () => {
    const state = createTextProcessingState('abcd'); const reversed = state.confirm('reverse').output;
    expect(state.setInput(reversed).beforeSlice).toBe('dcba');
    expect(state.confirm('reverse').output).toBe('abcd');
    expect(state.setInput('xyz').output).toBe('xyz');
  });
  it('follows the old end only at the tail, clamps shortening and reconciles endpoints', () => {
    const state = createTextProcessingState('abcd');
    expect(state.setInput('abcdef').options.end).toBe(6);
    state.updateOptions({ end: 2 }); expect(state.setInput('abcdefgh').options.end).toBe(2);
    expect(state.updateOptions({ start: 5 }).options).toMatchObject({ start: 5, end: 5 });
    expect(state.updateOptions({ end: 3 }).options).toMatchObject({ start: 3, end: 3 });
    expect(state.updateOptions({ start: 2, end: 7 }).options).toMatchObject({ start: 2, end: 7 });
    expect(state.setInput('a').options).toMatchObject({ start: 1, end: 1 });
    expect(state.setInput('')).toMatchObject({ output: '', max: 1, options: { start: 1, end: 1 } });
  });
  it('preserves whitespace for a neutral full word range and reverses Unicode characters', () => {
    const state = createTextProcessingState('  a   b  ');
    expect(state.updateOptions({ mode: 'words' }).output).toBe('  a   b  ');
    const unicode = createTextProcessingState('A😀B'); expect(unicode.confirm('reverse').output).toBe('B😀A');
  });
  it('returns regex errors without old confirmed text and recovers through normal updates', () => {
    const state = createTextProcessingState('abcd'); state.confirm('reverse');
    expect(state.updateOptions({ regex: true, find: '[' })).toMatchObject({ error: 'invalidRegex', output: '', beforeSlice: '' });
    expect(state.confirm('reverse').output).toBe('');
    expect(state.updateOptions({ find: 'a', replacement: 'X' })).toMatchObject({ error: null, beforeSlice: 'Xbcd', output: 'Xbcd' });
    state.read().options.find = 'b'; expect(state.read().options.find).toBe('a');
  });
  it('keeps the staged order replace then deduplicate then confirm then slice', () => {
    const state = createTextProcessingState('a\na\nb');
    state.updateOptions({ find: 'a', replacement: 'c', deduplicate: true });
    expect(state.confirm('reverse').beforeSlice).toBe('b\nc');
    expect(state.updateOptions({ mode: 'lines', start: 1, end: 1 }).output).toBe('b');
  });
});
