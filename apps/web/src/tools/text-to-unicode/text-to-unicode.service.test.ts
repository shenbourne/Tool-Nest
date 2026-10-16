import { describe, expect, it } from 'vitest';
import { convertTextToUnicode, convertUnicodeToText } from './text-to-unicode.service';

describe('Unicode entity conversion', () => {
  it('uses Unicode scalar values for supplementary characters', () => {
    expect(convertTextToUnicode('A😀')).toBe('&#65;&#128512;');
    expect(convertUnicodeToText('&#128512;')).toBe('😀');
  });

  it('leaves invalid scalar entities unchanged', () => {
    expect(convertUnicodeToText('&#55296; &#1114112;')).toBe('&#55296; &#1114112;');
  });
});
