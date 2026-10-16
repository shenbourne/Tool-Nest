import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { useListSeparators } from './useListSeparators';

describe('list tool delimiter state', () => {
  it('updates same-as-input output when automatic input detection changes', () => {
    const input = ref('a,b');
    const state = useListSeparators(input);
    expect(state.inputSeparator.value).toBeUndefined();
    expect(state.outputSeparator.value).toBeNull();
    expect(state.formatOutput([...state.items.value].reverse())).toBe('b,a');
    input.value = 'a;b';
    expect(state.formatOutput([...state.items.value].reverse())).toBe('b;a');
  });
  it('keeps output choice independent of explicit custom input and supports empty output', () => {
    const state = useListSeparators(ref('a,b::c,d'));
    state.inputSeparator.value = '::';
    expect(state.items.value).toEqual(['a,b', 'c,d']);
    expect(state.formatOutput(state.items.value)).toBe('a,b::c,d');
    state.outputSeparator.value = '|';
    expect(state.formatOutput(state.items.value)).toBe('a,b|c,d');
    state.outputSeparator.value = '';
    expect(state.formatOutput(state.items.value)).toBe('a,bc,d');
    state.inputSeparator.value = '';
    expect(state.items.value).toEqual([]);
    expect(state.formatOutput(['a'])).toBe('');
  });
});
