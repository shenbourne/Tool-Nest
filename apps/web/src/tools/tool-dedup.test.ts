import { describe, expect, it, vi } from 'vitest';
import { transposeCsv } from './csv-rows-to-columns/csv-rows-to-columns.service';
import { formatJson } from './json-prettify/json-prettify.service';
import { deduplicateLines } from './remove-duplicate-lines/remove-duplicate-lines.service';
import { generateSecret, secretPresets } from './password-generator/password-generator.service';
import { normalizeToolPreferences } from '@/utils/tool-paths';

describe('consolidated tool behavior', () => {
  it('transposes quoted, multiline and uneven CSV cells without corrupting them', () => {
    expect(transposeCsv('"a,b","say ""hi"""\n"c\nd",e')).toBe('"a,b","c\nd"\n"say ""hi""",e');
    expect(transposeCsv('a,b\nc')).toBe('a,c\nb,');
    expect(transposeCsv('')).toBe('');
  });
  it('formats JSON with spaces or tabs and recovers after invalid input', () => {
    expect(formatJson('{"a":1}', 8).formatted).toBe('{\n        "a": 1\n}');
    expect(formatJson('{"a":1}', 'tab').formatted).toBe('{\n\t"a": 1\n}');
    expect(formatJson('{', 2)).toMatchObject({ formatted: '', error: expect.any(String) });
    expect(formatJson('false', 1)).toEqual({ formatted: 'false', error: null });
    expect(formatJson(' ', 2)).toEqual({ formatted: '', error: null });
  });
  it('retains first occurrences and offers both prior empty-line behaviors', () => {
    expect(deduplicateLines('a\n\nb\na\n', true)).toBe('a\n\nb');
    expect(deduplicateLines('a\r\n\r\nb\r\na', false)).toBe('a\nb');
    expect(deduplicateLines('A\na\n a', false)).toBe('A\na\n a');
  });
  it('preserves presets, secure random generation, exclusions and upper length', () => {
    expect(secretPresets.password).toMatchObject({ length: 16, symbols: true });
    expect(secretPresets.token).toMatchObject({ length: 64, symbols: false });
    const random = vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
      (array as Uint32Array).fill(0);
      return array;
    });
    try {
      expect(generateSecret({ ...secretPresets.token, length: 512, exclude: 'A' })).toBe('B'.repeat(512));
      expect(generateSecret({ length: 1, upper: false, lower: false, numbers: true, symbols: false, exclude: '012345678' })).toBe('9');
      expect(random).toHaveBeenCalled();
      expect(() => generateSecret({ ...secretPresets.token, length: 0 })).toThrow();
      expect(() => generateSecret({ ...secretPresets.token, length: 513 })).toThrow();
      expect(() => generateSecret({ ...secretPresets.token, upper: false, lower: false, numbers: false })).toThrow();
    } finally { random.mockRestore(); }
  });
  it('merges legacy favorites/recents, keeps latest usage and unknown preferences', () => {
    const tools = [{ path: '/json-prettify', redirectFrom: ['/json-viewer', '/json-stringify'] }];
    expect(normalizeToolPreferences({
      favorites: ['/json-viewer', '/json-prettify', '/unknown'],
      recentTools: [{ path: '/json-viewer', timestamp: 10 }, { path: '/json-stringify', timestamp: 20 }],
    }, tools)).toEqual({ favorites: ['/json-prettify', '/unknown'], recentTools: [{ path: '/json-prettify', timestamp: 20 }] });
  });
  it('retries random values outside the uniform bucket', () => {
    const random = vi.spyOn(crypto, 'getRandomValues');
    random.mockImplementationOnce(array => { (array as Uint32Array).fill(0xffffffff); return array; });
    random.mockImplementationOnce(array => { (array as Uint32Array).fill(0); return array; });
    try {
      expect(generateSecret(secretPresets.token)).toBe('A'.repeat(64));
      expect(random).toHaveBeenCalledTimes(2);
    } finally { random.mockRestore(); }
  });
});
