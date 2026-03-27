import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // allow external access

    allowedHosts: ['bitlab.utej.me'], // allow your domain

    proxy: {
      '/api': {
        target: 'https://3.131.146.52:8080',
        changeOrigin: true,
      }
    }
  }
})
