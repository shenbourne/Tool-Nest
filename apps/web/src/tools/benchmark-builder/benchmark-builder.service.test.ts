import { describe, expect, it } from 'vitest';
import { summarizeSuite, toWorkerPayload } from './benchmark-builder.service';

describe('summarizeSuite', () => {
  it('computes aggregate stats', () => {
    const result = summarizeSuite('suite', [1, 2, 3, 4], 4);
    expect(result.suiteName).toBe('suite');
    expect(result.iterations).toBe(4);
    expect(result.totalTimeMs).toBe(10);
    expect(result.avgMs).toBe(2.5);
    expect(result.minMs).toBe(1);
    expect(result.maxMs).toBe(4);
    expect(result.opsPerSec).toBe(400);
  });

  it('handles a zero average without dividing by zero', () => {
    expect(summarizeSuite('s', [0, 0], 2).opsPerSec).toBe(0);
  });
});

describe('toWorkerPayload', () => {
  it('copies suites into plain cloneable objects', () => {
    const suite = { id: '1', name: 'a', code: '1+1', extra: 'ignored' } as never;
    const payload = toWorkerPayload([suite], 5);
    expect(payload.iterations).toBe(5);
    expect(payload.suites[0]).toEqual({ id: '1', name: 'a', code: '1+1' });
    expect(payload.suites[0]).not.toBe(suite);
  });
});
