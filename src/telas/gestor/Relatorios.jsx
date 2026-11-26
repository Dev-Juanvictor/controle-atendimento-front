// Aba "Relatórios": relatório diário ou mensal, indicadores, auditoria e simulação de um dia
import { useState } from 'react'

import { api } from '../../api.js'
import { Aviso } from '../../componentes.jsx'
import { TIPOS } from '../../tipos.js'

// Datas no horário do computador (toISOString usaria UTC e erraria o dia à noite)
const doisDigitos = (n) => String(n).padStart(2, '0')
const dataLocal = (d) => `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`
const hoje = () => dataLocal(new Date())
const ontem = () => dataLocal(new Date(Date.now() - 24 * 60 * 60 * 1000))

const dataHora = (valor) => (valor ? new Date(valor).toLocaleString('pt-BR') : '')
const minutos = (valor) => (valor == null ? '-' : `${valor.toLocaleString('pt-BR')} min`)

export default function Relatorios({ onSair }) {
  const [periodo, setPeriodo] = useState('diario')
  const [dia, setDia] = useState(hoje)
  const [mes, setMes] = useState(() => hoje().slice(0, 7))
  const [relatorio, setRelatorio] = useState(null)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function gerar(tipo = periodo, data = dia) {
    setCarregando(true)
    setErro('')
    try {
      if (tipo === 'diario') {
        setRelatorio(await api.relatorioDiario(data))
      } else {
        const [ano, numeroMes] = mes.split('-')
        setRelatorio(await api.relatorioMensal(Number(ano), Number(numeroMes)))
      }
    } catch (e) {
      if (e.status === 401) return onSair()
      setErro(e.message)
    } finally {
      setCarregando(false)
    }
  }

  // Depois de simular um dia, já mostra o relatório daquele dia
  function mostrarDia(data) {
    setPeriodo('diario')
    setDia(data)
    gerar('diario', data)
  }

  return (
    <>
      <section className="cartao filtros nao-imprimir">
        <label>
          Período
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
            <option value="diario">Diário</option>
            <option value="mensal">Mensal</option>
          </select>
        </label>
        {periodo === 'diario' ? (
          <label>
            Dia
            <input type="date" value={dia} onChange={(e) => setDia(e.target.value)} />
          </label>
        ) : (
          <label>
            Mês
            <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} />
          </label>
        )}
        <button className="botao" onClick={() => gerar()} disabled={carregando}>
          {carregando ? 'Gerando...' : 'Gerar relatório'}
        </button>
        {relatorio && (
          <button className="botao botao-secundario" onClick={() => window.print()}>
            Imprimir
          </button>
        )}
      </section>

      <Aviso>{erro}</Aviso>

      {relatorio && <Relatorio r={relatorio} />}

      <Simulacao onSimulado={mostrarDia} onSair={onSair} />
    </>
  )
}

