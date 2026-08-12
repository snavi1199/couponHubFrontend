import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    // Without this, navigating directly to /dashboard or refreshing on any non-root
    // route returns a 404 from the dev server instead of serving index.html and letting
    // React Router handle the path. Same goes for vite preview (production preview mode).
    historyApiFallback: true,
  },
  preview: {
    port: 4173,
    historyApiFallback: true,
  },
})
