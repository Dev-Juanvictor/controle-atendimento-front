// Som de chamada ("plim-plom") e voz do navegador.
// O navegador só deixa tocar som depois de um clique na página;
// por isso o painel tem o botão "Ativar som das chamadas".

import { TIPOS } from './tipos.js'

let audio = null

export function ativarSom() {
  if (!audio) audio = new AudioContext()
  audio.resume()
}

export function somAtivo() {
  return audio?.state === 'running'
}

// Duas notas curtas, uma depois da outra
export function tocarPlimPlom() {
  if (!somAtivo()) return Promise.resolve()

  const notas = [880, 660] // Hz
  notas.forEach((frequencia, i) => {
    const inicio = audio.currentTime + i * 0.35
    const oscilador = audio.createOscillator()
    const volume = audio.createGain()
    oscilador.frequency.value = frequencia
    volume.gain.setValueAtTime(0.3, inicio)
    volume.gain.exponentialRampToValueAtTime(0.001, inicio + 0.6)
    oscilador.connect(volume).connect(audio.destination)
    oscilador.start(inicio)
    oscilador.stop(inicio + 0.6)
  })
  return new Promise((ok) => setTimeout(ok, 900))
}

// Fala o texto em português. A promessa termina quando acaba de falar.
export function falar(texto) {
  if (!('speechSynthesis' in window)) return Promise.resolve()

  return new Promise((ok) => {
    const fala = new SpeechSynthesisUtterance(texto)
    fala.lang = 'pt-BR'
    fala.onend = ok
    fala.onerror = ok
    speechSynthesis.speak(fala)
  })
}

// "Última chamada. Senha prioritária, número 7. Guichê 3."
export function textoDaChamada(chamada) {
  const inicio = chamada.ultima_chamada ? 'Última chamada. ' : ''
  return `${inicio}Senha ${TIPOS[chamada.tipo].falado}, número ${chamada.sequencial}. Guichê ${chamada.guiche}.`
}
