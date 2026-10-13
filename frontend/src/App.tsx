import { useEffect, useState } from 'react'
import { PARTICIPANTES, TAMANHO_GRUPO, type ResultadoSorteio } from '../../app/shared/sorteio'
import type { Usuario } from '../../app/shared/usuario'
import { buscarUltimoSorteio, buscarUsuarioLogado, sair, sortear } from './api'
import Formulario from './components/Formulario'
import Login from './components/Login'
import Resultado from './components/Resultado'

function lerNomes(texto: string) {
  return texto
    .split('\n')
    .map((nome) => nome.trim())
    .filter(Boolean)
}

export default function App() {
  // undefined = ainda verificando o login; null = ninguém logado
  const [usuario, setUsuario] = useState<Usuario | null | undefined>(undefined)

  useEffect(() => {
    buscarUsuarioLogado()
      .then(setUsuario)
      .catch(() => setUsuario(null))
  }, [])

  async function handleSair() {
    await sair()
    setUsuario(null)
  }

  if (usuario === undefined) {
    return null
  }
  if (usuario === null) {
    return <Login onEntrar={setUsuario} />
  }
  return <Sorteio usuario={usuario} onSair={handleSair} />
}

interface SorteioProps {
  usuario: Usuario
  onSair: () => void
}

function Sorteio({ usuario, onSair }: SorteioProps) {
  const [nomes, setNomes] = useState(PARTICIPANTES.join('\n'))
  const [tamanho, setTamanho] = useState(String(TAMANHO_GRUPO))
  const [resultado, setResultado] = useState<ResultadoSorteio | null>(null)
  const [erro, setErro] = useState('')
  const [sorteando, setSorteando] = useState(false)

  // Ao abrir a página, mostra o último sorteio salvo (se o usuário ainda não sorteou nada)
  useEffect(() => {
    buscarUltimoSorteio()
      .then((ultimo) => setResultado((atual) => atual ?? ultimo))
      .catch(() => {})
  }, [])

  async function handleSortear() {
    setErro('')
    setSorteando(true)
    try {
      setResultado(await sortear(lerNomes(nomes), Number(tamanho)))
    } catch (error) {
      setErro((error as Error).message)
    } finally {
      setSorteando(false)
    }
  }

  return (
    <main>
      <header className="topo">
        <h1>Sorteio de Grupos</h1>
        <div className="usuario">
          <span>{usuario.nome}</span>
          <button type="button" className="secundario" onClick={onSair}>
            Sair
          </button>
        </div>
      </header>
      <p className="sub">Digite os participantes, escolha o tamanho dos grupos e clique em sortear.</p>

      <div className="layout">
        <Formulario
          nomes={nomes}
          tamanho={tamanho}
          totalParticipantes={lerNomes(nomes).length}
          sorteando={sorteando}
          onNomesChange={setNomes}
          onTamanhoChange={setTamanho}
          onSortear={handleSortear}
        />
        <Resultado resultado={resultado} erro={erro} />
      </div>
    </main>
  )
}
