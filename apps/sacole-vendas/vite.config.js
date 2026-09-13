import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      output: {
        // A cena 3D sai do bundle da primeira dobra e carrega sob demanda.
        manualChunks: { three: ['three'] },
      },
    },
  },
})
