import { Request, Response, NextFunction } from 'express';
import { URL } from 'url';
import { isIP } from 'node:net';

/**
 * SSRF Protection - Block requests to private/internal networks
 */
function privateIpv4(host: string): boolean {
  const [a, b] = host.split('.').map(Number);
  return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)
    || (a === 100 && b >= 64 && b <= 127) || a >= 224;
}

export function isPrivateHost(hostname: string): boolean {
  const raw = hostname.trim().toLowerCase().replace(/\.$/, '');
  if (raw === 'localhost' || raw.endsWith('.localhost')) return true;
  try {
    // WHATWG canonicalization handles abbreviated IPv4 and expanded/mapped IPv6.
    const host = new URL(`http://${raw.includes(':') && !raw.startsWith('[') ? `[${raw}]` : raw}/`).hostname.replace(/^\[|\]$/g, '');
    if (isIP(host) === 4) return privateIpv4(host);
    if (isIP(host) !== 6) return false;
    const [left, right] = host.split('::');
    const head = left ? left.split(':') : [];
    const tail = right ? right.split(':') : [];
    const words = (right === undefined ? head : [...head, ...Array(8 - head.length - tail.length).fill('0'), ...tail]).map(part => parseInt(part, 16));
    if (words.slice(0, 5).every(word => word === 0) && words[5] === 0xffff) {
      return privateIpv4(`${words[6] >> 8}.${words[6] & 255}.${words[7] >> 8}.${words[7] & 255}`);
    }
    return words.slice(0, 6).every(word => word === 0)
      || (words[0] & 0xfe00) === 0xfc00
      || (words[0] & 0xffc0) === 0xfe80
      || (words[0] & 0xffc0) === 0xfec0
      || (words[0] & 0xff00) === 0xff00;
  } catch {
    return false;
  }
}

/**
 * Validate and sanitize a URL to prevent SSRF
 */
export function validateUrl(urlStr: string): { valid: boolean; hostname?: string; error?: string } {
  try {
    const url = new URL(urlStr);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, error: 'Only HTTP/HTTPS protocols allowed' };
    }
    if (isPrivateHost(url.hostname)) {
      return { valid: false, error: 'Access to private networks is blocked' };
    }
    return { valid: true, hostname: url.hostname };
  } catch {
    return { valid: false, error: 'Invalid URL' };
  }
}

/**
 * XSS Sanitization - re-exported from shared package
 */
export { sanitizeHtml } from '@toolnest/shared';

/**
 * Input validation middleware - limit request body size
 */
export function validateInputSize(maxSize = 1024 * 1024) {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > maxSize) {
      res.status(413).json({
        success: false,
        error: { code: 'CONTENT_TOO_LARGE', message: 'Request body too large' },
      });
      return;
    }
    next();
  };
}

/**
 * Concurrent request limiter per IP
 */
const activeRequests = new Map<string, number>();
const MAX_CONCURRENT = 10;

export function concurrencyLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const count = activeRequests.get(ip) || 0;
  if (count >= MAX_CONCURRENT) {
    res.status(429).json({
      success: false,
      error: { code: 'TOO_MANY_CONCURRENT', message: 'Too many concurrent requests' },
    });
    return;
  }
  activeRequests.set(ip, count + 1);
  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    res.off('finish', release);
    res.off('close', release);
    const c = activeRequests.get(ip) || 1;
    if (c <= 1) activeRequests.delete(ip);
    else activeRequests.set(ip, c - 1);
  };
  res.once('finish', release);
  res.once('close', release);
  next();
}
