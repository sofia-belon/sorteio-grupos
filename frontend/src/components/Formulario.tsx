import type { FormEvent } from 'react'

interface FormularioProps {
  nomes: string
  tamanho: string
  totalParticipantes: number
  sorteando: boolean
  onNomesChange: (nomes: string) => void
  onTamanhoChange: (tamanho: string) => void
  onSortear: () => void
}

export default function Formulario({
  nomes,
  tamanho,
  totalParticipantes,
  sorteando,
  onNomesChange,
  onTamanhoChange,
  onSortear,
}: FormularioProps) {
  function handleSubmit(evento: FormEvent) {
    evento.preventDefault()
    onSortear()
  }

  const porGrupo = Number(tamanho)
  let contagem = `${totalParticipantes} participante${totalParticipantes === 1 ? '' : 's'}`
  if (porGrupo > 0 && totalParticipantes > 0 && totalParticipantes % porGrupo === 0) {
    contagem += ` → ${totalParticipantes / porGrupo} grupos`
  }

  return (
    <form className="painel" onSubmit={handleSubmit}>
      <div className="campo">
        <label htmlFor="nomes">
          Participantes <span className="dica">(um por linha)</span>
        </label>
        <textarea id="nomes" value={nomes} onChange={(e) => onNomesChange(e.target.value)} />
      </div>
      <div className="campo">
        <label htmlFor="tamanho">Pessoas por grupo</label>
        <input
          id="tamanho"
          type="number"
          min={1}
          value={tamanho}
          onChange={(e) => onTamanhoChange(e.target.value)}
        />
      </div>
      <button type="submit" disabled={sorteando}>
        {sorteando ? 'Sorteando...' : 'Sortear'}
      </button>
      <div className="contagem">{contagem}</div>
    </form>
  )
}
