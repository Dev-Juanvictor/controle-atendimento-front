// Totem: o cliente escolhe o tipo e recebe a senha. Não tem login.
import { useEffect, useState } from 'react'

import { api } from '../api.js'
import { Aviso, Tubo, Voltar } from '../componentes.jsx'
import { falar } from '../som.js'
import { ORDEM_TIPOS, TIPOS, rotulo, sequencialDoNumero } from '../tipos.js'

const SEGUNDOS_PARA_VOLTAR = 12

export default function Totem() {
  const [senha, setSenha] = useState(null)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Depois de alguns segundos mostrando a senha, volta para os botões
  useEffect(() => {
    if (!senha) return
    const timer = setTimeout(() => setSenha(null), SEGUNDOS_PARA_VOLTAR * 1000)
    return () => clearTimeout(timer)
  }, [senha])

  async function emitir(tipo) {
    setEnviando(true)
    setErro('')
    try {
      const emitida = await api.emitirSenha(tipo)
      setSenha(emitida)
      const numero = sequencialDoNumero(emitida.numero)
      falar(`Sua senha é ${TIPOS[tipo].falado}, número ${numero}. Aguarde a chamada no painel.`)
    } catch (e) {
      setErro(e.message)
    } finally {
      setEnviando(false)
    }
  }

  if (senha) {
    return (
      <main className="tela totem">
        <h1>Sua senha</h1>
        <div aria-live="polite">
          <Tubo tipo={senha.tipo} texto={rotulo(senha.tipo, sequencialDoNumero(senha.numero))} tamanho="g" />
          <p className="totem-numero">{senha.numero}</p>
        </div>
        <p>Aguarde a chamada no painel.</p>
        <button className="botao" onClick={() => setSenha(null)}>
          Concluir
        </button>
      </main>
    )
  }

  return (
    <main className="tela totem">
      <Voltar />
      <h1>Toque no tipo de atendimento</h1>
      <Aviso>{erro}</Aviso>
      <div className="totem-botoes">
        {ORDEM_TIPOS.map((tipo) => (
          <button
            key={tipo}
            className={`totem-botao tipo-${tipo}`}
            disabled={enviando}
            onClick={() => emitir(tipo)}
          >
            <strong>{TIPOS[tipo].nome}</strong>
            <span>{TIPOS[tipo].descricao}</span>
          </button>
        ))}
      </div>
    </main>
  )
}
