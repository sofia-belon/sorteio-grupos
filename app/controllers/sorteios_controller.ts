import type { HttpContext } from '@adonisjs/core/http'
import SorteioService, { PARTICIPANTES, TAMANHO_GRUPO } from '#services/sorteio_service'
import SorteioRepository from '#services/sorteio_repository'

export default class SorteiosController {
  private service = new SorteioService()
  private repository = new SorteioRepository()

  /**
   * GET /sorteio — sorteia a lista padrão de 12 pessoas em grupos de 3 (não grava)
   */
  async index({ response }: HttpContext) {
    return response.ok(this.service.sortear(PARTICIPANTES, TAMANHO_GRUPO))
  }

  /**
   * POST /sorteio — sorteia (lista e tamanho opcionais) e grava o resultado no banco
   */
  async store({ request, response }: HttpContext) {
    const participantes = request.input('participantes', PARTICIPANTES)
    const tamanho = Number(request.input('tamanho', TAMANHO_GRUPO))

    let resultado
    try {
      resultado = this.service.sortear(participantes, tamanho)
    } catch (error) {
      return response.badRequest({ erro: (error as Error).message })
    }

    return response.created(this.repository.salvar(resultado))
  }

  /**
   * GET /sorteios — histórico de sorteios gravados
   */
  async historico({ response }: HttpContext) {
    return response.ok(this.repository.listar())
  }

  /**
   * GET /sorteios/ultimo — o sorteio gravado mais recente (204 se ainda não houver nenhum)
   */
  async ultimo({ response }: HttpContext) {
    const sorteio = this.repository.ultimo()
    if (!sorteio) {
      return response.noContent()
    }
    return response.ok(sorteio)
  }

  /**
   * GET /sorteios/:id — um sorteio gravado
   */
  async show({ params, response }: HttpContext) {
    const sorteio = this.repository.buscar(Number(params.id))
    if (!sorteio) {
      return response.notFound({ erro: 'Sorteio não encontrado' })
    }
    return response.ok(sorteio)
  }
}
