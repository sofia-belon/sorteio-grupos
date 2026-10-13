import db from '#services/database'
import type { ResultadoSorteio, SorteioSalvo } from '#shared/sorteio'

export type { SorteioSalvo }

interface LinhaSorteio {
  id: number
  tamanho_grupo: number
  total_participantes: number
  sorteado_em: string
}

interface LinhaGrupo {
  numero: number
  integrantes: string
}

/**
 * Grava e lê sorteios no SQLite com SQL puro.
 * Os "?" são parâmetros: o driver escapa os valores (protege contra SQL injection).
 */
export default class SorteioRepository {
  /**
   * Salva o sorteio e seus grupos numa transação: ou grava tudo, ou nada.
   */
  salvar(resultado: ResultadoSorteio): SorteioSalvo {
    db.exec('BEGIN')
    try {
      const { lastInsertRowid } = db
        .prepare(
          'INSERT INTO sorteios (tamanho_grupo, total_participantes, sorteado_em) VALUES (?, ?, ?)'
        )
        .run(resultado.tamanhoGrupo, resultado.totalParticipantes, resultado.sorteadoEm)

      const id = Number(lastInsertRowid)
      const inserirGrupo = db.prepare(
        'INSERT INTO grupos (sorteio_id, numero, integrantes) VALUES (?, ?, ?)'
      )
      for (const grupo of resultado.grupos) {
        inserirGrupo.run(id, grupo.numero, JSON.stringify(grupo.integrantes))
      }

      db.exec('COMMIT')
      return { id, ...resultado }
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
  }

  /**
   * Lista todos os sorteios, do mais recente para o mais antigo.
   */
  listar(): SorteioSalvo[] {
    const linhas = db
      .prepare('SELECT * FROM sorteios ORDER BY id DESC')
      .all() as unknown as LinhaSorteio[]
    return linhas.map((linha) => this.montar(linha))
  }

  ultimo(): SorteioSalvo | null {
    const linha = db.prepare('SELECT * FROM sorteios ORDER BY id DESC LIMIT 1').get() as
      | LinhaSorteio
      | undefined
    return linha ? this.montar(linha) : null
  }

  buscar(id: number): SorteioSalvo | null {
    const linha = db.prepare('SELECT * FROM sorteios WHERE id = ?').get(id) as
      | LinhaSorteio
      | undefined
    return linha ? this.montar(linha) : null
  }

  /**
   * Converte as linhas do banco (snake_case + JSON em texto) no formato usado pela API.
   */
  private montar(linha: LinhaSorteio): SorteioSalvo {
    const grupos = db
      .prepare('SELECT numero, integrantes FROM grupos WHERE sorteio_id = ? ORDER BY numero')
      .all(linha.id) as unknown as LinhaGrupo[]

    return {
      id: linha.id,
      sorteadoEm: linha.sorteado_em,
      totalParticipantes: linha.total_participantes,
      tamanhoGrupo: linha.tamanho_grupo,
      grupos: grupos.map((grupo) => ({
        numero: grupo.numero,
        integrantes: JSON.parse(grupo.integrantes),
      })),
    }
  }
}
