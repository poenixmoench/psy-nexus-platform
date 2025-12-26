import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  base: '/',
  base: '/',
  plugins: [vue()],
  server: {
    port: 5176,
    host: '0.0.0.0',
    hmr: {
      host: '157.180.31.27',
      port: 5176,
      protocol: 'http'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
