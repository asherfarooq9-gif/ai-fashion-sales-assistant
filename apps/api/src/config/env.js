import 'dotenv/config';
import { z } from 'zod';

const boolish = (def) =>
  z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((v) => {
      if (typeof v === 'boolean') return v;
      if (v === undefined) return def;
      return ['1', 'true', 'yes', 'on'].includes(v.toLowerCase());
    });

const isTest = process.env.NODE_ENV === 'test';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  WEB_ORIGIN: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  API_INTERNAL_TOKEN: z.string().default('change-me-internal'),

  MONGODB_URI: z
    .string()
    .default('mongodb://127.0.0.1:27017/ai-fashion-sales-assistant'),

  ORCHESTRATION_MODE: z.enum(['direct', 'n8n']).default('direct'),
  N8N_INBOUND_WEBHOOK_URL: z.string().optional().default(''),

  LLM_PROVIDER: z.enum(['mock', 'gemini', 'openrouter']).default(isTest ? 'mock' : 'mock'),
  LLM_FALLBACK_PROVIDER: z.enum(['mock', 'gemini', 'openrouter', 'none']).default('none'),
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_CHAT_MODEL: z.string().default('gemini-2.0-flash'),
  GEMINI_EMBED_MODEL: z.string().default('text-embedding-004'),
  OPENROUTER_API_KEY: z.string().optional().default(''),
  OPENROUTER_CHAT_MODEL: z.string().default('meta-llama/llama-3.3-70b-instruct:free'),
  OPENROUTER_BASE_URL: z.string().default('https://openrouter.ai/api/v1'),

  EMBEDDING_DIMS: z.coerce.number().int().positive().default(768),
  VECTOR_BACKEND: z.enum(['auto', 'atlas', 'cosine']).default('auto'),
  ATLAS_VECTOR_INDEX: z.string().default('product_embedding_index'),

  IG_APP_ID: z.string().optional().default(''),
  IG_APP_SECRET: z.string().optional().default(''),
  IG_PAGE_ACCESS_TOKEN: z.string().optional().default(''),
  IG_VERIFY_TOKEN: z.string().default('change-me-verify'),
  IG_GRAPH_VERSION: z.string().default('v21.0'),

  WHATSAPP_TOKEN: z.string().optional().default(''),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional().default(''),
  WHATSAPP_VERIFY_TOKEN: z.string().default('change-me-verify'),
  WHATSAPP_GRAPH_VERSION: z.string().default('v21.0'),

  CHANNEL_TRANSPORT: z.enum(['live', 'stub']).default(isTest ? 'stub' : 'live'),

  VOICE_PROVIDER: z.enum(['mock', 'google']).default('mock'),
  DEFAULT_LANGUAGE: z.enum(['en', 'ur']).default('en'),

  JWT_SECRET: z.string().default(isTest ? 'test-secret' : 'change-me-jwt'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ADMIN_EMAIL: z.string().email().default('admin@brand.test'),
  ADMIN_PASSWORD: z.string().default('change-me-admin'),

  ENABLE_SWAGGER: boolish(true),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  process.stderr.write(`Invalid environment configuration:\n${issues}\n`);
  process.exit(1);
}

export const config = Object.freeze(parsed.data);

export const isProd = config.NODE_ENV === 'production';
export const isTestEnv = config.NODE_ENV === 'test';
