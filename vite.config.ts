import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import type { IncomingMessage } from 'node:http'
import type { ClientRequest } from 'node:http'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    server: {
      proxy: {
        // In dev, forward /api/* → https://api.entergram.com/* and inject the API key.
        // The ENTERGRAM_API_KEY comes from your local .env file.
        '/api': {
          target: 'https://api.entergram.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq: ClientRequest, _req: IncomingMessage) => {
              if (env.ENTERGRAM_API_KEY) {
                proxyReq.setHeader('X-API-Key', env.ENTERGRAM_API_KEY)
              }
            })
          },
        },
      },
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'favicon.ico'],
        manifest: {
          name: 'Venysium — Entergram Chat',
          short_name: 'Venysium',
          description: 'Telegram-style PWA for your Entergram workspace',
          theme_color: '#17212b',
          background_color: '#0e1621',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: 'icon.svg',
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
              urlPattern: /^\/api\//,
              handler: 'NetworkOnly',
            },
          ],
        },
      }),
    ],
  }
})
