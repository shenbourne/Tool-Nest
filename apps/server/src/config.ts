export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  dataDir: process.env.DATA_DIR || '../../data',
  isProduction: process.env.NODE_ENV === 'production',
  secretKey: process.env.SECRET_KEY || '',
  reportExpiryDays: parseInt(process.env.REPORT_EXPIRY_DAYS || '7', 10),
  maxReports: parseInt(process.env.MAX_REPORTS || '100', 10),
  maxReportSize: parseInt(process.env.MAX_REPORT_SIZE || '500000', 10),
};

function fail(name: string, detail: string): never {
  throw new Error(`Invalid config "${name}": ${detail}`);
}

export function validateConfig(): void {
  // port
  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
    fail('port', `must be an integer between 1 and 65535, got "${config.port}"`);
  }

  // corsOrigin
  try {
    const url = new URL(config.corsOrigin);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      fail('corsOrigin', `must use http:// or https://, got "${config.corsOrigin}"`);
    }
  } catch {
    fail('corsOrigin', `must be a valid URL, got "${config.corsOrigin}"`);
  }

  // dataDir
  if (typeof config.dataDir !== 'string' || config.dataDir.trim().length === 0) {
    fail('dataDir', 'must be a non-empty string');
  }

  // secretKey
  if (typeof config.secretKey !== 'string') {
    fail('secretKey', 'must be a string');
  }

  // reportExpiryDays
  if (!Number.isInteger(config.reportExpiryDays) || config.reportExpiryDays <= 0) {
    fail('reportExpiryDays', `must be a positive integer, got "${config.reportExpiryDays}"`);
  }

  // maxReports
  if (!Number.isInteger(config.maxReports) || config.maxReports <= 0) {
    fail('maxReports', `must be a positive integer, got "${config.maxReports}"`);
  }

  // maxReportSize
  if (!Number.isInteger(config.maxReportSize) || config.maxReportSize <= 0) {
    fail('maxReportSize', `must be a positive integer, got "${config.maxReportSize}"`);
  }
}
