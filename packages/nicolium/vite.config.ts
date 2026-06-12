import fs from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

import { tsgoChecker } from '@mkljczk/vite-tsgo-checker';
import react from '@vitejs/plugin-react';
import { bundleStats } from 'rollup-plugin-bundle-stats';
import { defineConfig } from 'vite';
import compileTime from 'vite-plugin-compile-time';
import { createHtmlPlugin } from 'vite-plugin-html';
import { VitePWA } from 'vite-plugin-pwa';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const config = defineConfig(() => ({
  build: {
    assetsDir: 'packs',
    assetsInlineLimit: 0,
    rolldownOptions: {
      output: {
        assetFileNames: 'packs/assets/[name]-[hash].[ext]',
        chunkFileNames: (chunkInfo) =>
          `packs/js/${chunkInfo.facadeModuleId?.includes('/src/locales/') ? 'locales/' : ''}[name]-[hash].js`,
        entryFileNames: 'packs/[name]-[hash].js',
        codeSplitting: {
          minSize: 16 * 1024,
          groups: [
            {
              name: 'react',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|use-sync-external-store)[\\/]/,
              priority: 30,
            },
            {
              name: 'lexical',
              test: /[\\/]node_modules[\\/](lexical|@lexical)[\\/]/,
              priority: 20,
            },
            {
              name: 'emoji',
              test: /[\\/]node_modules[\\/](emoji-mart|@emoji-mart|emoji-datasource)[\\/]/,
              priority: 20,
            },
            {
              name: 'tanstack',
              test: /[\\/]node_modules[\\/]@tanstack[\\/]/,
              priority: 20,
            },
            {
              name: 'sentry',
              test: /[\\/]node_modules[\\/]@sentry[\\/]/,
              priority: 20,
            },
            {
              name: 'intl',
              test: /[\\/]node_modules[\\/](react-intl|intl-messageformat|intl-pluralrules|@formatjs)[\\/]/,
              priority: 20,
            },
            {
              name: 'leaflet',
              test: /[\\/]node_modules[\\/]leaflet[\\/]/,
              priority: 20,
            },
            {
              name: 'vendor',
              test: /[\\/]node_modules[\\/]/,
              priority: 10,
            },
            {
              name: 'common',
              test: /[\\/]src[\\/](components|hooks|utils|stores|queries|contexts|actions|api|schemas)[\\/]/,
              minShareCount: 2,
              priority: 8,
            },
            {
              name: 'admin',
              test: /[\\/]src[\\/](pages[\\/]dashboard|layouts[\\/]admin-)/,
              priority: 5,
            },
            {
              name: 'settings',
              test: /[\\/]src[\\/]pages[\\/]settings[\\/]/,
              priority: 5,
            },
            {
              name: 'chats',
              test: /[\\/]src[\\/](features|pages)[\\/]chats[\\/]/,
              priority: 5,
            },
            {
              name: 'compose',
              test: /[\\/]src[\\/](features[\\/]compose(-event)?|pages[\\/]compose)[\\/]/,
              priority: 5,
            },
            {
              name: 'crypto-donate',
              test: /[\\/]src[\\/]features[\\/]crypto-donate[\\/]/,
              priority: 5,
            },
            {
              name: 'developers',
              test: /[\\/]src[\\/]pages[\\/]developers[\\/]/,
              priority: 5,
            },
            {
              name: 'accounts',
              test: /[\\/]src[\\/](pages[\\/](account-lists|accounts)|components[\\/]panels[\\/](account-note-panel|pinned-accounts-panel|profile-info-panel|profile-media-panel|profile-fields-panel))/,
              priority: 5,
            },
            {
              name: 'timelines',
              test: /[\\/]src[\\/]columns[\\/]timelines[\\/]/,
              priority: 5,
            },
          ],
        },
      },
    },
    sourcemap: true,
  },
  assetsInclude: ['**/*.oga'],
  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT ?? 7312),
    hmr: process.env.HMR_DISABLED === 'true' ? false : undefined,
    ws: process.env.WS_DISABLED === 'true' ? false : undefined,
  },
  plugins: [
    tsgoChecker(process.env.NODE_ENV !== 'test'),
    compileTime(),
    createHtmlPlugin({
      template: 'index.html',
      minify: {
        collapseWhitespace: true,
        removeComments: false,
      },
      inject: {
        data: {
          snippets: readFileContents('custom/snippets.html'),
        },
      },
    }),
    react(),
    VitePWA({
      injectRegister: null,
      strategies: 'injectManifest',
      injectManifest: {
        injectionPoint: undefined,
        plugins: [
          // @ts-expect-error incompatible declarations
          compileTime(),
        ],
      },
      manifestFilename: 'manifest.json',
      manifest: {
        name: 'Nicolium',
        short_name: 'Nicolium',
        description: 'Mastodon-compatible social media front-end',
        icons: [
          {
            src: '/instance/images/logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
        display: 'standalone',
        display_override: ['window-controls-overlay'],
        theme_color: '#d80482',
        categories: ['social'],
        share_target: {
          params: {
            title: 'title',
            text: 'text',
            url: 'url',
          },
          action: 'share',
          method: 'GET',
        },
        shortcuts: [
          {
            name: 'Search',
            url: '/search',
            icons: [
              {
                src: '/instance/images/shortcuts/search.png',
                sizes: '192x192',
                type: 'image/png',
              },
            ],
          },
          {
            name: 'Notifications',
            url: '/notifications',
            icons: [
              {
                src: '/instance/images/shortcuts/notifications.png',
                sizes: '192x192',
                type: 'image/png',
              },
            ],
          },
          {
            name: 'Chats',
            url: '/chats',
            icons: [
              {
                src: '/instance/images/shortcuts/chats.png',
                sizes: '192x192',
                type: 'image/png',
              },
            ],
          },
        ],
        start_url: '/',
        id: '/',
      },
      srcDir: 'src/service-worker',
      filename: 'sw.ts',
    }),
    viteStaticCopy({
      targets: [
        {
          src: './node_modules/@twemoji/svg/*.svg',
          dest: 'packs/emoji/',
        },
        {
          src: './favicon.ico',
          dest: '.',
        },
        {
          src: './favicon.svg',
          dest: '.',
        },
        {
          src: './src/instance',
          dest: '.',
        },
        {
          src: './custom/instance',
          dest: '.',
        },
        {
          src: './node_modules/fasttext.wasm.js/dist/models/language-identification/assets/lid.176.ftz',
          dest: 'fastText/models/',
        },
        {
          src: './node_modules/fasttext.wasm.js/dist/core/fastText.common.wasm',
          dest: 'fastText/',
        },
      ],
    }),
    {
      name: 'mock-api',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith('/api')) {
            res.statusCode = 404;
            res.end('Not Found');
          } else {
            next();
          }
        });
      },
    },
    ...(process.env.ANALYZE === 'true' ? [bundleStats()] : []),
  ],
  resolve: {
    alias: [
      {
        find: '@/',
        replacement: fileURLToPath(new URL('./src/', import.meta.url)),
      },
      {
        find: 'lodash',
        replacement: 'lodash-es',
      },
    ],
    dedupe: ['@floating-ui/react', 'tabbable', 'query-string', 'valibot'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/test-setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    css: false,
  },
}));

/** Return file as string, or return empty string if the file isn't found. */
const readFileContents = (path: string) => {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch {
    return '';
  }
};

export { config as default };
