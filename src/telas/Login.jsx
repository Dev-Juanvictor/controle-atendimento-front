// Login do atendente (com guichê) ou do gestor (guichê opcional)
import { useState } from 'react'

import { api } from '../api.js'
import { Aviso, Voltar } from '../componentes.jsx'

const GUICHES = [1, 2, 3, 4, 5] // os mesmos do seed do banco

export default function Login({ paraGestor = false, aviso = '', onEntrar }) {
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [guiche, setGuiche] = useState(paraGestor ? '' : '1')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function entrar(evento) {
    evento.preventDefault()
    setEnviando(true)
    setErro('')
    try {
      await api.login(login, senha, guiche ? Number(guiche) : null)
      onEntrar()
    } catch (e) {
      setErro(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="tela login">
      <Voltar />
      <form className="cartao formulario" onSubmit={entrar}>
        <h1>{paraGestor ? 'Gestão' : 'Guichê'}: entrar</h1>
        <Aviso>{erro || aviso}</Aviso>

        <label>
          Login
          <input value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" required />
        </label>

        <label>
          Senha
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <label>
          Guichê
          <select value={guiche} onChange={(e) => setGuiche(e.target.value)} required={!paraGestor}>
            {paraGestor && <option value="">Sem guichê</option>}
            {GUICHES.map((n) => (
              <option key={n} value={n}>
                Guichê {n}
              </option>
            ))}
          </select>
        </label>

        <button className="botao" disabled={enviando}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
