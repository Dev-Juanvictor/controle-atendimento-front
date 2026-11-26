// Login do atendente (com guichê) ou do gestor (guichê opcional)
import { useEffect, useState } from 'react'

import { api } from '../api.js'
import { Aviso, Voltar } from '../componentes.jsx'

export default function Login({ paraGestor = false, aviso = '', onEntrar }) {
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [guiches, setGuiches] = useState([])
  const [guicheId, setGuicheId] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  // A lista de guichês vem da API (o gestor pode cadastrar ou desativar guichês)
  useEffect(() => {
    api
      .guiches()
      .then((lista) => {
        const ativos = lista.filter((g) => g.ativo)
        setGuiches(ativos)
        if (!paraGestor && ativos.length > 0) setGuicheId(String(ativos[0].id))
      })
      .catch((e) => setErro(e.message))
  }, [paraGestor])

  async function entrar(evento) {
    evento.preventDefault()
    setEnviando(true)
    setErro('')
    try {
      const guiche = guiches.find((g) => String(g.id) === guicheId) ?? null
      await api.login(login, senha, guiche)
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
          <select value={guicheId} onChange={(e) => setGuicheId(e.target.value)} required={!paraGestor}>
            {paraGestor && <option value="">Sem guichê</option>}
            {guiches.map((g) => (
              <option key={g.id} value={g.id}>
                Guichê {g.numero}
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
