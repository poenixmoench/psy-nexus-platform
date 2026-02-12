import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  base: '/',
  plugins: [vue()],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../../packages/shared/src"),
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',  // Erlaubt externe Verbindungen
    proxy: {
      '/api': {
        target: 'http://localhost:3005',
        changeOrigin: true,
        secure: false  // Für lokale Entwicklung
      },
      '/socket.io': {
        target: 'http://localhost:3005',
        ws: true,  // WebSocket-Unterstützung aktivieren
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: { chunkSizeWarningLimit: 1600 }
})
