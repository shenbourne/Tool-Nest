import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('OoniService', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.resetModules();
  });

  it('checks censorship for a list of URLs', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
            { input: 'https://example.com', confirmed: false, anomaly: false },
            { input: 'https://blocked.example.org', confirmed: true, anomaly: true },
          ],
        }),
    });

    const { OoniService } = await import('../services/ooni');
    const results = await OoniService.checkCensorship([
      'https://example.com',
      'https://blocked.example.org',
    ]);

    expect(results).toHaveLength(2);
    expect(results[0].confirmed).toBe(false);
    expect(results[1].confirmed).toBe(true);
  });

  it('throws on API error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });

    const { OoniService } = await import('../services/ooni');
    await expect(OoniService.checkCensorship(['https://example.com'])).rejects.toThrow(
      'OONI API error',
    );
  });

  it('rejects empty URL list', async () => {
    const { OoniService } = await import('../services/ooni');
    await expect(OoniService.checkCensorship([])).rejects.toThrow('At least one URL');
  });
});
