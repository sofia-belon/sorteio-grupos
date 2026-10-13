import { useState, type FormEvent } from 'react'
import type { Usuario } from '../../../app/shared/usuario'
import { cadastrar, entrar } from '../api'

type Aba = 'entrar' | 'cadastrar'

interface LoginProps {
  onEntrar: (usuario: Usuario) => void
}

export default function Login({ onEntrar }: LoginProps) {
  const [aba, setAba] = useState<Aba>('entrar')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const cadastro = aba === 'cadastrar'

  function trocarAba(nova: Aba) {
    setAba(nova)
    setErro('')
    setSenha('')
    setConfirmacao('')
  }

  async function handleSubmit(evento: FormEvent) {
    evento.preventDefault()
    setErro('')

    if (cadastro && senha !== confirmacao) {
      setErro('As senhas não conferem')
      return
    }

    setEnviando(true)
    try {
      onEntrar(cadastro ? await cadastrar(nome, email, senha) : await entrar(email, senha))
    } catch (error) {
      setErro((error as Error).message)
      setEnviando(false)
    }
  }

  return (
    <main className="login">
      <h1>Sorteio de Grupos</h1>
      <p className="sub">
        {cadastro ? 'Crie sua conta para começar.' : 'Entre com seu e-mail e senha para continuar.'}
      </p>

      <div className="abas" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={!cadastro}
          className={cadastro ? '' : 'ativa'}
          onClick={() => trocarAba('entrar')}
        >
          Entrar
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={cadastro}
          className={cadastro ? 'ativa' : ''}
          onClick={() => trocarAba('cadastrar')}
        >
          Criar conta
        </button>
      </div>

      <form className="painel" onSubmit={handleSubmit}>
        {erro && (
          <div className="erro" role="alert">
            {erro}
          </div>
        )}

        {cadastro && (
          <div className="campo">
            <label htmlFor="nome">Nome</label>
            <input
              id="nome"
              autoComplete="name"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
        )}
        <div className="campo">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="campo">
          <label htmlFor="senha">
            Senha {cadastro && <span className="dica">(mínimo 6 caracteres)</span>}
          </label>
          <input
            id="senha"
            type="password"
            autoComplete={cadastro ? 'new-password' : 'current-password'}
            required
            minLength={cadastro ? 6 : undefined}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>
        {cadastro && (
          <div className="campo">
            <label htmlFor="confirmacao">Confirme a senha</label>
            <input
              id="confirmacao"
              type="password"
              autoComplete="new-password"
              required
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
            />
          </div>
        )}
        <button type="submit" disabled={enviando}>
          {enviando ? 'Aguarde...' : cadastro ? 'Criar conta' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
