import pino from 'pino';
import { config, isProd } from './env.js';

const redact = {
  paths: [
    'req.headers.authorization',
    'req.headers.cookie',
    'req.body.password',
    '*.GEMINI_API_KEY',
    '*.OPENROUTER_API_KEY',
    '*.WHATSAPP_TOKEN',
    '*.IG_PAGE_ACCESS_TOKEN',
    '*.JWT_SECRET',
  ],
  remove: true,
};

export const logger = pino({
  level: config.LOG_LEVEL,
  redact,
  transport:
    !isProd && config.NODE_ENV !== 'test'
      ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss' } }
      : undefined,
});

export default logger;
