import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Prevent Vite from walking up to a stray postcss/tailwind config outside the repo.
  css: { postcss: { plugins: [] } },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    testTimeout: 30000,
    hookTimeout: 60000,
    pool: 'forks',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov'],
      include: [
        'src/services/ai/**',
        'src/services/conversation/**',
        'src/services/embeddings/**',
        'src/services/llm/mock.provider.js',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        statements: 80,
        branches: 65,
      },
    },
  },
});
