import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('GlobalpingService', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.resetModules();
  });

  it('creates a measurement and returns the response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 'meas-123',
          status: 'in-progress',
        }),
    });

    const { GlobalpingService } = await import('../services/globalping');
    const result = await GlobalpingService.createMeasurement({
      type: 'ping',
      target: 'example.com',
      locations: [{ type: 'country', magic: 'US', limit: 2 }],
    });

    expect(result.id).toBe('meas-123');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.globalping.io/v1/measurements',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });

  it('retries polling until measurement is finished', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'meas-456', status: 'in-progress' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'meas-456',
            status: 'finished',
            results: [{ probe: { country: 'US' }, result: { status: 'finished' } }],
          }),
      });

    const { GlobalpingService } = await import('../services/globalping');
    const result = await GlobalpingService.createAndPoll(
      {
        type: 'ping',
        target: 'example.com',
        locations: [{ type: 'country', magic: 'US', limit: 1 }],
      },
      { pollIntervalMs: 10, maxPolls: 5 },
    );

    expect(result.status).toBe('finished');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'Bad request' }),
    });

    const { GlobalpingService } = await import('../services/globalping');
    await expect(
      GlobalpingService.createMeasurement({
        type: 'ping',
        target: 'example.com',
        locations: [],
      }),
    ).rejects.toThrow('Globalping API error');
  });
});
