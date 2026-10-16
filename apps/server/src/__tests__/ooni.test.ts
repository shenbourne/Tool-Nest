import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('OoniService', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.resetModules();
  });

  it('checks censorship for a list of URLs', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
            { input: 'https://example.com/', confirmed: false, anomaly: false },
            { input: 'https://blocked.example.org/', confirmed: true, anomaly: true },
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
    await expect(OoniService.checkCensorship([])).rejects.toThrow('between 1 and 10');
  });

  it('validates all inputs before sending queries', async () => {
    const { OoniService } = await import('../services/ooni');
    for (const urls of [['file:///etc/passwd'], ['https://user:pass@example.com'], ['not a url'], Array(11).fill('example.com')]) {
      await expect(OoniService.checkCensorship(urls)).rejects.toMatchObject({ code: 'VALIDATION_ERROR', statusCode: 400 });
    }
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('deduplicates normalized URLs and ignores failed or unrelated measurements', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ results: [
      { input: 'https://example.com/', confirmed: false, anomaly: false, probe_cc: 'US', measurement_start_time: '2026-10-10T00:00:00Z' },
      { input: 'https://example.com/', confirmed: true, anomaly: true, probe_cc: 'CN', measurement_start_time: '2026-10-11T00:00:00Z' },
      { input: 'https://example.com/', failure: true, confirmed: true, anomaly: true },
      { input: 'https://other.com/', confirmed: true, anomaly: true },
    ] }) });
    const { OoniService } = await import('../services/ooni');
    const [row] = await OoniService.checkCensorship(['example.com', 'https://example.com/']);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(row).toMatchObject({ confirmed: true, anomaly: true, measurementCount: 2, countries: ['CN', 'US'], latestMeasurement: '2026-10-11T00:00:00Z' });
  });

  it('returns typed errors for timeout, connection failure and malformed responses', async () => {
    const { OoniService } = await import('../services/ooni');
    mockFetch.mockRejectedValueOnce(Object.assign(new Error('timeout'), { name: 'TimeoutError' }));
    await expect(OoniService.checkCensorship(['example.com'])).rejects.toMatchObject({ code: 'OONI_TIMEOUT', statusCode: 504 });
    mockFetch.mockRejectedValueOnce(new TypeError('fetch failed', { cause: { code: 'UND_ERR_CONNECT_TIMEOUT' } }));
    await expect(OoniService.checkCensorship(['example.com'])).rejects.toMatchObject({ code: 'OONI_TIMEOUT', statusCode: 504 });
    mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'));
    await expect(OoniService.checkCensorship(['example.com'])).rejects.toMatchObject({ code: 'OONI_UNAVAILABLE', statusCode: 502 });
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    await expect(OoniService.checkCensorship(['example.com'])).rejects.toMatchObject({ code: 'OONI_INVALID_RESPONSE' });
  });

  it('uses GET with one normalized input per query instead of an unsupported POST', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ results: [] }) });
    const { OoniService } = await import('../services/ooni');
    const results = await OoniService.checkCensorship(['www.google.com']);
    const query = new URL(mockFetch.mock.calls[0][0]);
    expect(mockFetch.mock.calls[0][1]?.method ?? 'GET').toBe('GET');
    expect(query.searchParams.get('input')).toBe('https://www.google.com/');
    expect(query.searchParams.get('limit')).toBe('100');
    expect(results[0]).toMatchObject({ input: 'https://www.google.com/', measurementCount: 0 });
    expect(results[0].confirmed).toBeUndefined();
  });
});
