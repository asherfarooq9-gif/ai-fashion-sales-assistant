import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { config } from './config/env.js';
import { logger } from './config/logger.js';
import { mountRoutes } from './routes/index.js';
import { errorHandler, notFound } from './middleware/error.js';

/** Build the Express app without binding a port (so tests can use supertest). */
export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: config.WEB_ORIGIN.split(',').map((s) => s.trim()),
      credentials: true,
    })
  );
  // Meta webhooks need the raw body for signature verification.
  app.use(
    express.json({
      limit: '2mb',
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  if (config.NODE_ENV !== 'test') {
    app.use(pinoHttp({ logger }));
  }

  mountRoutes(app);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export default createApp;
