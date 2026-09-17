import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import express from 'express';

let testDir: string;
let server: Server;
let baseUrl: string;

beforeEach(async () => {
  testDir = await mkdtemp(join(tmpdir(), 'toolnest-routes-'));
  vi.resetModules();
  vi.stubEnv('DATA_DIR', testDir);

  const { userRouter } = await import('../routes/user');
  const { reportsRouter } = await import('../routes/reports');
  const { errorHandler } = await import('../middleware/error-handler');

  const app = express();
  app.use(express.json());
  app.use('/api/user', userRouter);
  app.use('/api/reports', reportsRouter);
  app.use(errorHandler);

  server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', () => resolve()));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterEach(async () => {
  vi.unstubAllEnvs();
  // Drop keep-alive sockets so close() resolves immediately.
  server.closeAllConnections();
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await rm(testDir, { recursive: true, force: true });
});

describe('user preferences routes', () => {
  it('serves defaults and persists updates through the repository', async () => {
    const initial = await fetch(`${baseUrl}/api/user/preferences`);
    expect(initial.status).toBe(200);
    const initialBody = await initial.json();
    expect(initialBody.success).toBe(true);
    expect(initialBody.data.theme).toBe('system');

    const update = await fetch(`${baseUrl}/api/user/preferences`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: 'en', theme: 'dark' }),
    });
    expect(update.status).toBe(200);
    const updateBody = await update.json();
    expect(updateBody.data.language).toBe('en');
    expect(updateBody.data.theme).toBe('dark');

    const reloaded = await fetch(`${baseUrl}/api/user/preferences`);
    const reloadedBody = await reloaded.json();
    expect(reloadedBody.data.language).toBe('en');
    expect(reloadedBody.data.theme).toBe('dark');
  });

  it('rejects invalid preference payloads', async () => {
    const res = await fetch(`${baseUrl}/api/user/preferences`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: 'neon' }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('report routes', () => {
  it('sanitizes content and round-trips a created report', async () => {
    const create = await fetch(`${baseUrl}/api/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '<script>alert(1)</script>', title: 'XSS <test>' }),
    });
    expect(create.status).toBe(201);
    const createBody = await create.json();
    expect(createBody.data.content).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(createBody.data.title).toBe('XSS &lt;test&gt;');

    const fetched = await fetch(`${baseUrl}/api/reports/${createBody.data.id}`);
    expect(fetched.status).toBe(200);
    const fetchedBody = await fetched.json();
    expect(fetchedBody.data.content).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('returns validation and not-found errors for bad report ids', async () => {
    const invalid = await fetch(`${baseUrl}/api/reports/not-hex!!`);
    expect(invalid.status).toBe(400);
    const invalidBody = await invalid.json();
    expect(invalidBody.error.code).toBe('VALIDATION_ERROR');

    const missing = await fetch(`${baseUrl}/api/reports/${'a'.repeat(32)}`);
    expect(missing.status).toBe(404);
    const missingBody = await missing.json();
    expect(missingBody.error.code).toBe('NOT_FOUND');
  });
});
