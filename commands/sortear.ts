import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import SorteioService, { PARTICIPANTES, TAMANHO_GRUPO } from '#services/sorteio_service'
import SorteioRepository from '#services/sorteio_repository'

export default class Sortear extends BaseCommand {
  static commandName = 'sortear'
  static description = 'Sorteia os participantes em grupos (padrão: 12 pessoas, grupos de 3)'
  static options: CommandOptions = { startApp: false }

  @flags.number({ description: 'Quantidade de pessoas por grupo', default: TAMANHO_GRUPO })
  declare tamanho: number

  async run() {
    const resultado = new SorteioRepository().salvar(
      new SorteioService().sortear(PARTICIPANTES, this.tamanho)
    )

    const table = this.ui.table()
    table.head(['Grupo', 'Integrantes'])
    for (const grupo of resultado.grupos) {
      table.row([`Grupo ${grupo.numero}`, grupo.integrantes.join(', ')])
    }
    table.render()

    this.logger.success(`Sorteio #${resultado.id} realizado em ${resultado.sorteadoEm} e salvo no banco`)
  }
}
