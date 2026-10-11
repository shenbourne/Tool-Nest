import CryptoJS from 'crypto-js';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  const bits = Array.from(bytes, byte => byte.toString(2).padStart(8, '0')).join('');
  return bits.match(/.{5}/g)!.map(part => alphabet[parseInt(part, 2)]).join('');
}

export function generateTOTP(secret: string): string {
  const normalized = secret.replace(/\s/g, '').replace(/=+$/, '').toUpperCase();
  if (!normalized || /[^A-Z2-7]/.test(normalized)) throw new Error('Invalid Base32 secret');
  const bits = Array.from(normalized, char => alphabet.indexOf(char).toString(2).padStart(5, '0')).join('');
  const hex = (bits.match(/.{8}/g) || []).map(part => parseInt(part, 2).toString(16).padStart(2, '0')).join('');
  const counter = Math.floor(Date.now() / 30000).toString(16).padStart(16, '0');
  const digest = CryptoJS.HmacSHA1(CryptoJS.enc.Hex.parse(counter), CryptoJS.enc.Hex.parse(hex)).toString();
  const offset = parseInt(digest.slice(-1), 16) * 2;
  const value = parseInt(digest.slice(offset, offset + 8), 16) & 0x7fffffff;
  return (value % 1000000).toString().padStart(6, '0');
}

export function verifyTOTP(token: string, secret: string): boolean {
  if (!/^\d{6}$/.test(token)) return false;
  try { return token === generateTOTP(secret); } catch { return false; }
}

export function buildKeyUri(secret: string, issuer?: string, account?: string): string {
  return `otpauth://totp/${encodeURIComponent(issuer || 'ToolNest')}:${encodeURIComponent(account || 'user')}?secret=${encodeURIComponent(secret)}&issuer=${encodeURIComponent(issuer || 'ToolNest')}`;
}

export function getTimeRemaining(): { remaining: number; total: number } {
  const total = 30000;
  return { remaining: total - (Date.now() % total), total };
}
