import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',  // ← WICHTIG: Nicht localhost, sondern alle IPs
    port: 5173,
    strictPort: false
  }
})
