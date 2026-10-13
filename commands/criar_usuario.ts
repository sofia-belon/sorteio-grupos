import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import UsuarioRepository from '#services/usuario_repository'

export default class CriarUsuario extends BaseCommand {
  static commandName = 'criar-usuario'
  static description = 'Cadastra um usuário que poderá fazer login na página'
  static options: CommandOptions = { startApp: false }

  @args.string({ description: 'E-mail usado no login' })
  declare email: string

  @args.string({ description: 'Nome exibido na página' })
  declare nome: string

  async run() {
    const senha = await this.prompt.secure('Senha (mínimo 6 caracteres)')

    try {
      const usuario = await new UsuarioRepository().criar(this.nome, this.email, senha)
      this.logger.success(`Usuário #${usuario.id} (${usuario.email}) criado`)
    } catch (error) {
      this.logger.error((error as Error).message)
      this.exitCode = 1
    }
  }
}
