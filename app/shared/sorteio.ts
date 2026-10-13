/**
 * Dados e tipos usados tanto pelo servidor quanto pelo front-end React.
 * Este arquivo não pode importar nada do Node, porque também vai para o navegador.
 */
export const PARTICIPANTES = [
  'Dude',
  'Sofia',
  'Marcio',
  'Pedro',
  'Wilson',
  'Ana',
  'Vinicius',
  'Kauan',
  'Luiz',
  'Caique',
  'Samuel',
  'Ellon',
] as const

export const TAMANHO_GRUPO = 3

export interface Grupo {
  numero: number
  integrantes: string[]
}

export interface ResultadoSorteio {
  sorteadoEm: string
  totalParticipantes: number
  tamanhoGrupo: number
  grupos: Grupo[]
}

export interface SorteioSalvo extends ResultadoSorteio {
  id: number
}
