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

## Tratamento de erros

A API expõe um handler de exceção global que converte qualquer erro não
tratado em uma resposta JSON padronizada (`{"error": {"code", "message"}}`),
sem vazar stack trace, caminho de arquivo ou detalhes internos ao cliente.
Detalhes completos vão apenas para o log do servidor.

## Dependências

Apenas dependências instaladas localmente dentro do projeto (`.venv` para
Python, `node_modules` para Node). Nenhuma instalação global é necessária
para rodar o projeto.
