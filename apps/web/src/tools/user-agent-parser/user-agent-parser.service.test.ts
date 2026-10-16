import { afterEach, describe, expect, it, vi } from 'vitest';
import { FALLBACK_USER_AGENT, getCurrentUserAgent, parseUserAgent } from './user-agent-parser.service';
afterEach(() => { vi.unstubAllGlobals(); });
describe('current browser UA', () => {
  it('uses actual UA before the fallback', () => {
    vi.stubGlobal('navigator', { userAgent: 'actual browser UA' });
    expect(getCurrentUserAgent()).toBe('actual browser UA');
  });
  it('falls back when navigator or UA is unavailable', () => {
    vi.stubGlobal('navigator', undefined);
    expect(getCurrentUserAgent()).toBe(FALLBACK_USER_AGENT);
    vi.stubGlobal('navigator', { userAgent: '  ' });
    expect(getCurrentUserAgent()).toBe(FALLBACK_USER_AGENT);
  });
  it('falls back on access errors and parses the supplied Chrome154 UA', () => {
    vi.stubGlobal('navigator', { get userAgent(): string { throw new Error('unavailable'); } });
    expect(getCurrentUserAgent()).toBe(FALLBACK_USER_AGENT);
    expect(parseUserAgent(FALLBACK_USER_AGENT).browser).toEqual({ name: 'Chrome', version: '154.0.0.0' });
  });
});
