import { describe, expect, it } from 'vitest';
import { splitListInput } from './list-input';

describe('shared list input parsing', () => {
  it.each([',', ';', '\n', '\t', '|', ' '])('automatically recognizes %j', delimiter => {
    expect(splitListInput(['a', 'b', 'c'].join(delimiter))).toEqual(['a', 'b', 'c']);
  });
  it('prefers complete lines and preserves item content, blank entries and CRLF', () => {
    expect(splitListInput('New York, US\r\n\r\nLos Angeles, US')).toEqual(['New York, US', '', 'Los Angeles, US']);
    expect(splitListInput('New York\nLos Angeles')).toEqual(['New York', 'Los Angeles']);
  });
  it('supports explicit custom delimiters and treats auto as literal custom text', () => {
    expect(splitListInput('a,b::c,d', '::')).toEqual(['a,b', 'c,d']);
    expect(splitListInput('aautob', 'auto')).toEqual(['a', 'b']);
  });
  it('preserves surrounding item spaces for each tool to decide how to clean', () => {
    expect(splitListInput(' a , b ')).toEqual([' a ', ' b ']);
    expect(splitListInput('New York')).toEqual(['New', 'York']);
  });
  it('returns no items for empty input or invalid empty custom separator', () => {
    expect(splitListInput('')).toEqual([]);
    expect(splitListInput('abc', '')).toEqual([]);
  });
});
