// Peças reaproveitadas nas telas
import { useAgora } from './ganchos.js'
import { TIPOS } from './tipos.js'

// A senha aparece "dentro" de um tubo de coleta com a tampa na cor do tipo.
// A cor nunca é a única informação: sempre mostra também o nome do tipo.
export function Tubo({ tipo, texto, tamanho = 'm' }) {
  return (
    <div className={`tubo tubo-${tamanho} tipo-${tipo}`}>
      <div className="tubo-tampa" />
      <div className="tubo-corpo">
        <strong className="tubo-texto">{texto}</strong>
        <span className="tubo-tipo">{TIPOS[tipo].nome}</span>
      </div>
    </div>
  )
}

export function Relogio() {
  const agora = useAgora()
  return (
    <span className="relogio">
      {agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
    </span>
  )
}

// Faixa de aviso (erro, sem conexão etc.)
export function Aviso({ children }) {
  if (!children) return null
  return (
    <p className="aviso" role="alert">
      {children}
    </p>
  )
}

export function Voltar() {
  return (
    <a className="voltar" href="#/">
      ← Início
    </a>
  )
}
