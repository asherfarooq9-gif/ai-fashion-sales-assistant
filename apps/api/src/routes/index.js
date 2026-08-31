import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';
import { healthRouter } from './health.routes.js';
import { authRouter } from './auth.routes.js';
import { productsRouter } from './products.routes.js';
import { customersRouter } from './customers.routes.js';
import { ordersRouter } from './orders.routes.js';
import { conversationsRouter } from './conversations.routes.js';
import { cannedResponsesRouter } from './cannedResponses.routes.js';
import { exportRouter } from './export.routes.js';
import { chatRouter } from './chat.routes.js';
import { channelsRouter } from './channels.routes.js';
import { webhooksRouter } from './webhooks.routes.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const openapiPath = path.resolve(here, '../../../../docs/openapi.yaml');

export function mountRoutes(app) {
  app.use('/', healthRouter);

  const api = Router();
  api.use('/auth', authRouter);
  api.use('/products', productsRouter);
  api.use('/customers', customersRouter);
  api.use('/orders', ordersRouter);
  api.use('/conversations', conversationsRouter);
  api.use('/canned-responses', cannedResponsesRouter);
  api.use('/export', exportRouter);
  api.use('/chat', chatRouter);
  api.use('/channels', channelsRouter);
  api.use('/webhooks', webhooksRouter);
  app.use('/api', api);

  if (config.ENABLE_SWAGGER && fs.existsSync(openapiPath)) {
    try {
      const spec = YAML.parse(fs.readFileSync(openapiPath, 'utf8'));
      app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec));
    } catch (err) {
      logger.warn({ err }, 'failed to mount swagger docs');
    }
  }

  return app;
}

export default mountRoutes;
