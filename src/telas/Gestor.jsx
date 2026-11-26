// Tela do gestor: acompanhamento, relatórios e cadastros (cada aba é um arquivo em telas/gestor/)
import { useState } from 'react'

import { lerSessao, sair } from '../api.js'
import { Relogio } from '../componentes.jsx'
import Login from './Login.jsx'
import Acompanhamento from './gestor/Acompanhamento.jsx'
import Cadastros from './gestor/Cadastros.jsx'
import Relatorios from './gestor/Relatorios.jsx'

const ABAS = [
  { id: 'acompanhamento', nome: 'Acompanhamento', Tela: Acompanhamento },
  { id: 'relatorios', nome: 'Relatórios', Tela: Relatorios },
  { id: 'cadastros', nome: 'Cadastros e acessos', Tela: Cadastros },
]

export default function Gestor() {
  const [sessao, setSessao] = useState(lerSessao)
  const [aba, setAba] = useState('acompanhamento')

  if (sessao?.usuario.perfil !== 'GESTOR') {
    const aviso = sessao ? 'Este login não é de gestor. Entre com o usuário do gestor.' : ''
    return <Login paraGestor aviso={aviso} onEntrar={() => setSessao(lerSessao())} />
  }

  function sairDaGestao() {
    sair()
    setSessao(null)
  }

  const { Tela } = ABAS.find((a) => a.id === aba)

  return (
    <main className="tela gestor">
      <header className="guiche-topo">
        <div>
          <h1>Gestão</h1>
          <span>{sessao.usuario.nome}</span>
        </div>
        <Relogio />
        <button className="botao botao-secundario" onClick={sairDaGestao}>
          Sair
        </button>
      </header>

      <nav className="abas" aria-label="Seções da gestão">
        {ABAS.map((a) => (
          <button
            key={a.id}
            className={a.id === aba ? 'aba aba-ativa' : 'aba'}
            aria-current={a.id === aba ? 'page' : undefined}
            onClick={() => setAba(a.id)}
          >
            {a.nome}
          </button>
        ))}
      </nav>

      <Tela onSair={sairDaGestao} />
    </main>
  )
}
