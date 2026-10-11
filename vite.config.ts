import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';
import { manifest, precacheGlobs } from './pwa.config.ts';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      strategies: 'generateSW',
      registerType: 'prompt',
      includeAssets: ['icons/*', 'licenses/*'],
      manifest,
      workbox: { globPatterns: precacheGlobs },
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        // Bootstrap 5.3 still uses Sass features that newer Sass versions deprecate.
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'],
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['tests/support/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts', 'tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}', 'scripts/**/*.ts'],
      exclude: [
        '**/*.test.{ts,tsx}',
        'src/main.tsx', // composition root: wiring only, exercised by the build and quickstart
        'src/assets/**', // generated noun list
        'scripts/build-wordlist.ts', // file I/O shell; its logic is the tested scripts/wordFilter.ts
        '**/*.d.ts', // type declarations
        'src/domain/types.ts', // types only
        'src/ports/index.ts', // interfaces only
      ],
      thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
    },
  },
});
