import { describe, it, expect, afterEach, vi } from 'vitest';

type ConfigModule = typeof import('../config');

/** Environment that forces every value back to its built-in default. */
const DEFAULTS: Record<string, string> = {
  PORT: '',
  CORS_ORIGIN: '',
  DATA_DIR: '',
  SECRET_KEY: '',
  REPORT_EXPIRY_DAYS: '',
  MAX_REPORTS: '',
  MAX_REPORT_SIZE: '',
};

/**
 * Reload the config module with the given environment so the module-level
 * `config` object is re-evaluated from a clean environment.
 */
async function loadConfig(env: Record<string, string> = {}): Promise<ConfigModule> {
  vi.resetModules();
  for (const [key, value] of Object.entries({ ...DEFAULTS, ...env })) {
    vi.stubEnv(key, value);
  }
  return import('../config');
}

describe('validateConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('accepts the default configuration', async () => {
    const { validateConfig } = await loadConfig();
    expect(() => validateConfig()).not.toThrow();
    // Module is still side-effect free: reading it does not throw either.
    const { config } = await loadConfig();
    expect(config.port).toBe(3001);
  });

  it('rejects a non-numeric or out-of-range port', async () => {
    for (const port of ['abc', '0', '70000']) {
      const { validateConfig } = await loadConfig({ PORT: port });
      expect(() => validateConfig(), `PORT=${port}`).toThrow(/Invalid config "port"/);
    }
  });

  it('rejects an invalid CORS origin', async () => {
    const notUrl = await loadConfig({ CORS_ORIGIN: 'not-a-url' });
    expect(() => notUrl.validateConfig()).toThrow(/Invalid config "corsOrigin"/);

    const wrongProtocol = await loadConfig({ CORS_ORIGIN: 'ftp://example.com' });
    expect(() => wrongProtocol.validateConfig()).toThrow(/Invalid config "corsOrigin"/);
  });

  it('rejects a blank data directory', async () => {
    const { validateConfig } = await loadConfig({ DATA_DIR: '   ' });
    expect(() => validateConfig()).toThrow(/Invalid config "dataDir"/);
  });

  it('rejects non-positive numeric limits', async () => {
    const expiry = await loadConfig({ REPORT_EXPIRY_DAYS: '0' });
    expect(() => expiry.validateConfig()).toThrow(/Invalid config "reportExpiryDays"/);

    const reports = await loadConfig({ MAX_REPORTS: 'abc' });
    expect(() => reports.validateConfig()).toThrow(/Invalid config "maxReports"/);

    const size = await loadConfig({ MAX_REPORT_SIZE: '-5' });
    expect(() => size.validateConfig()).toThrow(/Invalid config "maxReportSize"/);
  });

  it('accepts a valid custom configuration', async () => {
    const { validateConfig } = await loadConfig({
      PORT: '8080',
      CORS_ORIGIN: 'https://toolnest.example.com',
      DATA_DIR: './custom-data',
      REPORT_EXPIRY_DAYS: '30',
      MAX_REPORTS: '500',
      MAX_REPORT_SIZE: '1000000',
    });
    expect(() => validateConfig()).not.toThrow();
  });
});
