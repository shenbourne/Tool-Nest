export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  dataDir: process.env.DATA_DIR || '../../data',
  isProduction: process.env.NODE_ENV === 'production',
  secretKey: process.env.SECRET_KEY || '',
};
