import { Request, Response, NextFunction } from 'express';
import { URL } from 'url';

/**
 * SSRF Protection - Block requests to private/internal networks
 */
const PRIVATE_RANGES = [
  /^10\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./,
  /^127\./, /^0\./, /^169\.254\./, // loopback, link-local
  /^::1$/, /^fe80:/, /^fc00:/, /^fd00:/, // IPv6 private
  /^localhost$/i, /^0\.0\.0\.0$/,
];

export function isPrivateHost(hostname: string): boolean {
  return PRIVATE_RANGES.some(re => re.test(hostname));
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
  res.on('finish', () => {
    const c = activeRequests.get(ip) || 1;
    if (c <= 1) activeRequests.delete(ip);
    else activeRequests.set(ip, c - 1);
  });
  next();
}
