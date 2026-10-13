import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API = 'http://localhost:3333'

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react()],
  build: {
    // O AdonisJS entrega esta pasta (middleware de arquivos estáticos)
    outDir: fileURLToPath(new URL('../public', import.meta.url)),
    emptyOutDir: true,
  },
  server: {
    // No `npm run dev:web`, as chamadas da página vão para o servidor AdonisJS
    // ("/sorteio" também cobre "/sorteios")
    proxy: { '/sorteio': API, '/api': API, '/auth': API },
  },
})
