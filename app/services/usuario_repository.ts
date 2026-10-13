import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import db from '#services/database'
import type { Usuario } from '#shared/usuario'

export type { Usuario }

const scryptAsync = promisify(scrypt) as (senha: string, sal: Buffer, tamanho: number) => Promise<Buffer>

interface LinhaUsuario {
  id: number
  nome: string
  email: string
  senha_hash: string
}

/**
 * Guarda a senha como "sal:hash" (scrypt). A senha em texto nunca vai para o banco.
 */
async function gerarHash(senha: string) {
  const sal = randomBytes(16)
  const hash = await scryptAsync(senha, sal, 64)
  return `${sal.toString('hex')}:${hash.toString('hex')}`
}

async function conferirHash(senha: string, guardado: string) {
  const [sal, hash] = guardado.split(':')
  const esperado = Buffer.from(hash, 'hex')
  const calculado = await scryptAsync(senha, Buffer.from(sal, 'hex'), esperado.length)
  return timingSafeEqual(esperado, calculado)
}

function normalizarEmail(email: string) {
  return email.trim().toLowerCase()
}

export default class UsuarioRepository {
  async criar(nome: string, email: string, senha: string): Promise<Usuario> {
    if (!nome.trim() || !email.trim()) {
      throw new Error('Informe nome e e-mail')
    }
    if (senha.length < 6) {
      throw new Error('A senha precisa ter pelo menos 6 caracteres')
    }
    if (this.buscarPorEmail(email)) {
      throw new Error('Já existe um usuário com esse e-mail')
    }

    const { lastInsertRowid } = db
      .prepare('INSERT INTO usuarios (nome, email, senha_hash, criado_em) VALUES (?, ?, ?, ?)')
      .run(nome.trim(), normalizarEmail(email), await gerarHash(senha), new Date().toISOString())

    return { id: Number(lastInsertRowid), nome: nome.trim(), email: normalizarEmail(email) }
  }

  /**
   * Devolve o usuário se e-mail e senha conferem, ou null caso contrário.
   */
  async verificarCredenciais(email: string, senha: string): Promise<Usuario | null> {
    const linha = this.buscarPorEmail(email)
    if (!linha || !(await conferirHash(senha, linha.senha_hash))) {
      return null
    }
    return { id: linha.id, nome: linha.nome, email: linha.email }
  }

  buscar(id: number): Usuario | null {
    const linha = db.prepare('SELECT id, nome, email FROM usuarios WHERE id = ?').get(id) as
      | Usuario
      | undefined
    return linha ?? null
  }

  private buscarPorEmail(email: string) {
    return db.prepare('SELECT * FROM usuarios WHERE email = ?').get(normalizarEmail(email)) as
      | LinhaUsuario
      | undefined
  }
}
