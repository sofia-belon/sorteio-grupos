import router from '@adonisjs/core/services/router'
import server from '@adonisjs/core/services/server'

server.errorHandler(() => import('#exceptions/handler'))

/*
| Entrega os arquivos da pasta public/ (o front-end React compilado).
| Roda antes das rotas: GET / devolve public/index.html.
*/
server.use([() => import('@adonisjs/static/static_middleware')])

router.use([() => import('@adonisjs/core/bodyparser_middleware')])

export const middleware = router.named({})
