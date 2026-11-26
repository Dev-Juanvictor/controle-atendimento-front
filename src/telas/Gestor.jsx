// Tela do gestor: acompanha as chamadas e encerra o expediente
import { useState } from 'react'

import { api, lerSessao, sair } from '../api.js'
import { Aviso, Relogio, Tubo } from '../componentes.jsx'
import { useConsultaPeriodica } from '../ganchos.js'
import { rotulo } from '../tipos.js'
import Login from './Login.jsx'

export default function Gestor() {
  const [sessao, setSessao] = useState(lerSessao)

  if (sessao?.usuario.perfil !== 'GESTOR') {
    const aviso = sessao ? 'Este login não é de gestor. Entre com o usuário do gestor.' : ''
    return <Login paraGestor aviso={aviso} onEntrar={() => setSessao(lerSessao())} />
  }

  function sairDaGestao() {
    sair()
    setSessao(null)
  }

  return <PainelGestor sessao={sessao} onSair={sairDaGestao} />
}

function PainelGestor({ sessao, onSair }) {
  const { dados, erro } = useConsultaPeriodica(api.painel, 5000)
  const [confirmando, setConfirmando] = useState(false)
  const [resultado, setResultado] = useState('')
  const [falha, setFalha] = useState('')

  async function encerrarExpediente() {
    setFalha('')
    try {
      const resposta = await api.encerrarExpediente()
      setResultado(`Expediente encerrado. ${resposta.senhas_descartadas} senha(s) descartada(s).`)
    } catch (e) {
      if (e.status === 401) return onSair()
      setFalha(e.message)
    } finally {
      setConfirmando(false)
    }
  }

  const chamadas = dados?.ultimas_chamadas ?? []

  return (
    <main className="tela gestor">
      <header className="guiche-topo">
        <div>
          <h1>Gestão</h1>
          <span>{sessao.usuario.nome}</span>
        </div>
        <Relogio />
        <button className="botao botao-secundario" onClick={onSair}>
          Sair
        </button>
      </header>

      {erro && <Aviso>{erro.message}</Aviso>}

      <section className="cartao">
        <h2>Últimas chamadas</h2>
        {chamadas.length === 0 ? (
          <p className="vazio">Nenhuma senha chamada hoje.</p>
        ) : (
          <ul className="lista-chamadas">
            {chamadas.map((c) => (
              <li key={`${c.numero}-${c.ultima_chamada}`}>
                <Tubo tipo={c.tipo} texto={rotulo(c.tipo, c.sequencial)} tamanho="p" />
                <span>Guichê {c.guiche}</span>
                <span>{new Date(c.chamada_em).toLocaleTimeString('pt-BR')}</span>
                {c.ultima_chamada && <span className="ultima-chamada">Última chamada</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="cartao">
        <h2>Fim do dia</h2>
        <p>Descarta as senhas que ainda estão aguardando ou chamadas sem atendimento.</p>
        <Aviso>{falha}</Aviso>
        {resultado && <p className="sucesso">{resultado}</p>}

        {confirmando ? (
          <div className="confirmacao">
            <p>Tem certeza? Isso não pode ser desfeito.</p>
            <button className="botao botao-perigo" onClick={encerrarExpediente}>
              Sim, encerrar
            </button>
            <button className="botao botao-secundario" onClick={() => setConfirmando(false)}>
              Cancelar
            </button>
          </div>
        ) : (
          <button className="botao botao-perigo" onClick={() => setConfirmando(true)}>
            Encerrar expediente
          </button>
        )}
      </section>
    </main>
  )
}
