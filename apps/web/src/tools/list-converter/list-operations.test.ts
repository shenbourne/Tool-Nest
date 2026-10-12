import { describe, expect, it } from 'vitest';
import { convertList, DEFAULT_LIST_OPTIONS, type ListOptions } from './list-converter.service';

const lines: ListOptions = { ...DEFAULT_LIST_OPTIONS, inputSeparator: '\n', separator: '\n', trimItems: false, removeEmpty: false };

describe('unified list operations', () => {
  it('defaults to automatic input detection with whitespace trimming', () => {
    expect(DEFAULT_LIST_OPTIONS.inputSeparator).toBeUndefined();
    expect(DEFAULT_LIST_OPTIONS.trimItems).toBe(true);
    expect(convertList(' banana, apple ,banana ', DEFAULT_LIST_OPTIONS)).toBe('banana,apple,banana');
  });
  it('honors explicit newline input when each item contains a comma', () => {
    expect(convertList('b,2\na,1', { ...lines, sortItems: 'asc' })).toBe('a,1\nb,2');
  });
  it('automatically recognizes multiline input without splitting embedded commas', () => {
    expect(convertList('New York, US\nLondon, UK', { ...DEFAULT_LIST_OPTIONS, separator: ' | ' })).toBe('New York, US | London, UK');
  });
  it('sorts whole lines naturally, preserving blank items and case-insensitive order', () => {
    const sorted = { ...lines, sortItems: 'asc' as const };
    expect(convertList('z,b\n\na,c', sorted)).toBe('\na,c\nz,b');
    expect(convertList('item10\nitem2\nitem1', sorted)).toBe('item1\nitem2\nitem10');
    expect(convertList('banana\nApple', sorted)).toBe('Apple\nbanana');
    expect(convertList('9\n10\n2', sorted)).toBe('2\n9\n10');
  });
  it('wraps each original line, including blank items and spaces', () => {
    expect(convertList(' New York, US \r\n\r\nLondon', { ...lines, itemPrefix: '"', itemSuffix: '"' })).toBe('" New York, US "\n""\n"London"');
  });
  it('joins lines using any output separator, including empty text', () => {
    expect(convertList('a,b\n\nc,d', { ...lines, separator: ', ' })).toBe('a,b, , c,d');
    expect(convertList(' a \nb', { ...lines, separator: ' / ' })).toBe(' a  / b');
    expect(convertList('a\nb', { ...lines, separator: '' })).toBe('ab');
  });
  it('supports custom multicharacter input independently of output', () => {
    expect(convertList('a,b::c,d', { ...DEFAULT_LIST_OPTIONS, inputSeparator: '::', separator: ' | ' })).toBe('a,b | c,d');
    expect(convertList('aautob', { ...DEFAULT_LIST_OPTIONS, inputSeparator: 'auto', separator: ',' })).toBe('a,b');
    expect(() => convertList('abc', { ...DEFAULT_LIST_OPTIONS, inputSeparator: '' })).toThrow('inputSeparatorRequired');
  });
  it('composes cleanup, dedup, sorting, wrapping and joining in one pipeline', () => {
    expect(convertList(' B,1 \nA,2\nB,1\n', {
      ...lines, trimItems: true, lowerCase: true, removeEmpty: true,
      removeDuplicates: true, sortItems: 'asc', itemPrefix: '[', itemSuffix: ']', separator: ';',
    })).toBe('[a,2];[b,1]');
    expect(convertList('', DEFAULT_LIST_OPTIONS)).toBe('');
  });
  it('defaults output to the detected or explicitly selected input separator', () => {
    expect(DEFAULT_LIST_OPTIONS.separator).toBeNull();
    expect(convertList(' b; a ', DEFAULT_LIST_OPTIONS)).toBe('b;a');
    expect(convertList('b\r\na', DEFAULT_LIST_OPTIONS)).toBe('b\r\na');
    expect(convertList(' b:: a ', { ...DEFAULT_LIST_OPTIONS, inputSeparator: '::' })).toBe('b::a');
    expect(convertList(' b:: a ', { ...DEFAULT_LIST_OPTIONS, inputSeparator: '::', separator: '|' })).toBe('b|a');
  });
});
