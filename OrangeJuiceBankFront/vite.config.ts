import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Configuração do servidor de desenvolvimento
  server: {
    port: 5173,
    host: true, // Permite acesso externo
    open: true, // Abre o navegador automaticamente
  },

  // Configuração de build
  build: {
    outDir: 'dist',
    sourcemap: true, // Gera source maps para debug
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
      },
    },
  },

  // Configuração de preview
  preview: {
    port: 4173,
    host: true,
  },

  // Configuração de variáveis de ambiente
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
})
