import type { SorteioSalvo } from '../../app/shared/sorteio'
import type { Usuario } from '../../app/shared/usuario'

/**
 * POST /auth/login — entra no sistema. Lança erro com a mensagem da API se as credenciais estiverem erradas.
 */
export async function entrar(email: string, senha: string): Promise<Usuario> {
  const resposta = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email, senha }),
  })
  const dados = await resposta.json()
  if (!resposta.ok) {
    throw new Error(dados.erro ?? 'Não foi possível entrar')
  }
  return dados
}

/**
 * POST /auth/cadastro — cria a conta e já entra. Lança erro com a mensagem da API se os dados forem inválidos.
 */
export async function cadastrar(nome: string, email: string, senha: string): Promise<Usuario> {
  const resposta = await fetch('/auth/cadastro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ nome, email, senha }),
  })
  const dados = await resposta.json()
  if (!resposta.ok) {
    throw new Error(dados.erro ?? 'Não foi possível criar a conta')
  }
  return dados
}

/**
 * POST /auth/logout — sai do sistema.
 */
export async function sair() {
  await fetch('/auth/logout', { method: 'POST' })
}

/**
 * GET /auth/me — o usuário logado, ou null se ninguém estiver logado.
 */
export async function buscarUsuarioLogado(): Promise<Usuario | null> {
  const resposta = await fetch('/auth/me', { headers: { Accept: 'application/json' } })
  if (resposta.status === 401) {
    return null
  }
  if (!resposta.ok) {
    throw new Error('Não foi possível verificar o login')
  }
  return resposta.json()
}

/**
 * POST /sorteio — sorteia e grava no banco. Lança erro com a mensagem da API se a entrada for inválida.
 */
export async function sortear(participantes: string[], tamanho: number): Promise<SorteioSalvo> {
  const resposta = await fetch('/sorteio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ participantes, tamanho }),
  })
  const dados = await resposta.json()
  if (!resposta.ok) {
    throw new Error(dados.erro ?? 'Não foi possível sortear')
  }
  return dados
}

/**
 * GET /sorteios/ultimo — o sorteio salvo mais recente, ou null se ainda não houver nenhum.
 */
export async function buscarUltimoSorteio(): Promise<SorteioSalvo | null> {
  const resposta = await fetch('/sorteios/ultimo', { headers: { Accept: 'application/json' } })
  if (resposta.status === 204) {
    return null
  }
  if (!resposta.ok) {
    throw new Error('Não foi possível carregar o último sorteio')
  }
  return resposta.json()
}
