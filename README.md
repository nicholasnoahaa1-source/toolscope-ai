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

As cores (azul-marinho + laranja) e a tipografia em `src/app/globals.css`
foram definidas com base em páginas do "Manual da Marca e da Identidade
Visual do Senac" (tipografia institucional em Helvetica Neue LT Pro, restrita
a material impresso; para meios eletrônicos o manual indica Verdana/Arial,
usados aqui). Os hex exatos da marca (`--senac-blue`, `--senac-orange`) foram
estimados visualmente a partir da logo, já que a página de códigos
Pantone/CMYK/RGB não foi conferida — troque pelos valores exatos se tiver
acesso a ela. O `Logo` em `src/components/senac/Logo.tsx` é uma reconstrução
aproximada do ícone + wordmark; troque pelo arquivo SVG/PNG oficial assim que
disponível.

## Armazenamento de arquivos

Nesta versão, arquivos enviados (materiais e entregas) são salvos localmente
na pasta `uploads/` e servidos por uma rota autenticada
(`/api/arquivos/[id]`). Para produção, considere migrar para um storage
externo (S3, R2, Vercel Blob etc.).
