import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../config/logger.js';
import { isProd } from '../config/env.js';

export function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'validation_error',
        message: 'Request validation failed',
        details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      },
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  if (err?.name === 'ValidationError') {
    return res.status(400).json({
      error: { code: 'validation_error', message: err.message },
    });
  }

  if (err?.code === 11000) {
    return res.status(409).json({
      error: { code: 'conflict', message: 'Duplicate key', details: err.keyValue },
    });
  }

  logger.error({ err }, 'unhandled error');
  return res.status(500).json({
    error: {
      code: 'internal_error',
      message: isProd ? 'Something went wrong' : String(err?.message || err),
    },
  });
}

export function notFound(req, res) {
  res.status(404).json({
    error: { code: 'not_found', message: `Route ${req.method} ${req.path} not found` },
  });
}
