import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';

import { telemetryRouter } from './routes/telemetry.routes.js';
import { irrigationRouter } from './routes/irrigation.routes.js';
import { satelliteRouter } from './routes/satellite.routes.js';
import { pestRouter } from './routes/pest.routes.js';
import { farmRouter } from './routes/farm.routes.js';
import { healthRouter } from './routes/health.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Static files for web UI dashboard
  const publicDir = path.join(__dirname, 'public');
  app.use(express.static(publicDir));

  // Mount API endpoints
  app.use('/api/v1/health', healthRouter);
  app.use('/api/v1/telemetry', telemetryRouter);
  app.use('/api/v1/irrigation', irrigationRouter);
  app.use('/api/v1/satellite', satelliteRouter);
  app.use('/api/v1/pest-diagnosis', pestRouter);
  app.use('/api/v1/farms', farmRouter);

  // Root redirect to dashboard
  app.get('/', (_req: Request, res: Response) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });

  // Global error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({
      success: false,
      error: config.env === 'production' ? 'Internal server error' : err.message
    });
  });

  return app;
}

export function startServer() {
  const app = createApp();
  const server = app.listen(config.port, config.host, () => {
    console.log(`🌾 KilimoFlux Smart Agriculture Engine started`);
    console.log(`📡 Listening on http://${config.host}:${config.port}`);
    console.log(`🗺️  Web Dashboard: http://localhost:${config.port}`);
    console.log(`⚡ Environment: ${config.env}`);
  });

  const shutdown = () => {
    console.log('\nGracefully shutting down KilimoFlux...');
    server.close(() => {
      console.log('KilimoFlux server terminated.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return server;
}

// Auto-start when executed directly
if (process.argv[1] && process.argv[1].endsWith('server.ts') || process.argv[1]?.endsWith('server.js')) {
  startServer();
}
