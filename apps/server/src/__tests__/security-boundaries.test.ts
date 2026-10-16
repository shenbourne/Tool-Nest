import { describe, it, expect } from 'vitest';
import { EventEmitter } from 'node:events';
import type { Request, Response } from 'express';
import { isPrivateHost, concurrencyLimiter } from '../middleware/security.js';

function admit(ip: string) {
  const response = new EventEmitter() as EventEmitter & { status: (code: number) => unknown; json: () => void };
  let status = 200;
  response.status = (code) => { status = code; return response; };
  response.json = () => {};
  let admitted = false;
  concurrencyLimiter({ ip } as Request, response as unknown as Response, () => { admitted = true; });
  return { response, admitted, status };
}

describe('private address representations', () => {
  it.each(['[::1]', '0:0:0:0:0:0:0:1', 'FC12::1', 'fdab::1', 'febf::1', '::ffff:127.0.0.1', '::ffff:7f00:1', '::ffff:c0a8:101', 'localhost.', '127.1'])('blocks %s', host => {
    expect(isPrivateHost(host)).toBe(true);
  });
  it.each(['8.8.8.8', '1.1.1.1', '2001:4860:4860::8888', '2606:4700:4700::1111', 'example.com'])('retains public %s', host => {
    expect(isPrivateHost(host)).toBe(false);
  });
});

describe('concurrency response lifecycle', () => {
  it('admits new requests after ten aborted responses', () => {
    const requests = Array.from({ length: 10 }, () => admit('abort-client'));
    expect(requests.every(r => r.admitted)).toBe(true);
    requests.forEach(r => r.response.emit('close'));
    const next = admit('abort-client');
    expect(next.admitted).toBe(true);
    next.response.emit('finish');
  });
  it('does not release another request slot on both close and finish', () => {
    const first = admit('double-event-client');
    const rest = Array.from({ length: 9 }, () => admit('double-event-client'));
    first.response.emit('close');
    first.response.emit('finish');
    const replacement = admit('double-event-client');
    expect(replacement.admitted).toBe(true);
    expect(admit('double-event-client').status).toBe(429);
    [...rest, replacement].forEach(r => r.response.emit('finish'));
    expect(first.response.listenerCount('close') + first.response.listenerCount('finish')).toBe(0);
  });
});
