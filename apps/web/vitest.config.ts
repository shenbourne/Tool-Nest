import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

// Lightweight standalone config for pure-logic unit tests.
// Kept separate from vite.config.ts so tests skip the UI plugin chain
// (Vue SFC, UnoCSS, auto-import, component resolvers).
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@toolnest/shared': resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
