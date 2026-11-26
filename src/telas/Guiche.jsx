// Tela do atendente: chamar, chamar novamente, iniciar e encerrar atendimento
import { useEffect, useRef, useState } from 'react'

import { api, lerSessao, sair } from '../api.js'
import { Aviso, Relogio, Tubo } from '../componentes.jsx'
import { useAgora } from '../ganchos.js'
import { TIPOS, rotulo } from '../tipos.js'
import Login from './Login.jsx'

export default function Guiche() {
  const [sessao, setSessao] = useState(lerSessao)

  if (!sessao?.guicheId) {
    return <Login onEntrar={() => setSessao(lerSessao())} />
  }

  function sairDoGuiche() {
    sair()
    setSessao(null)
  }

  return <Atendimento sessao={sessao} onSair={sairDoGuiche} />
}

// Quais botões mostrar em cada situação do guichê.
// Assim o atendente nunca vê um botão que daria erro naquele momento.
function acoesPara(estado) {
  switch (estado) {
    case 'CHAMADA':
      return [
        { acao: 'iniciar', texto: 'Cliente chegou: iniciar', tecla: 'I' },
        { acao: 'chamarNovamente', texto: 'Chamar novamente', tecla: 'N' },
      ]
    case 'CHAMADA_NOVAMENTE':
      return [
        { acao: 'iniciar', texto: 'Cliente chegou: iniciar', tecla: 'I' },
        { acao: 'chamarProxima', texto: 'Não compareceu: chamar próxima', tecla: 'P' },
      ]
    case 'EM_ATENDIMENTO':
      return [{ acao: 'encerrar', texto: 'Encerrar atendimento', tecla: 'E' }]
    default: // guichê livre
      return [{ acao: 'chamarProxima', texto: 'Chamar próxima senha', tecla: 'P' }]
  }
}

const ESTADOS_NO_GUICHE = ['CHAMADA', 'CHAMADA_NOVAMENTE', 'EM_ATENDIMENTO']

const DESCRICAO_ESTADO = {
  CHAMADA: 'Chamada. Aguardando o cliente.',
  CHAMADA_NOVAMENTE: 'Última chamada. Aguardando o cliente.',
  EM_ATENDIMENTO: 'Em atendimento.',
}

function Atendimento({ sessao, onSair }) {
  const [senha, setSenha] = useState(null)
  const [mensagem, setMensagem] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [desde, setDesde] = useState(() => new Date())
  const agora = useAgora()

  const acoes = acoesPara(senha?.estado)

  // Ao abrir a tela, pergunta à API se já tem senha neste guichê
  useEffect(() => {
    api.senhaAtual().then(setSenha).catch((e) => setMensagem(e.message))
  }, [])

  // Cronômetro: zera sempre que a senha ou o estado mudam
  useEffect(() => {
    setDesde(new Date())
  }, [senha?.numero, senha?.estado])

  async function executar(acao) {
    setOcupado(true)
    setMensagem('')
    try {
      const resultado = await api[acao]()
      // Senha atendida sai do guichê
      setSenha(ESTADOS_NO_GUICHE.includes(resultado.estado) ? resultado : null)
    } catch (e) {
      if (e.status === 401) return onSair()
      setMensagem(e.message)
      // Algo mudou no servidor (ex.: fila vazia depois de um "não compareceu"): atualiza
      api.senhaAtual().then(setSenha).catch(() => {})
    } finally {
      setOcupado(false)
    }
  }

  // Atalhos de teclado: P, N, I, E
  const executarRef = useRef(executar)
  executarRef.current = executar
  useEffect(() => {
    function aoApertar(evento) {
      if (ocupado || evento.ctrlKey || evento.altKey || evento.metaKey) return
      const encontrada = acoes.find((a) => a.tecla === evento.key.toUpperCase())
      if (encontrada) executarRef.current(encontrada.acao)
    }
    window.addEventListener('keydown', aoApertar)
    return () => window.removeEventListener('keydown', aoApertar)
  }, [acoes, ocupado])

  const segundos = Math.max(0, Math.floor((agora - desde) / 1000))
  const cronometro = `${String(Math.floor(segundos / 60)).padStart(2, '0')}:${String(segundos % 60).padStart(2, '0')}`

  return (
    <main className="tela guiche">
      <header className="guiche-topo">
        <div>
          <h1>Guichê {sessao.guicheId}</h1>
          <span>{sessao.usuario.nome}</span>
        </div>
        <Relogio />
        <button className="botao botao-secundario" onClick={onSair}>
          Sair
        </button>
      </header>

      <Aviso>{mensagem}</Aviso>

      <section className="guiche-senha" aria-live="polite">
        {senha ? (
          <>
            <Tubo tipo={senha.tipo} texto={rotulo(senha.tipo, senha.sequencial)} tamanho="g" />
            <p>{DESCRICAO_ESTADO[senha.estado]}</p>
            <p className="cronometro">{cronometro}</p>
            {senha.estado === 'EM_ATENDIMENTO' && (
              <p className="dica">Tempo médio deste tipo: {TIPOS[senha.tipo].tempoMedio}</p>
            )}
          </>
        ) : (
          <p className="vazio">Guichê livre.</p>
        )}
      </section>

      <div className="guiche-acoes">
        {acoes.map((a, i) => (
          <button
            key={a.acao}
            className={i === 0 ? 'botao' : 'botao botao-secundario'}
            disabled={ocupado}
            onClick={() => executar(a.acao)}
          >
            {a.texto} <kbd>{a.tecla}</kbd>
          </button>
        ))}
      </div>
    </main>
  )
}
