import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import express from 'express';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { spaFallback } from '../middleware/spa-fallback';
import { notFoundHandler } from '../middleware/error-handler';

let server: Server;
let baseUrl: string;

beforeEach(async () => {
  const app = express();
  app.get('*', spaFallback(process.cwd() + '/package.json'));
  app.use(notFoundHandler);
  server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterEach(async () => {
  server.closeAllConnections();
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe('SPA fallback', () => {
  it('serves the frontend entry for browser navigation paths', async () => {
    const response = await fetch(`${baseUrl}/text-to-unicode`);
    expect(response.status).toBe(200);
    expect(await response.text()).toContain('name');
  });

  it('keeps unknown API GET requests as JSON 404 responses', async () => {
    const response = await fetch(`${baseUrl}/api/unknown`);
    expect(response.status).toBe(404);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(await response.json()).toMatchObject({ success: false, error: { code: 'NOT_FOUND' } });
  });
});
