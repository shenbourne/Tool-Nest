import { it, expect, vi } from 'vitest';
import { generateSecret, generateTOTP, verifyTOTP } from './otp-generator.service';
it('matches RFC 6238 SHA1 with a base32 secret', () => {
  const clock = vi.spyOn(Date, 'now');
  const secret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
  for (const [seconds, expected] of [[59, '287082'], [1111111109, '081804'], [1111111111, '050471'], [1234567890, '005924'], [2000000000, '279037'], [20000000000, '353130']] as const) {
    clock.mockReturnValue(seconds * 1000);
    expect(generateTOTP(secret)).toBe(expected);
    expect(verifyTOTP(expected, secret)).toBe(true);
  }
  expect(verifyTOTP('123456', secret)).toBe(false);
  vi.restoreAllMocks();
});
it('generates browser-compatible base32 secrets', () => {
  expect(generateSecret()).toMatch(/^[A-Z2-7]{32}$/);
});
