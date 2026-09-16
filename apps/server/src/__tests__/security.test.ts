import { describe, it, expect } from 'vitest';
import { isPrivateHost, validateUrl, sanitizeHtml } from '../middleware/security';

describe('Security Middleware', () => {
  describe('isPrivateHost', () => {
    it('should detect private IPv4 addresses', () => {
      expect(isPrivateHost('10.0.0.1')).toBe(true);
      expect(isPrivateHost('172.16.0.1')).toBe(true);
      expect(isPrivateHost('192.168.1.1')).toBe(true);
      expect(isPrivateHost('127.0.0.1')).toBe(true);
    });

    it('should allow public addresses', () => {
      expect(isPrivateHost('8.8.8.8')).toBe(false);
      expect(isPrivateHost('1.1.1.1')).toBe(false);
      expect(isPrivateHost('example.com')).toBe(false);
    });

    it('should detect localhost', () => {
      expect(isPrivateHost('localhost')).toBe(true);
      expect(isPrivateHost('0.0.0.0')).toBe(true);
    });
  });

  describe('validateUrl', () => {
    it('should accept valid public URLs', () => {
      const result = validateUrl('https://example.com/api');
      expect(result.valid).toBe(true);
      expect(result.hostname).toBe('example.com');
    });

    it('should reject private network URLs', () => {
      const result = validateUrl('http://192.168.1.1/admin');
      expect(result.valid).toBe(false);
    });

    it('should reject non-HTTP protocols', () => {
      const result = validateUrl('ftp://example.com/file');
      expect(result.valid).toBe(false);
    });

    it('should reject invalid URLs', () => {
      const result = validateUrl('not-a-url');
      expect(result.valid).toBe(false);
    });
  });

  describe('sanitizeHtml', () => {
    it('should escape HTML entities', () => {
      expect(sanitizeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    it('should escape ampersands', () => {
      expect(sanitizeHtml('a & b')).toBe('a &amp; b');
    });

    it('should pass through safe text unchanged', () => {
      expect(sanitizeHtml('Hello World')).toBe('Hello World');
    });
  });
});
