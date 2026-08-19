# Modelo de segurança — JARVIS Universal

Este documento resume as regras permanentes de segurança do projeto e como
elas se traduzem em decisões técnicas.

## Princípios

1. **Sem execução dinâmica de conteúdo gerado por IA.** Nenhuma resposta do
   modelo (ou do provedor Mock) é executada como shell, PowerShell, SQL,
   JavaScript ou qualquer código dinâmico. Texto do assistente é sempre
   tratado como dado de exibição, nunca como instrução executável.
2. **Lista fixa de ferramentas tipadas.** Qualquer ação do sistema (hoje:
   nenhuma além de responder mensagens) deve ser implementada como uma função
   tipada e validada no backend, nunca como interpretação livre de texto.
   Ações futuras (ex.: controle do Windows) seguirão o mesmo padrão, com
   schema de argumentos validado (Pydantic) antes de qualquer execução.
3. **Confirmação explícita para ações sensíveis.** Qualquer ação externa ou
   irreversível (arquivos, processos, rede, controle remoto) exige uma etapa
   de confirmação visível ao usuário antes de executar. Nada disso está
   implementado nesta etapa — é um requisito de design para quando existir.
4. **Segredos apenas no servidor.** Chaves de API, tokens e credenciais vivem
   somente em variáveis de ambiente do processo `apps/api`, carregadas via
   `pydantic-settings`. Nunca em código-fonte, nunca em `apps/web`, nunca em
   logs, nunca em exemplos reais dentro do repositório. `.env` está no
   `.gitignore`; apenas `.env.example` com valores fictícios é versionado.
5. **CORS restrito.** Em desenvolvimento, apenas as origens explícitas do
   Vite (`http://localhost:5173` etc.) são permitidas, sem curinga (`*`)
   combinado com credenciais.
6. **Logs sem conteúdo sensível.** Logs estruturados registram metadados
   (rota, status, latência, id de requisição) e nunca o corpo de mensagens do
   usuário nem segredos.
7. **Sem modo de ignorar permissões, sem admin, sem comandos destrutivos.**
   Nenhum script (`scripts/*.ps1`) requer elevação. Todos falham com
   mensagem clara em vez de tentar contornar uma permissão ausente.
8. **Escopo de arquivos.** Todo processo do JARVIS lê/escreve apenas dentro
   desta pasta do projeto (ambiente virtual local do Python em
   `apps/api/.venv`, dependências Node em `apps/web/node_modules`).
9. **Escuta e visão sob autorização explícita.** Microfone e câmera nunca são
   ativados automaticamente ou em segundo plano; toda captura é iniciada por
   uma ação explícita do usuário e sinalizada visualmente enquanto ativa.
10. **Controle remoto do Windows apenas pareado e restrito.** Quando
    implementado, `apps/bridge` exigirá pareamento explícito do dispositivo e
    operará apenas sobre uma lista de permissões (allowlist) de ações e
    aplicativos — nunca execução arbitrária.
11. **Cache do service worker (PWA) é só o shell.** O service worker de
    `apps/web` (`vite-plugin-pwa`, estratégia `generateSW`) só tem uma lista
    de precache com os arquivos estáticos versionados do build (HTML, JS,
    CSS, ícones, manifest). Não há `runtimeCaching` configurado para
    `/api/*`: respostas do chat, dados de visão/câmera e qualquer memória
    futura nunca passam pelo cache do navegador — sempre vão direto à rede.
12. **Provedores de IA opcionais só chamam a rede a partir do servidor.**
    `apps/api` é o único lugar que fala com Anthropic ou um servidor local —
    o frontend nunca recebe chave nem faz a chamada. Mensagens de erro de
    provedor mostram o status HTTP e uma explicação, nunca o corpo bruto da
    resposta (que poderia conter a chave ecoada) nem a chave/URL
    configurada. Timeout, limite de tentativas e concorrência máxima
    protegem contra custo/latência descontrolados; um limite diário por IP
    (nunca aplicado ao Mock) limita o gasto de um provedor pago.

## Acesso por link secreto (sem login/senha)

O JARVIS não tem tela de login nem senha: quem possui o link
`/entrar/<token>` entra; quem não tem, não vê nada. Detalhes:

- O token em texto puro **nunca** é configurado nem armazenado — apenas seu
  hash SHA-256 (`JARVIS_ACCESS_TOKEN_HASH`), gerado por
  `scripts/generate-access-link.ps1`. Sem hash configurado, nenhum token é
  aceito (padrão seguro para ambientes sem link emitido).
- A comparação do token usa `hmac.compare_digest` (resistente a ataques de
  tempo), nunca `==`.
- Sessão: cookie assinado (`itsdangerous`, `JARVIS_SESSION_SECRET`),
  `HttpOnly`, `Secure` em produção, `SameSite=Lax`, expira em 30 dias.
  Trocar `JARVIS_SESSION_SECRET` (via `scripts/rotate-access-link.ps1`)
  invalida **todas** as sessões emitidas antes, imediatamente.
- Sem sessão válida, `/api/session` e `/api/chat` respondem exatamente como
  o 404 padrão do FastAPI (`{"detail": "Not Found"}`) — impossível
  distinguir "rota protegida" de "rota que não existe".
- `/api/entrar` tem limite de tentativas por IP em memória
  (`JARVIS_ENTRAR_RATE_LIMIT_ATTEMPTS`/`_WINDOW_SECONDS`); tentativas
  inválidas são logadas sem o valor do token enviado. **Limitação
  conhecida:** o contador é em memória por processo — uma implantação com
  múltiplos processos/workers precisaria de um armazenamento compartilhado
  (ex.: Redis) para o limite valer entre eles.
- Anti-indexação em toda resposta da API (`X-Robots-Tag`) e do frontend
  (`<meta name="robots">`, `robots.txt` nos dois lados), mais
  `Referrer-Policy: no-referrer` — sem sitemap, sem página pública.
- O frontend (`apps/web`) confirma a sessão via `GET /api/session` antes de
  renderizar a interface do JARVIS; sem sessão, mostra uma tela 404
  genérica sem qualquer indício do produto. **Limitação conhecida:** por
  enquanto isso é um SPA estático — o pacote JS ainda é baixado antes dessa
  checagem rodar. A proteção forte (o servidor nunca serve nada sem
  sessão) só existe hoje em `/api/chat`; ela se estende ao HTML/JS quando o
  FastAPI passar a servir `apps/web/dist` no mesmo domínio (etapa de
  deploy, ainda não implementada).
- Este mecanismo não substitui autenticação forte: **se o link vazar,
  qualquer pessoa que o tiver poderá entrar.** Rotacione com
  `scripts/rotate-access-link.ps1` assim que suspeitar de vazamento.

## Tratamento de erros

A API expõe um handler de exceção global que converte qualquer erro não
tratado em uma resposta JSON padronizada (`{"error": {"code", "message"}}`),
sem vazar stack trace, caminho de arquivo ou detalhes internos ao cliente.
Detalhes completos vão apenas para o log do servidor.

## Dependências

Apenas dependências instaladas localmente dentro do projeto (`.venv` para
Python, `node_modules` para Node). Nenhuma instalação global é necessária
para rodar o projeto.
