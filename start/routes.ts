import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

/*
| A página visual (GET /) é o front-end React compilado em public/,
| entregue pelo middleware de arquivos estáticos registrado no kernel.
*/

const SorteiosController = () => import('#controllers/sorteios_controller')
const AuthController = () => import('#controllers/auth_controller')

router.get('/api', async () => ({
  app: 'sorteio-grupos',
  rotas: {
    'POST /auth/login': 'Entra no sistema. Body: { "email": string, "senha": string }',
    'POST /auth/cadastro':
      'Cria uma conta e já entra. Body: { "nome": string, "email": string, "senha": string }',
    'POST /auth/logout': 'Sai do sistema',
    'GET /auth/me': 'O usuário logado (401 se não houver)',
    'GET /sorteio': 'Sorteia os 12 participantes padrão em grupos de 3 (não grava)',
    'POST /sorteio':
      'Sorteia e grava no banco. Body opcional: { "participantes": string[], "tamanho": number }',
    'GET /sorteios': 'Histórico de sorteios gravados',
    'GET /sorteios/ultimo': 'O sorteio gravado mais recente (204 se não houver nenhum)',
    'GET /sorteios/:id': 'Um sorteio gravado',
  },
  observacao: 'As rotas /sorteio, /sorteios e /auth/me exigem login',
}))

router.post('/auth/login', [AuthController, 'login'])
router.post('/auth/cadastro', [AuthController, 'cadastro'])
router.post('/auth/logout', [AuthController, 'logout'])

router
  .group(() => {
    router.get('/auth/me', [AuthController, 'me'])
    router.get('/sorteio', [SorteiosController, 'index'])
    router.post('/sorteio', [SorteiosController, 'store'])
    router.get('/sorteios', [SorteiosController, 'historico'])
    router.get('/sorteios/ultimo', [SorteiosController, 'ultimo'])
    router.get('/sorteios/:id', [SorteiosController, 'show']).where('id', router.matchers.number())
  })
  .use(middleware.auth())
