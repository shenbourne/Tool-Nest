import { afterEach, describe, expect, it, vi } from 'vitest';
import { requestPing } from './ping.service';

afterEach(() => { vi.unstubAllGlobals(); });

describe('Ping API responses', () => {
  it('reports unavailable backend for the reproduced empty HTTP 500', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 500 })));
    await expect(requestPing('baidu.com')).rejects.toThrow('serviceUnavailable');
  });
  it('handles HTML and empty successful responses', async () => {
    for (const body of ['', '<html>Not an API</html>', 'null', '{}']) {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(body)));
      await expect(requestPing('baidu.com')).rejects.toThrow('invalidResponse');
    }
  });
  it('preserves API validation errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ success: false, error: { message: 'Access to private networks is blocked' } }, { status: 400 })));
    await expect(requestPing('127.0.0.1')).rejects.toThrow('Access to private networks is blocked');
  });
  it('does not accept success envelopes with failing HTTP statuses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ success: true, data: {} }, { status: 502 })));
    await expect(requestPing('baidu.com')).rejects.toThrow('serviceUnavailable');
  });
  it('handles plain text rate limits without exposing parsing errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Too many requests', { status: 429 })));
    await expect(requestPing('baidu.com')).rejects.toThrow('rateLimited');
  });
  it('reports connection failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(requestPing('baidu.com')).rejects.toThrow('serviceUnavailable');
  });
  it('returns measurement data and trims the submitted target', async () => {
    const data = { id: 'measurement', status: 'finished', results: [] };
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ success: true, data }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(requestPing(' baidu.com ')).resolves.toEqual(data);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ target: 'baidu.com' });
  });
});
