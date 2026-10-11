import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildKeyUri, generateSecret, generateTOTP, getTimeRemaining, verifyTOTP } from './otp-generator.service';

const secret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
afterEach(() => { vi.useRealTimers(); });
describe('browser authenticator OTP', () => {
  it.each([[59, '287082'], [1111111109, '081804'], [1111111111, '050471'], [1234567890, '005924'], [2000000000, '279037'], [20000000000, '353130']])('matches RFC 6238 SHA1 at %s seconds', (seconds, expected) => {
    vi.useFakeTimers();
    vi.setSystemTime(Number(seconds) * 1000);
    expect(generateTOTP(secret)).toBe(expected);
    expect(verifyTOTP(String(expected), secret)).toBe(true);
  });
  it('creates secure Base32 secrets without Node crypto APIs', () => {
    const first = generateSecret();
    expect(first).toMatch(/^[A-Z2-7]{16,}$/);
    expect(generateSecret()).not.toBe(first);
    expect(generateTOTP(first)).toMatch(/^\d{6}$/);
  });
  it('rejects wrong and malformed tokens and expires at the next period', () => {
    vi.useFakeTimers(); vi.setSystemTime(59000);
    expect(verifyTOTP('287082', secret)).toBe(true);
    for (const token of ['000000', '12345', '1234567', 'abcdef', '']) expect(verifyTOTP(token, secret)).toBe(false);
    vi.setSystemTime(60000);
    expect(verifyTOTP('287082', secret)).toBe(false);
  });
  it('encodes QR account/issuer and preserves the Base32 secret', () => {
    const uri = new URL(buildKeyUri(secret, 'A & B', 'a+b@example.com'));
    expect(uri.searchParams.get('secret')).toBe(secret);
    expect(uri.searchParams.get('issuer')).toBe('A & B');
    expect(decodeURIComponent(uri.pathname)).toBe('/A & B:a+b@example.com');
  });
  it('counts down to a 30 second boundary', () => {
    vi.useFakeTimers(); vi.setSystemTime(59000);
    expect(getTimeRemaining()).toEqual({ remaining: 1000, total: 30000 });
    vi.setSystemTime(60000);
    expect(getTimeRemaining()).toEqual({ remaining: 30000, total: 30000 });
  });
});

