import { describe, expect, it } from 'vitest';
import { convertList, type ListOptions } from './list-converter.service';

const defaults: ListOptions = {
  separator: ',', trimItems: true, removeEmpty: true, lowerCase: false,
  sortItems: 'none', removeDuplicates: false, itemPrefix: '', itemSuffix: '',
};

describe('list separator conversion', () => {
  it.each([',', ';', '\n', '\t', '|', ' '])('converts comma input to %j', separator => {
    expect(convertList('apple, banana, cherry', { ...defaults, separator }))
      .toBe(['apple', 'banana', 'cherry'].join(separator));
  });

  it.each([';', '\n', '\r\n', '\t', '|', ' '])('recognizes input delimiter %j', separator => {
    expect(convertList(['apple', 'banana', 'cherry'].join(separator), defaults))
      .toBe('apple,banana,cherry');
  });

  it('preserves spaces inside delimited items', () => {
    expect(convertList('New York, Los Angeles', { ...defaults, separator: '\t' }))
      .toBe('New York\tLos Angeles');
  });

  it('preserves empty CRLF items when removal is disabled', () => {
    expect(convertList('a\r\n\r\nb', { ...defaults, removeEmpty: false, separator: ';' }))
      .toBe('a;;b');
  });

  it('applies transformations to items before joining with the selected separator', () => {
    expect(convertList(' Banana,apple, ,BANANA,cherry', {
      ...defaults, separator: '|', lowerCase: true, removeDuplicates: true,
      sortItems: 'asc', itemPrefix: '[', itemSuffix: ']',
    })).toBe('[apple]|[banana]|[cherry]');
  });

  it('preserves an empty input', () => {
    expect(convertList('', defaults)).toBe('');
  });
});
