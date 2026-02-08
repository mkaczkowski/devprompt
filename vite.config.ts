import path from 'path';

import { sentryVitePlugin } from '@sentry/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['@lingui/babel-plugin-lingui-macro'],
      },
    }),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      manifest: {
        name: 'DevPrompt',
        short_name: 'DevPrompt',
        description: 'Create, organize, and share structured AI prompts',
        theme_color: '#7033ff',
        background_color: '#0a0a0b',
        display: 'standalone',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2,png}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/clerk/],
      },
    }),
    // Sentry plugin only in production with auth token
    ...(process.env.SENTRY_AUTH_TOKEN
      ? [
          sentryVitePlugin({
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            authToken: process.env.SENTRY_AUTH_TOKEN,
            sourcemaps: {
              filesToDeleteAfterUpload: ['./dist/**/*.map'],
            },
            telemetry: false,
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    devSourcemap: true,
  },
  build: {
    // Use hidden sourcemaps when uploading to Sentry (not referenced in built files)
    // Otherwise use regular sourcemaps if VITE_SOURCEMAP is enabled
    sourcemap: process.env.SENTRY_AUTH_TOKEN ? 'hidden' : process.env.VITE_SOURCEMAP === 'true',
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router'],
          ui: ['@radix-ui/react-slot', 'class-variance-authority'],
          i18n: ['@lingui/core', '@lingui/react'],
          markdown: ['react-markdown', 'remark-gfm', 'rehype-highlight'],
          dnd: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
        },
      },
    },
  },
});
