import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      host: true,
      allowedHosts: ['bitlab.utej.me']
      '/api': {
        target: 'http://18.210.22.125:8080',
        changeOrigin: true,
      }
    }
  }
})
