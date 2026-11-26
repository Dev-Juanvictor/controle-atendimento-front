// Aba "Acompanhamento": últimas chamadas e encerramento do expediente
import { useState } from 'react'

import { api } from '../../api.js'
import { Aviso, Tubo } from '../../componentes.jsx'
import { useConsultaPeriodica } from '../../ganchos.js'
import { rotulo } from '../../tipos.js'

export default function Acompanhamento({ onSair }) {
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
    <>
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
    </>
  )
}
