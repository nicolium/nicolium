import { fileURLToPath, URL } from 'node:url';
import { resolve } from 'path';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

import pkg from './package.json';

export default defineConfig(() => ({
  plugins: [dts({ include: ['lib'], insertTypesEntry: true })],
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      fileName: (format) => `main.${format}.js`,
      formats: ['cjs', 'es', 'umd'],
      name: 'pl-api',
    },
    target: 'esnext',
    sourcemap: true,
    rollupOptions: {
      external: Object.keys(pkg.dependencies),
    },
  },
  resolve: {
    alias: [
      {
        find: '@/',
        replacement: fileURLToPath(new URL('./lib/', import.meta.url)),
      },
    ],
  },
  server: {
    port: Number(process.env.PORT ?? 7313),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
    css: false,
  },
}));
