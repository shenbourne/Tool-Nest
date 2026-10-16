import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import { resolve } from 'path';

export default defineConfig({
  // @iarna/toml uses Node's global alias for Date, Buffer checks and BigInt.
  // Vite applies these replacements in both dependency pre-bundling and builds.
  define: {
    'global.Date': 'globalThis.Date',
    'global.Buffer': 'globalThis.Buffer',
    'global.BigInt': 'globalThis.BigInt',
  },
  // Pre-bundling rewrites @ffmpeg/ffmpeg's `new Worker(new URL('./worker.js', import.meta.url))`
  // to a non-existent node_modules/.vite/deps/worker.js, which makes ffmpeg.load() hang forever.
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg'],
  },
  plugins: [
    vue(),
    UnoCSS(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia', '@vueuse/core', 'vue-i18n'],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      resolvers: [NaiveUiResolver()],
      dirs: ['src/components'],
      dts: 'src/components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@toolnest/shared': resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
  },
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-naive': ['naive-ui'],
          'vendor-i18n': ['vue-i18n'],
          'vendor-crypto': ['crypto-js', 'node-forge', 'bcryptjs'],
          'vendor-pdf': ['pdf-lib', 'jspdf'],
        },
      },
    },
  },
});
