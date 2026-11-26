// Todas as chamadas à API passam por aqui.
// O endereço começa com /api/v1 e o Vite repassa para a API (ver vite.config.js).

const BASE = '/api/v1'
const CHAVE_SESSAO = 'sessao'

// Erro padronizado da API: {"erro": {"codigo": "FILA_VAZIA", "mensagem": "..."}}
export class ErroApi extends Error {
  constructor(status, codigo, mensagem) {
    super(mensagem)
    this.status = status
    this.codigo = codigo
  }
}

// ---------- Sessão (login) ----------
// Fica no sessionStorage, que é separado por aba:
// dá para abrir o guichê 1 e o guichê 2 no mesmo computador.

export function lerSessao() {
  const texto = sessionStorage.getItem(CHAVE_SESSAO)
  return texto ? JSON.parse(texto) : null
}

function salvarSessao(sessao) {
  sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao))
}

export function sair() {
  sessionStorage.removeItem(CHAVE_SESSAO)
}

// ---------- Requisição ----------

async function requisicao(metodo, caminho, corpo) {
  const cabecalhos = { 'Content-Type': 'application/json' }
  const sessao = lerSessao()
  if (sessao) cabecalhos.Authorization = `Bearer ${sessao.token}`

  let resposta
  try {
    resposta = await fetch(BASE + caminho, {
      method: metodo,
      headers: cabecalhos,
      body: corpo ? JSON.stringify(corpo) : undefined,
    })
  } catch {
    throw new ErroApi(0, 'SEM_CONEXAO', 'Sem conexão com o sistema.')
  }

  const dados = await resposta.json().catch(() => null)

  if (!resposta.ok) {
    const erro = dados?.erro
    if (!erro) {
      // Sem o formato padrão da API: normalmente é a API desligada.
      throw new ErroApi(resposta.status, 'SEM_CONEXAO', 'Sem conexão com o sistema.')
    }
    if (resposta.status === 401 && sessao) sair() // token venceu: volta para o login
    throw new ErroApi(resposta.status, erro.codigo, erro.mensagem)
  }
  return dados
}

// ---------- Endpoints ----------

export const api = {
  emitirSenha: (tipo) => requisicao('POST', '/senhas', { tipo }),
  painel: () => requisicao('GET', '/painel'),

  async login(login, senha, guicheId) {
    const dados = await requisicao('POST', '/auth/login', { login, senha, guiche_id: guicheId })
    salvarSessao({ token: dados.access_token, usuario: dados.usuario, guicheId: dados.guiche_id })
    return dados
  },

  // Senha que está no meu guichê, ou null se o guichê está livre
  async senhaAtual() {
    try {
      return await requisicao('GET', '/atendimentos/atual')
    } catch (erro) {
      if (erro.status === 404) return null
      throw erro
    }
  },

  chamarProxima: () => requisicao('POST', '/atendimentos/chamar-proxima'),
  chamarNovamente: () => requisicao('POST', '/atendimentos/chamar-novamente'),
  iniciar: () => requisicao('POST', '/atendimentos/iniciar'),
  encerrar: () => requisicao('POST', '/atendimentos/encerrar'),
  encerrarExpediente: () => requisicao('POST', '/expediente/encerrar'),
}
