import { describe, expect, it } from 'vitest';
import { buildPrintDocument } from './print-document';
import markdownit from 'markdown-it';

describe('isolated Markdown printing', () => {
  it('places the policy before attacker HTML and preserves ordinary markup', () => {
    const output = markdownit({ html: true, linkify: true }).render('# Title\n\n**bold**\n\n<script>window.opener.attack()</script><img src=x onerror=alert(1)><iframe srcdoc="<script>alert(2)</script>"></iframe>');
    const document = buildPrintDocument('# Title\n\n**bold**\n\n<script>window.opener.attack()</script><img src=x onerror=alert(1)><iframe></iframe>');
    expect(output).toContain('<script>');
    expect(document).not.toContain('<script>');
    expect(document).not.toContain('<iframe');
    expect(document).toContain("script-src 'none'");
    expect(document).toContain("frame-src 'none'");
    expect(document).toContain("connect-src 'none'");
    expect(document).toContain("form-action 'none'");
    expect(document).toContain("base-uri 'none'");
    expect(document).toContain('<h1>Title</h1>');
    expect(document).toContain('<strong>bold</strong>');
  });
});
