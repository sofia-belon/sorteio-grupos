import router from '@adonisjs/core/services/router'

/*
| A página visual (GET /) é o front-end React compilado em public/,
| entregue pelo middleware de arquivos estáticos registrado no kernel.
*/

const SorteiosController = () => import('#controllers/sorteios_controller')

router.get('/api', async () => ({
  app: 'sorteio-grupos',
  rotas: {
    'GET /sorteio': 'Sorteia os 12 participantes padrão em grupos de 3 (não grava)',
    'POST /sorteio':
      'Sorteia e grava no banco. Body opcional: { "participantes": string[], "tamanho": number }',
    'GET /sorteios': 'Histórico de sorteios gravados',
    'GET /sorteios/ultimo': 'O sorteio gravado mais recente (204 se não houver nenhum)',
    'GET /sorteios/:id': 'Um sorteio gravado',
  },
}))

router.get('/sorteio', [SorteiosController, 'index'])
router.post('/sorteio', [SorteiosController, 'store'])
router.get('/sorteios', [SorteiosController, 'historico'])
router.get('/sorteios/ultimo', [SorteiosController, 'ultimo'])
router.get('/sorteios/:id', [SorteiosController, 'show']).where('id', router.matchers.number())