function Relatorio({ r }) {
  const titulo =
    r.inicio === r.fim
      ? `Relatório do dia ${new Date(`${r.inicio}T12:00`).toLocaleDateString('pt-BR')}`
      : `Relatório de ${new Date(`${r.inicio}T12:00`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`
  const ind = r.indicadores

  return (
    <>
      <h2>{titulo}</h2>

      <section className="numeros">
        <Numero titulo="Emitidas" valor={r.emitidas} />
        <Numero titulo="Atendidas" valor={r.atendidas} />
        <Numero titulo="Não compareceram" valor={r.nao_compareceram} />
        <Numero titulo="Descartadas no fim do dia" valor={r.descartadas_fim_expediente} />
      </section>

      <section className="cartao">
        <h3>Por tipo de senha</h3>
        <table className="tabela">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Emitidas</th>
              <th>Atendidas</th>
              <th>Tempo médio (TM)</th>
            </tr>
          </thead>
          <tbody>
            {r.por_tipo.map((t) => (
              <tr key={t.tipo}>
                <td>
                  {t.tipo} ({TIPOS[t.tipo].nome})
                </td>
                <td>{t.emitidas}</td>
                <td>{t.atendidas}</td>
                <td>{minutos(t.tm_minutos)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="cartao">
        <h3>Indicadores de desempenho</h3>
        <ul className="indicadores">
          <li>
            Espera média até a 1ª chamada: <strong>{minutos(ind.tempo_medio_espera_minutos)}</strong>
          </li>
          <li>
            Duração média do atendimento: <strong>{minutos(ind.tempo_medio_atendimento_minutos)}</strong>
          </li>
          <li>
            Senhas atendidas: <strong>{ind.taxa_atendimento_percentual.toLocaleString('pt-BR')}%</strong>
          </li>
          <li>
            Não comparecimento: <strong>{ind.taxa_nao_comparecimento_percentual.toLocaleString('pt-BR')}%</strong>
          </li>
        </ul>
        <div className="duas-colunas">
          <Desempenho titulo="Por guichê" itens={ind.por_guiche} />
          <Desempenho titulo="Por atendente" itens={ind.por_atendente} />
        </div>
      </section>

      <section className="cartao">
        <h3>Relatório detalhado ({r.senhas.length} senhas)</h3>
        <div className="rolagem">
          <table className="tabela">
            <thead>
              <tr>
                <th>Senha</th>
                <th>Tipo</th>
                <th>Emissão</th>
                <th>Atendimento</th>
                <th>Guichê</th>
              </tr>
            </thead>
            <tbody>
              {r.senhas.map((s) => (
                <tr key={s.numero}>
                  <td>{s.numero}</td>
                  <td>{s.tipo}</td>
                  <td>{dataHora(s.emitida_em)}</td>
                  <td>{dataHora(s.atendida_em)}</td>
                  <td>{s.guiche ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="cartao">
        <h3>Auditoria ({r.auditoria.length} chamadas)</h3>
        <div className="rolagem">
          <table className="tabela">
            <thead>
              <tr>
                <th>Senha</th>
                <th>Atendente</th>
                <th>Guichê</th>
                <th>1ª chamada</th>
                <th>2ª chamada</th>
                <th>Início</th>
                <th>Fim</th>
              </tr>
            </thead>
            <tbody>
              {r.auditoria.map((a) => (
                <tr key={a.numero}>
                  <td>{a.numero}</td>
                  <td>{a.atendente}</td>
                  <td>{a.guiche}</td>
                  <td>{dataHora(a.primeira_chamada)}</td>
                  <td>{dataHora(a.segunda_chamada)}</td>
                  <td>{dataHora(a.inicio_atendimento)}</td>
                  <td>{dataHora(a.fim_atendimento)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

function Numero({ titulo, valor }) {
  return (
    <div className="cartao numero">
      <span>{titulo}</span>
      <strong>{valor}</strong>
    </div>
  )
}

function Desempenho({ titulo, itens }) {
  return (
    <div>
      <h4>{titulo}</h4>
      {itens.length === 0 ? (
        <p className="vazio">Sem atendimentos.</p>
      ) : (
        <table className="tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Atendimentos</th>
              <th>TM</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((i) => (
              <tr key={i.nome}>
                <td>{i.nome}</td>
                <td>{i.atendimentos}</td>
                <td>{minutos(i.tm_minutos)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// Gera um dia inteiro de atendimentos com o TM sorteado e ~5% de clientes que vão embora
function Simulacao({ onSimulado, onSair }) {
  const [dia, setDia] = useState(ontem)
  const [quantidade, setQuantidade] = useState(150)
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [simulando, setSimulando] = useState(false)

  async function simular(evento) {
    evento.preventDefault()
    setSimulando(true)
    setErro('')
    setMensagem('')
    try {
      const r = await api.simularDia(dia, Number(quantidade))
      setMensagem(
        `Simulado: ${r.emitidas} emitidas, ${r.atendidas} atendidas, ` +
          `${r.nao_compareceram} não compareceram, ${r.descartadas_fim_expediente} descartadas.`,
      )
      onSimulado(dia)
    } catch (e) {
      if (e.status === 401) return onSair()
      setErro(e.message)
    } finally {
      setSimulando(false)
    }
  }

  return (
    <section className="cartao nao-imprimir">
      <h3>Simular um dia de atendimento</h3>
      <p className="dica">
        Gera senhas num dia que já passou, com o tempo de atendimento sorteado (SP 15±5 min, SG 5±3 min, SE 1 ou 5
        min) e cerca de 5% de clientes que não comparecem. Serve para testar os relatórios.
      </p>
      <form className="filtros" onSubmit={simular}>
        <label>
          Dia
          <input type="date" value={dia} max={ontem()} onChange={(e) => setDia(e.target.value)} required />
        </label>
        <label>
          Quantidade de senhas
          <input
            type="number"
            min="1"
            max="600"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            required
          />
        </label>
        <button className="botao botao-secundario" disabled={simulando}>
          {simulando ? 'Simulando...' : 'Simular dia'}
        </button>
      </form>
      <Aviso>{erro}</Aviso>
      {mensagem && <p className="sucesso">{mensagem}</p>}
    </section>
  )
}
