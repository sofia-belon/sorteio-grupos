import type { HttpContext } from '@adonisjs/core/http'
import UsuarioRepository from '#services/usuario_repository'

/**
 * Nome do cookie de login. É criptografado com a APP_KEY, então não dá para forjar.
 */
export const COOKIE_LOGIN = 'usuario'

export default class AuthController {
  private repository = new UsuarioRepository()

  /**
   * POST /auth/login — confere e-mail e senha e grava o cookie de login
   */
  async login({ request, response }: HttpContext) {
    const email = String(request.input('email', ''))
    const senha = String(request.input('senha', ''))

    const usuario = await this.repository.verificarCredenciais(email, senha)
    if (!usuario) {
      return response.unauthorized({ erro: 'E-mail ou senha incorretos' })
    }

    response.encryptedCookie(COOKIE_LOGIN, usuario.id, { maxAge: '7d' })
    return response.ok(usuario)
  }

  /**
   * POST /auth/cadastro — cria a conta e já deixa o usuário logado
   */
  async cadastro({ request, response }: HttpContext) {
    const nome = String(request.input('nome', ''))
    const email = String(request.input('email', ''))
    const senha = String(request.input('senha', ''))

    let usuario
    try {
      usuario = await this.repository.criar(nome, email, senha)
    } catch (error) {
      return response.badRequest({ erro: (error as Error).message })
    }

    response.encryptedCookie(COOKIE_LOGIN, usuario.id, { maxAge: '7d' })
    return response.created(usuario)
  }

  /**
   * POST /auth/logout — apaga o cookie de login
   */
  async logout({ response }: HttpContext) {
    response.clearCookie(COOKIE_LOGIN)
    return response.noContent()
  }

  /**
   * GET /auth/me — o usuário logado (401 se não houver)
   */
  async me({ usuario, response }: HttpContext) {
    return response.ok(usuario)
  }
}
