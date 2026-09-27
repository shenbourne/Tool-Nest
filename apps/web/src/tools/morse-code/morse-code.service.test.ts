import { describe, expect, it } from 'vitest';
import { convertMorse, looksLikeMorse } from './morse-code.service';

describe('convertMorse', () => {
  it('encodes plain text even when it contains a dot', () => {
    expect(convertMorse('Hello.')).toBe('.... . .-.. .-.. ---');
  });

  it('decodes morse input', () => {
    expect(convertMorse('.... . .-.. .-.. ---')).toBe('HELLO');
  });

  it('decodes multi-word morse separated by slashes', () => {
    expect(convertMorse('... --- ... / ... --- ...')).toBe('SOS SOS');
  });

  it('returns empty for empty input', () => {
    expect(convertMorse('')).toBe('');
  });
});

describe('looksLikeMorse', () => {
  it('accepts morse-only payloads', () => {
    expect(looksLikeMorse('...-')).toBe(true);
  });

  it('rejects text with letters', () => {
    expect(looksLikeMorse('a.b')).toBe(false);
  });
});
