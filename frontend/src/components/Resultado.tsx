import type { ResultadoSorteio } from '../../../app/shared/sorteio'

interface ResultadoProps {
  resultado: ResultadoSorteio | null
  erro: string
}

export default function Resultado({ resultado, erro }: ResultadoProps) {
  return (
    <section>
      {erro && <div className="erro">{erro}</div>}

      <div className="meta">
        {resultado &&
          `${resultado.totalParticipantes} participantes em grupos de ${resultado.tamanhoGrupo}` +
            ` · sorteado em ${new Date(resultado.sorteadoEm).toLocaleString('pt-BR')}`}
      </div>

      <div className="grupos">
        {resultado ? (
          resultado.grupos.map((grupo, i) => (
            // A key inclui sorteadoEm para refazer a animação a cada novo sorteio
            <div
              key={`${resultado.sorteadoEm}-${grupo.numero}`}
              className="grupo"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <h2>Grupo {grupo.numero}</h2>
              <ul>
                {grupo.integrantes.map((nome) => (
                  <li key={nome}>{nome}</li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <div className="vazio">Os grupos sorteados aparecem aqui.</div>
        )}
      </div>
    </section>
  )
}
