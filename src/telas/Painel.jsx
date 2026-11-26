// Painel da sala de espera: mostra as últimas 5 senhas chamadas.
// Nunca mostra a PRÓXIMA senha (regra do requisito).
import { useEffect, useRef, useState } from 'react'

import { api } from '../api.js'
import { Aviso, Relogio, Tubo } from '../componentes.jsx'
import { useConsultaPeriodica } from '../ganchos.js'
import { ativarSom, falar, somAtivo, textoDaChamada, tocarPlimPlom } from '../som.js'
import { rotulo } from '../tipos.js'

const CHAVE_GUARDADA = 'painel-ultimas-chamadas'

// Cada chamada vira uma "chave". A 2ª chamada da mesma senha tem outra chave,
// por isso ela também é anunciada.
const chaveDe = (chamada) => `${chamada.numero}-${chamada.ultima_chamada}`

function lerGuardadas() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_GUARDADA)) ?? []
  } catch {
    return []
  }
}

export default function Painel() {
  const { dados, erro } = useConsultaPeriodica(api.painel, 2000)
  const [somLigado, setSomLigado] = useState(somAtivo())

  const vistas = useRef(null) // chaves que já foram anunciadas
  const filaDeAnuncios = useRef([])
  const anunciando = useRef(false)

  // Se a API cair, mostra a última lista que foi guardada no navegador
  const chamadas = dados ? dados.ultimas_chamadas : lerGuardadas()

  useEffect(() => {
    if (!dados) return
    const lista = dados.ultimas_chamadas
    localStorage.setItem(CHAVE_GUARDADA, JSON.stringify(lista))

    // Primeira busca: só marca tudo como visto, sem anunciar
    if (vistas.current === null) {
      vistas.current = new Set(lista.map(chaveDe))
      return
    }

    // A lista vem da mais nova para a mais antiga; anuncia na ordem em que aconteceu
    const novas = lista.filter((c) => !vistas.current.has(chaveDe(c))).reverse()
    novas.forEach((c) => {
      vistas.current.add(chaveDe(c))
      filaDeAnuncios.current.push(c)
    })
    anunciarFila()
  }, [dados])

  // Fala uma chamada por vez
  async function anunciarFila() {
    if (anunciando.current) return
    anunciando.current = true
    while (filaDeAnuncios.current.length > 0) {
      const chamada = filaDeAnuncios.current.shift()
      if (somAtivo()) {
        await tocarPlimPlom()
        await falar(textoDaChamada(chamada))
      }
    }
    anunciando.current = false
  }

  function ligarSom() {
    ativarSom()
    setSomLigado(true)
  }

  const [atual, ...anteriores] = chamadas

  return (
    <main className="tela painel">
      <header className="painel-topo">
        <h1>Senhas chamadas</h1>
        <Relogio />
      </header>

      {erro && <Aviso>Sistema fora do ar. Mostrando as últimas chamadas guardadas.</Aviso>}

      {!somLigado && (
        <button className="botao botao-secundario" onClick={ligarSom}>
          Ativar som das chamadas
        </button>
      )}

      <section className="painel-atual" aria-live="assertive">
        {atual ? (
          <>
            {atual.ultima_chamada && <p className="ultima-chamada">Última chamada</p>}
            <Tubo tipo={atual.tipo} texto={rotulo(atual.tipo, atual.sequencial)} tamanho="g" />
            <p className="painel-guiche">
              Guichê <strong>{atual.guiche}</strong>
            </p>
          </>
        ) : (
          <p className="vazio">Nenhuma senha chamada ainda.</p>
        )}
      </section>

      {anteriores.length > 0 && (
        <section className="painel-anteriores">
          <h2>Anteriores</h2>
          <ul>
            {anteriores.map((c) => (
              <li key={chaveDe(c)}>
                <Tubo tipo={c.tipo} texto={rotulo(c.tipo, c.sequencial)} tamanho="p" />
                <span>Guichê {c.guiche}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
