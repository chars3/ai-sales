import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  resolve: {
    alias: {
      // Pode adicionar aliases para importações se necessário
      // '@': '/src',
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})