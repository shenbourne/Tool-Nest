import { totp, authenticator } from 'otplib';

export function generateSecret(): string {
  return authenticator.generateSecret();
}

export function generateTOTP(secret: string): string {
  return totp.generate(secret);
}

export function verifyTOTP(token: string, secret: string): boolean {
  return totp.verify({ token, secret });
}

export function buildKeyUri(secret: string, issuer?: string, account?: string): string {
  return `otpauth://totp/${encodeURIComponent(issuer || 'ToolNest')}:${encodeURIComponent(account || 'user')}?secret=${secret}&issuer=${encodeURIComponent(issuer || 'ToolNest')}`;
}

export function getTimeRemaining(): { remaining: number; total: number } {
  const now = Date.now();
  const step = 30;
  const epoch = Math.floor(now / 1000);
  const counter = Math.floor(epoch / step);
  const nextCounter = (counter + 1) * step * 1000;
  const remaining = Math.max(0, nextCounter - now);
  return { remaining, total: step * 1000 };
}
