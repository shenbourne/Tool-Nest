import { UAParser } from 'ua-parser-js';

export interface UserAgentInfo {
  browser: { name: string; version: string };
  os: { name: string; version: string };
  device: { type: string; vendor: string; model: string };
  engine: { name: string; version: string };
  cpu: { architecture: string };
  ua: string;
}

export function parseUserAgent(ua: string): UserAgentInfo {
  const parser = new UAParser(ua);
  const result = parser.getResult();
  return {
    browser: { name: result.browser.name || '-', version: result.browser.version || '-' },
    os: { name: result.os.name || '-', version: result.os.version || '-' },
    device: { type: result.device.type || '-', vendor: result.device.vendor || '-', model: result.device.model || '-' },
    engine: { name: result.engine.name || '-', version: result.engine.version || '-' },
    cpu: { architecture: result.cpu.architecture || '-' },
    ua,
  };
}

export const FALLBACK_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36';

export function getCurrentUserAgent(): string {
  try {
    return typeof navigator !== 'undefined' && navigator.userAgent.trim()
      ? navigator.userAgent
      : FALLBACK_USER_AGENT;
  } catch {
    return FALLBACK_USER_AGENT;
  }
}
