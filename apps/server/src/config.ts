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
