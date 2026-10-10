import { describe, expect, it } from 'vitest';
import { convertAsciiBinaryToText, convertTextToAsciiBinary } from './text-to-binary.service';

describe('convertAsciiBinaryToText', () => {
  it('decodes valid binary', () => {
    expect(convertAsciiBinaryToText('01000001')).toBe('A');
  });

  it('rejects stray characters instead of stripping them', () => {
    expect(() => convertAsciiBinaryToText('0100000102')).toThrow();
    expect(() => convertAsciiBinaryToText('0100 0001xyz')).toThrow();
  });

  it('rejects lengths that are not multiples of 8', () => {
    expect(() => convertAsciiBinaryToText('0101')).toThrow();
  });

  it('round-trips with the encoder', () => {
    expect(convertAsciiBinaryToText(convertTextToAsciiBinary('Hi'))).toBe('Hi');
  });
});
