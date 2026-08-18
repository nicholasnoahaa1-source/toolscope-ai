# Roadmap — JARVIS Universal

Ordem de entrega planejada. Nada além do escopo de cada etapa é implementado
adiantado.

## Etapa 0 — Fundação (esta etapa)

- [x] Inspeção da pasta, Git e ferramentas disponíveis.
- [x] `CLAUDE.md` com as regras permanentes.
- [x] Documentação inicial (`docs/architecture.md`, `docs/roadmap.md`,
      `docs/security-model.md`, `README.md`).
- [x] Estrutura mínima de diretórios (`apps/*`, `packages/shared`, `scripts/`).
- [x] Frontend mínimo (`apps/web`): tela inicial estática, sem voz.
- [x] Backend mínimo (`apps/api`): `/api/health`, `/api/chat` com provedor
      Mock em pt-BR.
- [x] Scripts PowerShell (`setup`, `dev`, `test`, `build`) sem privilégios
      administrativos.

## Etapa 1 — Interface futurista original (concluída nesta sessão)

- Sistema de design (tokens de cor, espaçamento, tipografia, sombra, motion).
- Núcleo holográfico central (CSS/SVG/canvas leve) com estados: Em espera,
  Ouvindo, Pensando, Falando, Executando, Erro.
- HUD: painel de conversa, barra de comando, atalhos, relógio/data,
  integridade dos serviços, indicador de conexão, botão de configurações.
- Modo Oficina (laboratório de traje) e Modo Comando (voz/sistemas).
- Responsividade 360px→desktop, acessibilidade (teclado, foco, ARIA,
  `prefers-reduced-motion`).

## Próximas etapas (ainda não iniciadas — apenas planejamento)

- **Memória e contexto**: histórico persistente local, resumo de contexto
  entre sessões, sempre visível/editável pelo usuário.
- **Voz real**: captura de áudio sob ação explícita, transcrição, síntese de
  fala. Sem escuta contínua em segundo plano.
- **Visão mediante autorização**: acesso à câmera apenas quando solicitado
  explicitamente pelo usuário para uma tarefa específica, com indicador
  visível de captura ativa.
- **Provedor de IA real**: interface `ChatProvider` plugável, trocando o Mock
  por um provedor real apenas quando o usuário fornecer e autorizar uma
  chave, guardada somente no servidor.
- **`apps/bridge`**: controle remoto do Windows com pareamento por código,
  lista de permissões de ações/aplicativos, confirmação explícita para ações
  sensíveis, log auditável local.
- **`apps/desktop`**: empacotamento como aplicativo Windows (avaliação de
  Tauri/Rust será feita e aprovada em etapa própria — não iniciada).
- **PWA**: manifest, service worker, instalável no celular, antes do
  empacotamento desktop.
- **Laboratório de traje 3D**: visualização 3D experimental dentro do "modo
  oficina", carregada sob demanda (lazy) para não pesar o carregamento
  inicial.

## Fora de escopo até autorização explícita

- Deploy, compra de domínio/serviço, publicação, login externo (OAuth de
  terceiros), qualquer recurso pago.
- Rust/Tauri (avaliação e instalação ficam para uma etapa própria).
