import { describe, expect, it, vi } from 'vitest';
import { readReadmeUrl } from './readme-import';

describe('README URL import', () => {
  it('reads UTF-8 Markdown without sending credentials', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response('# 中文\n', { headers: { 'content-type': 'text/plain' } }));
    expect(await readReadmeUrl(' https://example.com/README.md ', fetcher)).toBe('# 中文\n');
    expect(fetcher).toHaveBeenCalledWith('https://example.com/README.md', expect.objectContaining({ credentials: 'omit', signal: expect.any(AbortSignal) }));
  });
  it.each(['file:///README.md', 'javascript:alert(1)', 'https://user:pass@example.com/file', 'invalid'])('rejects %s before fetching', async value => {
    const fetcher = vi.fn();
    await expect(readReadmeUrl(value, fetcher)).rejects.toThrow();
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('rejects HTTP errors and HTML pages', async () => {
    await expect(readReadmeUrl('https://example.com', vi.fn().mockResolvedValue(new Response('', { status: 404 })))).rejects.toThrow('404');
    await expect(readReadmeUrl('https://example.com', vi.fn().mockResolvedValue(new Response('<html>', { headers: { 'content-type': 'text/html' } })))).rejects.toThrow('raw');
  });
  it('propagates network errors', async () => {
    await expect(readReadmeUrl('https://example.com', vi.fn().mockRejectedValue(new Error('network')))).rejects.toThrow('network');
  });
});
