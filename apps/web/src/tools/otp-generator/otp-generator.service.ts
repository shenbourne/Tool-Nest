import CryptoJS from 'crypto-js';

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateSecret(): string {
  // crypto-js uses native secure randomness in both browsers and Node.
  const bytes = CryptoJS.lib.WordArray.random(20);
  let bits = 0;
  let value = 0;
  let secret = '';
  for (let i = 0; i < bytes.sigBytes; i++) {
    value = (value << 8) | ((bytes.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 255);
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      secret += BASE32[(value >>> bits) & 31];
    }
  }
  return secret;
}

function decodeSecret(secret: string): CryptoJS.lib.WordArray {
  let bits = 0;
  let value = 0;
  let hex = '';
  for (const char of secret.toUpperCase().replace(/=+$/, '')) {
    const digit = BASE32.indexOf(char);
    if (digit < 0) throw new Error('Invalid Base32 secret');
    value = (value << 5) | digit;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      hex += ((value >>> bits) & 255).toString(16).padStart(2, '0');
    }
  }
  if (!hex) throw new Error('Empty OTP secret');
  return CryptoJS.enc.Hex.parse(hex);
}

export function generateTOTP(secret: string): string {
  const counter = Math.floor(Date.now() / 30000);
  // HOTP counter is an unsigned 64-bit big-endian integer.
  const message = CryptoJS.enc.Hex.parse(counter.toString(16).padStart(16, '0'));
  const digest = CryptoJS.HmacSHA1(message, decodeSecret(secret)).toString(CryptoJS.enc.Hex);
  const offset = parseInt(digest.slice(-2), 16) & 15;
  const binary = parseInt(digest.slice(offset * 2, offset * 2 + 8), 16) & 0x7fffffff;
  return (binary % 1000000).toString().padStart(6, '0');
}

export function verifyTOTP(token: string, secret: string): boolean {
  return /^\d{6}$/.test(token) && token === generateTOTP(secret);
}

export function buildKeyUri(secret: string, issuer?: string, account?: string): string {
  return `otpauth://totp/${encodeURIComponent(issuer || 'ToolNest')}:${encodeURIComponent(account || 'user')}?secret=${encodeURIComponent(secret)}&issuer=${encodeURIComponent(issuer || 'ToolNest')}`;
}

export function getTimeRemaining(): { remaining: number; total: number } {
  const now = Date.now();
  const total = 30000;
  return { remaining: total - (now % total), total };
}
