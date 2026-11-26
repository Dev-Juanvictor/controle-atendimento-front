// Escolhe a tela pelo endereço (#/totem, #/painel, #/guiche, #/gestor).
// O "#" deixa trocar de tela sem precisar configurar nada no servidor.
import { useRota } from './ganchos.js'
import Gestor from './telas/Gestor.jsx'
import Guiche from './telas/Guiche.jsx'
import Inicio from './telas/Inicio.jsx'
import Painel from './telas/Painel.jsx'
import Totem from './telas/Totem.jsx'

const TELAS = {
  totem: Totem,
  painel: Painel,
  guiche: Guiche,
  gestor: Gestor,
}

export default function App() {
  const rota = useRota()
  const Tela = TELAS[rota] ?? Inicio
  return <Tela />
}
