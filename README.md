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

1. Copie `.env.example` para `.env` e preencha `DATABASE_URL` (Postgres/Neon) e `SESSION_SECRET`.
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

Nesta versão, arquivos enviados (materiais e entregas) são salvos localmente
na pasta `uploads/` e servidos por uma rota autenticada
(`/api/arquivos/[id]`). Para produção, considere migrar para um storage
externo (S3, R2, Vercel Blob etc.).
