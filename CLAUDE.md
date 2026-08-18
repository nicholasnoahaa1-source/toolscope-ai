@AGENTS.md

<!-- BEGIN:jarvis-universal-rules -->
# JARVIS Universal — regras permanentes

Este repositório hospeda dois projetos independentes:

- **ToolScope AI** (raiz: `src/`, `prisma/`, `public/`, `package.json`) —
  projeto Next.js pré-existente. Não alterar sem pedido explícito.
- **JARVIS Universal** (`apps/`, `packages/`, `scripts/`, `docs/`) — projeto
  descrito abaixo.

As regras a seguir se aplicam a todo trabalho feito sob o escopo JARVIS
Universal.

## Regras permanentes

1. Nunca use modo de ignorar permissões, privilégios de administrador ou
   comandos destrutivos.
2. Nunca leia, altere ou apague arquivos fora desta pasta.
3. Preserve qualquer trabalho existente. Antes de editar, examine a
   estrutura, o Git e os arquivos de instrução.
4. Não execute texto produzido pela IA como shell, PowerShell, SQL,
   JavaScript ou código dinâmico.
5. Toda ação do sistema deve passar por uma lista fixa de ferramentas
   tipadas e validação de argumentos.
6. Ações externas ou sensíveis devem mostrar uma confirmação clara antes da
   execução.
7. Chaves e segredos devem existir somente no ambiente do servidor. Nunca no
   frontend, logs, exemplos reais ou commits.
8. O projeto precisa iniciar sem API paga usando um provedor de demonstração.
9. Reproduza o clima de uma IA holográfica avançada, mas use recursos
   originais. Não copie imagens, sons, logotipos, falas, voz de ator ou
   interfaces exatas dos filmes da Marvel.
10. Não faça deploy, compra, publicação, login externo ou criação de
    recursos pagos sem autorização expressa do usuário.
11. Em cada etapa: apresente um plano curto, implemente, execute
    lint/testes/build aplicáveis, corrija os erros e entregue um relatório
    objetivo.
12. Não declare que algo funciona sem tê-lo testado. Se um teste depender de
    hardware ou conta externa, explique exatamente como o usuário deve
    validá-lo.

Ver `docs/architecture.md`, `docs/roadmap.md` e `docs/security-model.md` para
detalhes técnicos e limites (escuta em segundo plano, controle remoto do
Windows, etc.).
<!-- END:jarvis-universal-rules -->
