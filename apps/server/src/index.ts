import express from 'express';
import cors from 'cors';
import { securityHeaders } from './middleware/security-headers.js';
import rateLimit from 'express-rate-limit';
import { config, validateConfig } from './config.js';
import { healthRouter } from './routes/health.js';
import { userRouter } from './routes/user.js';
import { reportsRouter } from './routes/reports.js';
import { networkRouter } from './routes/network.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { spaFallback } from './middleware/spa-fallback.js';
import { validateInputSize, concurrencyLimiter } from './middleware/security.js';
import { initStorage } from './storage/yaml-storage.js';
import { startCleanupTimer, stopCleanupTimer } from './storage/cleanup.js';

const app = express();

// Middleware
app.use(securityHeaders);
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(validateInputSize(1024 * 1024)); // 1MB max
app.use(concurrencyLimiter);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Routes
app.use('/api/health', healthRouter);
app.use('/api/user', userRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/network', networkRouter);

// Serve static files in production
if (config.isProduction) {
  const path = await import('path');
  const { fileURLToPath } = await import('url');
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const webDist = path.join(__dirname, '../../web/dist');
  app.use(express.static(webDist));
  app.get('*', spaFallback(path.join(webDist, 'index.html')));
}

// 404 handler (before error handler)
app.use(notFoundHandler);

// Error handler (must be after routes)
app.use(errorHandler);

// Validate config before starting
try {
  validateConfig();
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}

// Initialize storage and start cleanup timer
await initStorage();
startCleanupTimer();

// Graceful shutdown
process.on('SIGTERM', () => {
  stopCleanupTimer();
});
process.on('SIGINT', () => {
  stopCleanupTimer();
});

app.listen(config.port, () => {
  console.log(`ToolNest server running on port ${config.port}`);
});

export default app;
