import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-icon.svg', 'data/routine.json'],
      manifest: {
        name: 'Class Routine | Dept of Agricultural Science',
        short_name: 'Agri Routine',
        description:
          'View and download student section schedules, lab groups, and faculty class routines for the Department of Agricultural Science, Daffodil International University (DIU).',
        theme_color: '#15803D',
        background_color: '#F3F8F4',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/pwa-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.endsWith('/data/routine.json'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'routine-data-cache',
              networkTimeoutSeconds: 4,
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
})
