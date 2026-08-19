/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'prompt': nunca recarrega sozinho. Nosso UpdateBanner decide quando
      // ativar a nova versão, para nunca interromper o usuário sem aviso.
      registerType: 'prompt',
      injectRegister: false,
      manifest: {
        id: '/',
        name: 'JARVIS',
        short_name: 'JARVIS',
        description:
          'Central de comando pessoal do JARVIS Universal: HUD holográfico, conversa e ferramentas seguras.',
        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#070d13',
        background_color: '#04070a',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precacheia somente o shell buildado (HTML/JS/CSS/ícones
        // versionados pelo hash do Vite). Sem runtimeCaching configurado:
        // chamadas a /api/* (chat, saúde) nunca são interceptadas nem
        // cacheadas — sempre vão direto para a rede.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    proxy: {
      // Em desenvolvimento, o frontend nunca fala diretamente com segredos;
      // toda chamada à API passa por este proxy até http://localhost:8000.
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
