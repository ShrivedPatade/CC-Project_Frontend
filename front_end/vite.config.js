import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist'
  }
  server: {
    proxy: {
      '/chatbot': {
        target: 'http://74.225.250.3:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
