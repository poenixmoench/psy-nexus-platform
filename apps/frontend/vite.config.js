// vite.config.js

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue' // <-- 1. Importiert das Vue-Plugin

export default defineConfig({
  plugins: [
    vue(), // <-- 2. Aktiviert das Plugin für die .vue-Dateien
  ],
  server: {
    hmr: false // Behält Ihre ursprüngliche HMR-Einstellung
  }
})
