# Arquitetura — JARVIS Universal

## Visão geral

O JARVIS Universal é um monorepo hospedado dentro deste repositório, ao lado do
projeto pré-existente ToolScope AI (Next.js na raiz — `src/`, `prisma/`,
`package.json`). Os dois projetos coexistem sem se misturar: o ToolScope
continua servido pelo Next.js na raiz; o JARVIS vive em `apps/`, `packages/`
e `scripts/`.

```
toolscope-ai/
├── src/, prisma/, public/     # ToolScope AI (Next.js) — não tocar
├── apps/
│   ├── web/                   # Frontend JARVIS: React + Vite + TypeScript
│   ├── api/                   # Backend JARVIS: FastAPI (Python)
│   ├── desktop/                # Futuro: empacotamento desktop (Windows). Vazio nesta etapa.
│   └── bridge/                  # Futuro: ponte de controle do Windows (pareamento + allowlist). Vazio nesta etapa.
├── packages/
│   └── shared/                 # Tipos e contratos compartilhados entre web/api
├── scripts/                    # setup.ps1, dev.ps1, test.ps1, build.ps1 (PowerShell, sem admin)
└── docs/                       # Esta pasta
```

## Frontend (`apps/web`)

- React 18 + Vite + TypeScript, componentes funcionais, tipagem estrita.
- ESLint configurado, testes unitários com Vitest + Testing Library.
- Tela inicial: título "JARVIS", estado "Em espera", histórico vazio, campo de
  mensagem, botão Enviar, botão de microfone desabilitado ("disponível em
  breve").
- Em desenvolvimento, consome a API via `/api/*` (proxy do Vite para
  `http://localhost:8000`), sem segredos no navegador.

## Backend (`apps/api`)

- FastAPI (Python 3.11+; recomendado 3.12+), configuração por variáveis de
  ambiente (`pydantic-settings`), logging estruturado (JSON, sem conteúdo
  sensível), tratamento uniforme de erros (handler global retornando JSON
  padronizado).
- Endpoints iniciais:
  - `GET /api/health` — checagem de disponibilidade (pública, mínima).
  - `POST /api/entrar` — troca um token de acesso secreto por uma sessão
    (cookie assinado). Ver `docs/security-model.md`.
  - `GET /api/session` — confirma sessão válida (404 sem sessão).
  - `POST /api/chat` — conversa em streaming (Server-Sent Events),
    protegida por sessão, cancelável pelo cliente a qualquer momento.
  - `GET /api/chat/status` — informa o provedor configurado (protegida).
- **Camada de provedores de chat** (`app/providers/`): interface
  `ChatProvider` tipada (`stream(message) -> AsyncIterator[str]`) com três
  adaptadores plugáveis por `JARVIS_CHAT_PROVIDER`:
  - `mock` (padrão) — respostas simples em pt-BR, sem chamada externa,
    funcional offline.
  - `anthropic` — chama a API de Mensagens da Anthropic via `httpx`
    (streaming), somente a partir do servidor; exige `JARVIS_MODEL` e
    `JARVIS_ANTHROPIC_API_KEY` (nenhum modelo fixo no código).
  - `local` — fala com um servidor local compatível com o formato de
    streaming da OpenAI (`JARVIS_LOCAL_PROVIDER_URL`), sem presumir que
    esteja instalado.
  Timeout, número de tentativas e concorrência máxima por provedor são
  configuráveis; um limite diário de mensagens (`JARVIS_DAILY_MESSAGE_LIMIT`)
  se aplica só a `anthropic`/`local` — o Mock nunca é limitado. Se um
  provedor opcional estiver mal configurado ou falhar, a resposta é um
  evento de erro amigável (nunca um erro genérico do servidor), e a
  interface permite voltar ao Mock nas configurações.
- CORS restrito a origens explícitas de desenvolvimento (nunca curinga com
  credenciais).
- Acesso: sem login/senha — um link secreto (`/entrar/<token>`) autentica o
  dispositivo via cookie de sessão assinado. Sem sessão válida, rotas
  protegidas respondem como se não existissem (404 genérico). Detalhes
  completos em `docs/security-model.md`.

## Integração e produção

- Desenvolvimento: dois processos (`vite` em `apps/web`, `uvicorn` em
  `apps/api`), comunicando-se por HTTP local. O Vite faz proxy de `/api` para
  a API, evitando problemas de CORS e mantendo qualquer segredo apenas no
  servidor.
- Produção (preparado, não implementado nesta etapa): o FastAPI pode servir o
  build estático de `apps/web/dist` no mesmo domínio, eliminando CORS entre
  frontend e backend. Isso será ativado por configuração quando o deploy for
  autorizado pelo usuário (Regra 10).

## Limites técnicos desta etapa

- **Escuta em segundo plano**: o celular/navegador **não** ficará ouvindo o
  microfone permanentemente em segundo plano. Captura de voz será sempre
  iniciada por ação explícita do usuário (toque no botão de microfone), nunca
  automática ou persistente. O botão de microfone está desabilitado nesta
  etapa ("disponível em breve") até que essa interação explícita esteja
  implementada e testada.
- **Controle remoto do Windows**: `apps/bridge` (a ponte que executaria ações
  no Windows) só será implementada com (a) pareamento explícito entre
  dispositivo cliente e o computador, e (b) lista de permissões (allowlist)
  de ações e aplicativos autorizados. Nenhuma ação arbitrária será aceita.
  Nesta etapa o diretório existe apenas como placeholder documentado — sem
  código de execução.
- **Sem modo de ignorar permissões ou admin**: nenhum script ou processo desta
  etapa solicita privilégios elevados.
- **Segredos**: chaves/segredos vivem somente em variáveis de ambiente do
  servidor (`apps/api`), nunca no frontend, logs, ou exemplos reais. Veja
  `docs/security-model.md`.

## Ferramentas e ambiente verificados nesta etapa

Ver relatório da sessão para as versões exatas encontradas. Resumo dos
requisitos:

- Git — necessário para versionamento.
- Node.js LTS ativo + npm — para `apps/web`.
- Python 3.12+ — para `apps/api` (se a versão disponível for menor, os scripts
  devem falhar com mensagem clara em vez de seguir silenciosamente).
- PowerShell — para os scripts em `scripts/` (uso no Windows do usuário).
