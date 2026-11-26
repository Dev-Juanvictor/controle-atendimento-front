// Hooks (funções "use...") usados pelas telas
import { useEffect, useRef, useState } from 'react'

// Chama a função agora e depois a cada "intervalo" milissegundos.
// Devolve o último resultado e o último erro (ou null).
export function useConsultaPeriodica(funcao, intervalo) {
  const [dados, setDados] = useState(null)
  const [erro, setErro] = useState(null)
  const funcaoAtual = useRef(funcao)
  funcaoAtual.current = funcao

  useEffect(() => {
    let ativo = true

    async function consultar() {
      try {
        const resultado = await funcaoAtual.current()
        if (ativo) {
          setDados(resultado)
          setErro(null)
        }
      } catch (e) {
        if (ativo) setErro(e)
      }
    }

    consultar()
    const timer = setInterval(consultar, intervalo)
    return () => {
      ativo = false
      clearInterval(timer)
    }
  }, [intervalo])

  return { dados, erro }
}

// Data/hora atual, atualizada a cada segundo (relógio e cronômetro)
export function useAgora() {
  const [agora, setAgora] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setAgora(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  return agora
}

// Lê a tela pelo endereço: "#/painel" -> "painel"
export function useRota() {
  const ler = () => window.location.hash.replace('#/', '')
  const [rota, setRota] = useState(ler)
  useEffect(() => {
    const aoMudar = () => setRota(ler())
    window.addEventListener('hashchange', aoMudar)
    return () => window.removeEventListener('hashchange', aoMudar)
  }, [])
  return rota
}
