import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { COOKIE_LOGIN } from '#controllers/auth_controller'
import UsuarioRepository, { type Usuario } from '#services/usuario_repository'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    usuario: Usuario
  }
}

/**
 * Só deixa a requisição seguir se o cookie de login apontar para um usuário existente.
 */
export default class AuthMiddleware {
  private repository = new UsuarioRepository()

  async handle(ctx: HttpContext, next: NextFn) {
    const id = ctx.request.encryptedCookie(COOKIE_LOGIN)
    const usuario = typeof id === 'number' ? this.repository.buscar(id) : null

    if (!usuario) {
      return ctx.response.unauthorized({ erro: 'Faça login para continuar' })
    }

    ctx.usuario = usuario
    return next()
  }
}
