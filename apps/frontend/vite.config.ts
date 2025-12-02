import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',  // ✅ Höre auf ALLEN Interfaces
    port: 5173,
    hmr: {
      host: '157.180.31.27',  // ✅ HMR auf öffentliche IP
      port: 5173
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
