import { defineConfig } from '@adonisjs/core/app'

export default defineConfig({
  /*
  | Comandos Ace do framework. Os comandos da pasta ./commands
  | (ex.: `node ace sortear`) são descobertos automaticamente.
  */
  commands: [() => import('@adonisjs/core/commands')],

  providers: [
    () => import('@adonisjs/core/providers/app_provider'),
    () => import('@adonisjs/static/static_provider'),
  ],

  preloads: [() => import('#start/routes'), () => import('#start/kernel')],

  /*
  | Arquivos copiados para build/ no `node ace build`.
  | public/ guarda o front-end React já compilado pelo Vite.
  */
  metaFiles: [{ pattern: 'public/**', reloadServer: false }],
})
