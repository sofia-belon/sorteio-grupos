import type { SorteioSalvo } from '../../app/shared/sorteio'

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
