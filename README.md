# Controle de Atendimento: Laboratório de Análises Clínicas (Front End)

Projeto final da disciplina **Front End** (UNINASSAU, 2026.2, Prof. João Ferreira).
Telas do sistema de senhas: totem, painel, guichê e gestão. Usa a API do projeto
`controle-atendimento` (back end).

**Equipe:** _(preencher: nome e matrícula de cada integrante)_

Back end (API): repositório `controle-atendimento` _(colocar o link)_.

## Tecnologias

- React 19 + Vite
- Fonte Atkinson Hyperlegible Next (para baixa visão), instalada pelo npm

## Telas

| Endereço | Tela | Para quem |
|---|---|---|
| `#/totem` | Totem | Cliente tira a senha (sem login) |
| `#/painel` | Painel | TV da sala de espera: últimas 5 chamadas, som e voz |
| `#/guiche` | Guichê | Atendente: chamar, chamar novamente, iniciar, encerrar (atalhos P, N, I, E) |
| `#/gestor` | Gestão | Gestor: acompanhamento, relatórios (diário/mensal, TM, auditoria, indicadores), simulação de um dia, cadastros e registro de acesso |

Cores das senhas (tampas dos tubos de coleta): **SP** roxa, **SE** dourada, **SG** azul.

---

## Como rodar tudo (Windows / PowerShell)

São três coisas ligadas ao mesmo tempo: o **banco (MySQL no Docker)**, a **API** e o **front**.

### Instale uma vez

- Python 3.12 ou mais novo (marque "Add Python to PATH")
- Node.js 22 LTS
- Docker Desktop
- Git

As duas pastas devem ficar lado a lado:

```
Documentos/
├── controle-atendimento/        (back end)
└── controle-atendimento-front/  (front end)
```

### 1. Abra o Docker Desktop

Espere aparecer **"Engine running"** no canto de baixo.

### 2. Terminal 1: banco e API

```powershell
cd controle-atendimento
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python -c "import secrets; print(secrets.token_hex(32))"
```

Abra o `.env` e:
1. cole a chave gerada em `JWT_SECRET=`
2. se for demonstrar fora do horário (7h às 17h), coloque `IGNORAR_EXPEDIENTE=true`

Depois suba o banco e a API:

```powershell
docker compose up -d mysql
uvicorn app.main:app --reload --app-dir src
```

Espere aparecer `Application startup complete`. Deixe esse terminal aberto.
Teste: http://localhost:8000/docs

> Da segunda vez em diante, só precisa de:
> `.\.venv\Scripts\Activate.ps1`, `docker compose up -d mysql` e o `uvicorn`.

### 3. Terminal 2: front

Abra **outro** terminal (o primeiro continua rodando a API):

```powershell
cd controle-atendimento-front
npm install
Copy-Item .env.example .env
npm run dev
```

Abra **http://localhost:5173**.

> Da segunda vez em diante, só precisa de `npm run dev`.

### 4. Usar

| Login | Senha | Uso |
|---|---|---|
| `atendente1` | `atendente123` | Guichê (escolha o número do guichê no login) |
| `gestor` | `gestor123` | Gestão |

Para testar o fluxo inteiro, abra cada tela numa aba:
1. **Totem**: tire algumas senhas (SP, SE, SG).
2. **Painel**: clique em "Ativar som das chamadas".
3. **Guichê**: entre como `atendente1`, chame a próxima, inicie e encerre.
4. **Gestão**: entre como `gestor` e veja as chamadas.

Para usar dois guichês ao mesmo tempo, abra o guichê em outra aba e entre com `atendente2`
(o login fica salvo por aba).

Para ver os relatórios com bastante dado: em **Gestão → Relatórios**, use **Simular um dia**
(escolha um dia que já passou). O relatório daquele dia aparece em seguida.

---

## Problemas comuns

| O que aparece | Solução |
|---|---|
| "Sem conexão com o sistema" | A API não está rodando: confira o terminal 1 |
| `FORA_DO_EXPEDIENTE` / "Fora do expediente" | `IGNORAR_EXPEDIENTE=true` no `.env` do back end e reinicie a API |
| `docker` não é reconhecido | Abra o Docker Desktop; se acabou de instalar, feche e abra o VS Code |
| `Can't connect to MySQL` | O banco ainda está subindo: espere uns 30 s e rode o `uvicorn` de novo |
| "execução de scripts foi desabilitada" | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| `npm` não é reconhecido | Instale o Node.js e abra o terminal de novo |
| O painel não faz som | Clique em "Ativar som das chamadas" (o navegador exige um clique) |
| Quero zerar o banco | No back end: `docker compose down -v` e depois `docker compose up -d mysql` |

---

## Organização do código

```
src/
├── main.jsx          ponto de partida: carrega fonte e estilos e desenha o App
├── App.jsx           escolhe a tela pelo endereço (#/totem, #/painel...)
├── api.js            todas as chamadas à API (token, erros, sem conexão)
├── tipos.js          nomes e textos de SP, SE e SG; rotulo("SP", 7) -> "SP 007"
├── som.js            "plim-plom" (Web Audio) e voz (Speech Synthesis)
├── ganchos.js        hooks: useConsultaPeriodica, useAgora, useRota
├── componentes.jsx   Tubo, Relogio, Aviso, Voltar
├── estilos.css       cores e layout de todas as telas
└── telas/            Inicio, Totem, Painel, Login, Guiche, Gestor
    └── gestor/       abas da gestão: Acompanhamento, Relatorios, Cadastros
```

**Como o front fala com a API:** o Vite repassa (proxy) tudo que começa com `/api` para
`http://localhost:8000` (ver `vite.config.js`). Para o navegador é tudo o mesmo endereço,
então a API não precisa liberar CORS.

**Como o painel descobre uma chamada nova:** busca `GET /painel` a cada 2 segundos. Na primeira
busca só guarda o que já existe; nas próximas, o que for novo entra numa fila e é anunciado
(som + voz), um de cada vez. A lista fica guardada no navegador: se a API cair, o painel
continua mostrando as últimas senhas.

**Como o guichê decide os botões:** a função `acoesPara(estado)` em `Guiche.jsx` mostra só as
ações que fazem sentido naquele momento (ex.: com a senha em atendimento, só "Encerrar").

---

## Acessibilidade

- Áudio da chamada no painel (tipo, número e guichê), com "Última chamada" na 2ª vez
- Fonte para baixa visão, números grandes e alto contraste
- A cor do tipo sempre vem com o nome escrito (a cor nunca é a única informação)
- Avisos lidos pelo leitor de tela (`aria-live`), campos com rótulo, foco visível
- Atalhos de teclado no guichê (P, N, I, E)
- Sem animações para quem pede "reduzir movimento" no sistema

O GitHub confere a compilação a cada `push` (aba **Actions**, arquivo `.github/workflows/ci.yml`).

## Uso de IA generativa

Usamos o Claude (Anthropic) como ferramenta de apoio na estrutura das telas, no código e na
documentação. Todo o código foi revisado e testado pela equipe, e cada integrante sabe
explicar as partes do projeto.
