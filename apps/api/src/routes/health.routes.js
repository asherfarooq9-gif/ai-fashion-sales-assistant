import { Router } from 'express';
import { dbState } from '../config/db.js';
import { config } from '../config/env.js';

export const healthRouter = Router();

healthRouter.get('/healthz', (_req, res) => {
  res.json({
    status: 'ok',
    db: dbState(),
    provider: config.LLM_PROVIDER,
    orchestration: config.ORCHESTRATION_MODE,
    uptime: process.uptime(),
  });
});

export default healthRouter;
