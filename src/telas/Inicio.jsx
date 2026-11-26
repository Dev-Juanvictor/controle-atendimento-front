// Tela inicial: só os links para as outras telas
const LINKS = [
  { href: '#/totem', titulo: 'Totem', texto: 'Tablet na entrada: o cliente tira a senha' },
  { href: '#/painel', titulo: 'Painel', texto: 'TV da sala de espera: mostra as chamadas' },
  { href: '#/guiche', titulo: 'Guichê', texto: 'Computador do atendente' },
  { href: '#/gestor', titulo: 'Gestão', texto: 'Acompanhar e encerrar o expediente' },
]

export default function Inicio() {
  return (
    <main className="tela inicio">
      <h1>Controle de Atendimento</h1>
      <p className="subtitulo">Laboratório de Análises Clínicas</p>
      <nav className="inicio-links">
        {LINKS.map((link) => (
          <a key={link.href} className="cartao" href={link.href}>
            <strong>{link.titulo}</strong>
            <span>{link.texto}</span>
          </a>
        ))}
      </nav>
    </main>
  )
}
