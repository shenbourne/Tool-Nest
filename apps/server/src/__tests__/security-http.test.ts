import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import express from 'express';
import { get } from 'node:http';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
let server: Server, base: string, directory: string;
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'security-http-'));
  vi.resetModules(); vi.stubEnv('DATA_DIR', directory);
});
afterEach(async () => {
  if (server) { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); }
  vi.unstubAllEnvs(); await rm(directory, { recursive: true, force: true });
});
async function listen(app: express.Express) {
  server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}
async function send(path: string, body: unknown, method = 'POST') {
  return fetch(base + path, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}
describe('security boundaries over HTTP', () => {
  it('rejects invalid DNS selections and excessive work before any DNS query', async () => {
    const { networkRouter } = await import('../routes/network.js');
    const { errorHandler } = await import('../middleware/error-handler.js');
    const app = express(); app.use(express.json()); app.use('/network', networkRouter); app.use(errorHandler);
    await listen(app);
    for (const dnsServer of ['[::1]:53', '::ffff:7f00:1', '[fd12::1]:5353', '8.8.8.8:0']) {
      const result = await send('/network/rule-test', { domain: 'example.com', dnsServer });
      expect(result.status).toBe(400);
      expect((await result.json()).error.code).toBe('VALIDATION_ERROR');
    }
    expect((await send('/network/dns-leak', { domains: Array(21).fill('example.com') })).status).toBe(400);
    expect((await send('/network/dns-leak', { domains: ['example.com', 42] })).status).toBe(400);
  });
  it('returns a typed preference quota error while retaining normal updates', async () => {
    const { userRouter } = await import('../routes/user.js');
    const { errorHandler } = await import('../middleware/error-handler.js');
    const app = express(); app.use(express.json()); app.use('/user', userRouter); app.use(errorHandler);
    await listen(app);
    expect((await send('/user/preferences', { settings: { first: 'x'.repeat(35000) } }, 'PUT')).status).toBe(200);
    const oversized = await send('/user/preferences', { settings: { second: 'x'.repeat(35000) } }, 'PUT');
    expect(oversized.status).toBe(413);
    expect((await oversized.json()).error.code).toBe('PREFERENCES_TOO_LARGE');
    const result = await send('/user/preferences', { theme: 'dark', settings: { sidebarMode: 'navigate' } }, 'PUT');
    expect(result.status).toBe(200);
    expect((await result.json()).data.settings.sidebarMode).toBe('navigate');
  });
  it('recovers all ten slots after real clients disconnect before response', async () => {
    const { concurrencyLimiter } = await import('../middleware/security.js');
    let entered = 0, closed = 0;
    let enterAll!: () => void, closeAll!: () => void;
    const entering = new Promise<void>(resolve => { enterAll = resolve; });
    const closing = new Promise<void>(resolve => { closeAll = resolve; });
    const app = express(); app.use(concurrencyLimiter);
    app.get('/hold', (_req, res) => {
      if (++entered === 10) enterAll();
      res.on('close', () => { if (++closed === 10) closeAll(); });
    });
    app.get('/health', (_req, res) => { res.json({ ok: true }); });
    await listen(app);
    const clients = Array.from({ length: 10 }, () => get(base + '/hold').on('error', () => {}));
    await entering;
    expect((await fetch(base + '/health')).status).toBe(429);
    clients.forEach(client => client.destroy());
    await closing;
    expect((await fetch(base + '/health')).status).toBe(200);
  });
});
