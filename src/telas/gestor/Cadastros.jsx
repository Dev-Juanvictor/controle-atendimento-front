// Aba "Cadastros e acessos": atendentes, guichês e registro de acesso (LGPD)
import { useEffect, useState } from 'react'

import { api } from '../../api.js'
import { Aviso } from '../../componentes.jsx'

const USUARIO_VAZIO = { nome: '', login: '', senha: '', perfil: 'ATENDENTE' }

export default function Cadastros({ onSair }) {
  const [usuarios, setUsuarios] = useState([])
  const [guiches, setGuiches] = useState([])
  const [acessos, setAcessos] = useState([])
  const [novoUsuario, setNovoUsuario] = useState(USUARIO_VAZIO)
  const [novoGuiche, setNovoGuiche] = useState('')
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')

  async function carregar() {
    try {
      const [u, g, a] = await Promise.all([api.usuarios(), api.guiches(), api.acessos()])
      setUsuarios(u)
      setGuiches(g)
      setAcessos(a)
    } catch (e) {
      if (e.status === 401) return onSair()
      setErro(e.message)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  // Roda uma ação, mostra o resultado e recarrega as listas
  async function executar(acao, textoSucesso) {
    setErro('')
    setMensagem('')
    try {
      await acao()
      setMensagem(textoSucesso)
      await carregar()
      return true
    } catch (e) {
      if (e.status === 401) return onSair()
      setErro(e.message)
      return false
    }
  }

  async function cadastrarUsuario(evento) {
    evento.preventDefault()
    const ok = await executar(() => api.criarUsuario(novoUsuario), `Usuário ${novoUsuario.login} cadastrado.`)
    if (ok) setNovoUsuario(USUARIO_VAZIO)
  }

  async function cadastrarGuiche(evento) {
    evento.preventDefault()
    const ok = await executar(() => api.criarGuiche(Number(novoGuiche)), `Guichê ${novoGuiche} cadastrado.`)
    if (ok) setNovoGuiche('')
  }

  const campo = (nome) => ({
    value: novoUsuario[nome],
    onChange: (e) => setNovoUsuario({ ...novoUsuario, [nome]: e.target.value }),
  })

  return (
    <>
      <Aviso>{erro}</Aviso>
      {mensagem && <p className="sucesso">{mensagem}</p>}

      <section className="cartao">
        <h2>Atendentes</h2>
        <table className="tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Login</th>
              <th>Perfil</th>
              <th>Situação</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nome}</td>
                <td>{u.login}</td>
                <td>{u.perfil === 'GESTOR' ? 'Gestor' : 'Atendente'}</td>
                <td>{u.ativo ? 'Ativo' : 'Inativo'}</td>
                <td>
                  <button
                    className="botao-link"
                    onClick={() =>
                      executar(
                        () => api.alterarUsuario(u.id, !u.ativo),
                        `${u.nome} ${u.ativo ? 'desativado' : 'ativado'}.`,
                      )
                    }
                  >
                    {u.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <form className="filtros" onSubmit={cadastrarUsuario}>
          <label>
            Nome
            <input {...campo('nome')} minLength={3} required />
          </label>
          <label>
            Login (minúsculas, sem espaço)
            <input {...campo('login')} minLength={3} autoCapitalize="none" required />
          </label>
          <label>
            Senha inicial
            <input {...campo('senha')} type="password" minLength={6} autoComplete="new-password" required />
          </label>
          <label>
            Perfil
            <select {...campo('perfil')}>
              <option value="ATENDENTE">Atendente</option>
              <option value="GESTOR">Gestor</option>
            </select>
          </label>
          <button className="botao">Cadastrar</button>
        </form>
      </section>

      <section className="cartao">
        <h2>Guichês</h2>
        <ul className="lista-guiches">
          {guiches.map((g) => (
            <li key={g.id}>
              <span>
                Guichê {g.numero} {g.ativo ? '' : '(inativo)'}
              </span>
              <button
                className="botao-link"
                onClick={() =>
                  executar(
                    () => api.alterarGuiche(g.id, !g.ativo),
                    `Guichê ${g.numero} ${g.ativo ? 'desativado' : 'ativado'}.`,
                  )
                }
              >
                {g.ativo ? 'Desativar' : 'Ativar'}
              </button>
            </li>
          ))}
        </ul>
        <form className="filtros" onSubmit={cadastrarGuiche}>
          <label>
            Número do novo guichê
            <input type="number" min="1" max="99" value={novoGuiche} onChange={(e) => setNovoGuiche(e.target.value)} required />
          </label>
          <button className="botao">Cadastrar</button>
        </form>
      </section>

      <section className="cartao">
        <h2>Registro de acesso</h2>
        <p className="dica">Quem entrou no sistema, viu relatório ou alterou cadastro. Senhas nunca são registradas.</p>
        <div className="rolagem">
          <table className="tabela">
            <thead>
              <tr>
                <th>Quando</th>
                <th>Usuário</th>
                <th>Evento</th>
                <th>Detalhe</th>
              </tr>
            </thead>
            <tbody>
              {acessos.map((a, i) => (
                <tr key={i}>
                  <td>{new Date(a.ocorrido_em).toLocaleString('pt-BR')}</td>
                  <td>{a.usuario ?? '(não identificado)'}</td>
                  <td>{a.evento}</td>
                  <td>{a.detalhe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
