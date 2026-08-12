# Sala Virtual Senac

Plataforma de turmas, atividades, entregas e materiais de aula — um espaço simples
para professores e alunos, inspirado no Teams/Campus Digital Senac/AVA.

## Funcionalidades

- Login com papéis (Aluno, Professor, Admin)
- Professores criam turmas e compartilham um código de acesso
- Alunos entram em turmas usando o código
- Atividades com prazo, anexos e envio de entregas em arquivo
- Avaliação de entregas com nota (0–10) e feedback
- Materiais de aula (arquivo ou link) e mural de avisos por turma

## Rodando localmente

1. Copie `.env.example` para `.env` e preencha `DATABASE_URL`, `SESSION_SECRET`, `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.
2. Instale as dependências: `npm install`
3. Aplique as migrações: `npx prisma migrate deploy` (ou `npx prisma migrate dev` em desenvolvimento)
4. Popule dados de exemplo: `npx prisma db seed`
5. Inicie o servidor: `npm run dev`

Contas de exemplo criadas pelo seed (senha `senac123` para todas):

- `admin@senac.br` — Admin
- `professor@senac.br` — Professor (turma com código `SENAC1`)
- `aluno1@senac.br`, `aluno2@senac.br`, `aluno3@senac.br` — Alunos

## Identidade visual

As cores e a tipografia em `src/app/globals.css` seguem o "Manual da Marca e
da Identidade Visual do Senac":

- **Azul Senac** — Pantone 288 C — `#004A8D`
- **Laranja Senac** — Pantone 144 C — `#F7941D`
- **Laranja-claro** — Pantone 144 55% — `#FDC180`
- Tipografia institucional (impressos): Helvetica Neue LT Pro
- Tipografia para meios eletrônicos (usada neste site): Verdana/Arial

A logomarca oficial está em `public/logo-senac.png`, usada pelo componente
`src/components/senac/Logo.tsx`. Se depois você tiver a versão vetorial
(SVG), é só substituir o arquivo mantendo o mesmo nome/caminho.

## Armazenamento de arquivos

Arquivos enviados (materiais e entregas) são salvos em um bucket privado do
Supabase Storage (`arquivos`) via `src/lib/files.ts`, usando a chave
`service_role` (só em código de servidor). O download passa por uma rota
autenticada (`/api/arquivos/[id]`) que confere se o usuário pertence à
turma antes de servir o arquivo.

## Deploy (produção)

- **Banco de dados**: projeto Supabase dedicado (`senac-sala-virtual`),
  com as migrações do Prisma aplicadas e dados de exemplo já semeados.
- **Storage**: bucket privado `arquivos` já criado no mesmo projeto.
- **Hospedagem**: Vercel, projeto `senac-sala-virtual`.

Variáveis de ambiente que precisam ser configuradas no painel do Vercel
(Project Settings > Environment Variables) — não são definidas
automaticamente pelo deploy:

- `DATABASE_URL` — connection string do Postgres (Supabase > Project
  Settings > Database > Connection string, modo "Transaction pooler")
- `SESSION_SECRET` — chave aleatória para assinar os cookies de sessão
- `SUPABASE_URL` — URL do projeto Supabase
- `SUPABASE_SERVICE_ROLE_KEY` — chave `service_role` do projeto (Project
  Settings > API)
