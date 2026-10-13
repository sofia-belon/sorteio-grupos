import { defineConfig } from '@adonisjs/static'

/**
 * Configuração do middleware que entrega os arquivos da pasta public/
 * (o front-end React gerado pelo Vite).
 */
const staticServerConfig = defineConfig({
  enabled: true,
  etag: true,
  lastModified: true,
  dotFiles: 'ignore',
})

export default staticServerConfig
