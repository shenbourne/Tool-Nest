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
  const parser = new (UAParser as any)(ua);
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
