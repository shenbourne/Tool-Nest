import { describe, expect, it } from 'vitest';
import { generateSvgPlaceholder } from './svg-placeholder-generator.service';

describe('generateSvgPlaceholder', () => {
  it('embeds custom text', () => {
    expect(generateSvgPlaceholder(100, 60, '#000', '#fff', 'Hello')).toContain('Hello');
  });

  it('escapes xml special characters in the text', () => {
    const svg = generateSvgPlaceholder(100, 60, '#000', '#fff', 'A < B & C');
    expect(svg).toContain('A &lt; B &amp; C');
    expect(svg).not.toContain('>A < B');
  });
});
