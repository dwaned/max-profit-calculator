import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:9095',
        changeOrigin: true,
      }
    },
    fs: {
      allow: ['..']
    }
  },
  build: {
    assetsInclude: ['**/*.html']
  }
})
