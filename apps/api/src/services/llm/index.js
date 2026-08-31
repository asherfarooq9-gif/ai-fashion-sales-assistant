import { config, isTestEnv } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { mockProvider } from './mock.provider.js';
import { geminiProvider } from './gemini.provider.js';
import { openrouterProvider } from './openrouter.provider.js';

const REGISTRY = {
  mock: mockProvider,
  gemini: geminiProvider,
  openrouter: openrouterProvider,
};

export function getProvider(name = config.LLM_PROVIDER) {
  if (isTestEnv) return mockProvider;
  return REGISTRY[name] || mockProvider;
}

function isTransient(err) {
  const status = err?.status || err?.response?.status;
  return status === 429 || status === 500 || status === 502 || status === 503 || err?.code === 'ETIMEDOUT';
}

/**
 * Wrap a provider so transient failures retry on the configured fallback provider.
 */
export function withFallback(primary = getProvider(), fallbackName = config.LLM_FALLBACK_PROVIDER) {
  if (isTestEnv || fallbackName === 'none' || fallbackName === primary.name) return primary;
  const fallback = REGISTRY[fallbackName];
  if (!fallback) return primary;

  const wrap =
    (method) =>
    async (...args) => {
      try {
        return await primary[method](...args);
      } catch (err) {
        if (!isTransient(err)) throw err;
        logger.warn({ from: primary.name, to: fallback.name, method }, 'llm fallback');
        return fallback[method](...args);
      }
    };

  return {
    name: `${primary.name}+${fallback.name}`,
    chat: wrap('chat'),
    json: wrap('json'),
    embed: wrap('embed'),
  };
}

export const llm = () => withFallback();

export default { getProvider, withFallback, llm };
