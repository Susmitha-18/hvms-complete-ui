import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Allow the dev server to be reachable from other devices on the network
  // (host: true sets the server to 0.0.0.0). Keep the API proxy to local backend.
  server: { host: true, port: 5173, proxy: { '/api': 'http://localhost:5000' } }
})
