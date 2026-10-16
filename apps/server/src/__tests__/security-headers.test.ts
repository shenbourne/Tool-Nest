import { afterEach, describe, expect, it } from 'vitest';
import express from 'express';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { securityHeaders } from '../middleware/security-headers.js';

let server: Server;
afterEach(async () => {
  if (!server) return;
  server.closeAllConnections();
  await new Promise<void>(resolve => server.close(() => resolve()));
});

describe('browser security headers', () => {
  it('allows local image editor object URLs while retaining script and object restrictions', async () => {
    const app = express();
    app.use(securityHeaders);
    app.get('/image-editor', (_req, res) => res.send('<!doctype html><title>Image editor</title>'));
    server = app.listen(0, '127.0.0.1');
    await new Promise<void>(resolve => server.once('listening', resolve));
    const response = await fetch(`http://127.0.0.1:${(server.address() as AddressInfo).port}/image-editor`);
    const policy = response.headers.get('content-security-policy') ?? '';
    const directives = new Map(policy.split(';').map(part => {
      const [name, ...values] = part.trim().split(/\s+/);
      return [name, values];
    }));
    expect(directives.get('img-src')).toEqual(expect.arrayContaining(["'self'", 'data:', 'blob:']));
    expect(directives.get('img-src')).not.toContain('*');
    expect(directives.get('script-src')).toEqual(["'self'"]);
    expect(directives.get('script-src-attr')).toEqual(["'none'"]);
    expect(directives.get('object-src')).toEqual(["'none'"]);
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
  });
});
