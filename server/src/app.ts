import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './shared/config/index.js';
import { logger } from './shared/utils/logger.js';
import { requestID } from './shared/middleware/requestID.js';
import { errorHandler, notFoundHandler } from './shared/middleware/errorHandler.js';
import { UploadRepository, UploadService, UploadController, UPLOAD_DIR } from './uploads/index.js';

const app = express();

// --- Security & parsing ---
// Allow uploaded images to be rendered from our own origin
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  }),
);
app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- Middleware ---
app.use(requestID);

// --- Health checks ---
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/ready', async (_req, res) => {
  const checks: Record<string, { status: string; latency_ms?: number }> = {};
  
  try {
    const start = Date.now();
    const { prisma } = await import('./shared/config/database.js');
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: 'ok', latency_ms: Date.now() - start };
  } catch (err) {
    checks.database = { status: 'degraded' };
  }

  const allOk = Object.values(checks).every((c) => c.status === 'ok');
  res.status(allOk ? 200 : 503).json({ status: allOk ? 'ok' : 'degraded', checks });
});

// --- Serve uploaded files statically ---
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d', index: false }));

// --- Feature routes ---
const uploadRepo = new UploadRepository();
const uploadService = new UploadService(uploadRepo);
const uploadController = new UploadController(uploadService);
app.use('/api/uploads', uploadController.getRouter());

// --- 404 & Error handling (must be last) ---
app.use(notFoundHandler);
app.use(errorHandler as unknown as express.ErrorRequestHandler);

// --- Start server ---
const server = app.listen(config.port, () => {
  logger.info(`Server started`, {
    port: config.port,
    env: config.nodeEnv,
    clientOrigin: config.clientOrigin,
  });
});

// --- Graceful shutdown ---
function gracefulShutdown(signal: string) {
  logger.info(`Signal received: ${signal}. Starting graceful shutdown...`);
  
  server.close(async () => {
    try {
      const { prisma } = await import('./shared/config/database.js');
      await prisma.$disconnect();
      logger.info('Database connection closed');
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown', {
        error: err instanceof Error ? err.message : String(err),
      });
      process.exit(1);
    }
  });

  // Force exit after 10s if graceful shutdown fails
  setTimeout(() => {
    logger.error('Forced exit — graceful shutdown timed out');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export { app, server };
