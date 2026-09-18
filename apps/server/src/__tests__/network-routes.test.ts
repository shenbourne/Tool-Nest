import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import express from 'express';

let server: Server;
let baseUrl: string;

beforeEach(async () => {
  vi.resetModules();

  vi.doMock('../services/globalping', () => ({
    GlobalpingService: {
      createAndPoll: vi.fn().mockResolvedValue({
        id: 'mock-meas',
        status: 'finished',
        results: [{ probe: { country: 'US' }, result: { status: 'finished', timings: [] } }],
      }),
    },
  }));

  vi.doMock('../services/ooni', () => ({
    OoniService: {
      checkCensorship: vi.fn().mockResolvedValue([
        { input: 'https://example.com', confirmed: false, anomaly: false },
      ]),
    },
  }));

  const { networkRouter } = await import('../routes/network');
  const { errorHandler } = await import('../middleware/error-handler');

  const app = express();
  app.use(express.json());
  app.use('/api/network', networkRouter);
  app.use(errorHandler);

  server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', () => resolve()));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterEach(async () => {
  vi.unstubAllEnvs();
  server.closeAllConnections();
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe('POST /api/network/ping', () => {
  it('returns measurement results for a valid target', async () => {
    const res = await fetch(`${baseUrl}/api/network/ping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'example.com', locations: [{ type: 'country', magic: 'US', limit: 2 }] }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('finished');
  });

  it('rejects missing target', async () => {
    const res = await fetch(`${baseUrl}/api/network/ping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('POST /api/network/mtr', () => {
  it('returns MTR results', async () => {
    const res = await fetch(`${baseUrl}/api/network/mtr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'example.com' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});

describe('POST /api/network/latency', () => {
  it('returns latency results', async () => {
    const res = await fetch(`${baseUrl}/api/network/latency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'example.com' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});

describe('POST /api/network/dns-leak', () => {
  it('returns DNS resolution results', async () => {
    const res = await fetch(`${baseUrl}/api/network/dns-leak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domains: ['example.com', 'test.org'] }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it('rejects empty domain list', async () => {
    const res = await fetch(`${baseUrl}/api/network/dns-leak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domains: [] }),
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/network/rule-test', () => {
  it('returns DNS resolution for rule testing', async () => {
    const res = await fetch(`${baseUrl}/api/network/rule-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: 'example.com', dnsServer: '8.8.8.8' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it('rejects missing domain', async () => {
    const res = await fetch(`${baseUrl}/api/network/rule-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/network/censorship', () => {
  it('returns censorship check results', async () => {
    const res = await fetch(`${baseUrl}/api/network/censorship`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: ['https://example.com'] }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
  });

  it('rejects empty URL list', async () => {
    const res = await fetch(`${baseUrl}/api/network/censorship`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: [] }),
    });
    expect(res.status).toBe(400);
  });
});
