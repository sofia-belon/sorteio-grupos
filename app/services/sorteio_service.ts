import { randomInt } from 'node:crypto'
import {
  PARTICIPANTES,
  TAMANHO_GRUPO,
  type Grupo,
  type ResultadoSorteio,
} from '#shared/sorteio'

export { PARTICIPANTES, TAMANHO_GRUPO, type Grupo, type ResultadoSorteio }

export default class SorteioService {
  /**
   * Embaralhamento Fisher-Yates (Durstenfeld) usando crypto.randomInt,
   * que vem do gerador criptograficamente seguro do sistema operacional.
   * Toda permutação possível tem exatamente a mesma probabilidade.
   */
  embaralhar<T>(itens: readonly T[]): T[] {
    const copia = [...itens]
    for (let i = copia.length - 1; i > 0; i--) {
      const j = randomInt(0, i + 1)
      ;[copia[i], copia[j]] = [copia[j], copia[i]]
    }
    return copia
  }

  sortear(
    participantes: readonly string[] = PARTICIPANTES,
    tamanho: number = TAMANHO_GRUPO
  ): ResultadoSorteio {
    this.validar(participantes, tamanho)

    const embaralhados = this.embaralhar(participantes.map((nome) => nome.trim()))
    const grupos: Grupo[] = []
    for (let i = 0; i < embaralhados.length; i += tamanho) {
      grupos.push({ numero: grupos.length + 1, integrantes: embaralhados.slice(i, i + tamanho) })
    }

    return {
      sorteadoEm: new Date().toISOString(),
      totalParticipantes: embaralhados.length,
      tamanhoGrupo: tamanho,
      grupos,
    }
  }

  private validar(participantes: readonly unknown[], tamanho: number) {
    if (!Array.isArray(participantes) || participantes.length === 0) {
      throw new Error('Informe uma lista de participantes não vazia')
    }
    if (participantes.some((nome) => typeof nome !== 'string' || nome.trim() === '')) {
      throw new Error('Todos os participantes devem ser nomes (texto não vazio)')
    }
    const nomes = (participantes as string[]).map((nome) => nome.trim().toLowerCase())
    if (new Set(nomes).size !== nomes.length) {
      throw new Error('Há participantes repetidos na lista')
    }
    if (!Number.isInteger(tamanho) || tamanho < 1) {
      throw new Error('O tamanho do grupo deve ser um inteiro maior que zero')
    }
    if (participantes.length % tamanho !== 0) {
      throw new Error(
        `${participantes.length} participantes não podem ser divididos em grupos de ${tamanho}`
      )
    }
  }
}
