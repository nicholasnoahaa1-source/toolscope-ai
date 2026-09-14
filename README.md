This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Painel da Vida (`/painel`)

Uma página que reúne agenda, tarefas, e-mails não lidos, notas e arquivos
recentes em um lugar só.

### Como os dados chegam aqui

Os conectores (Google Calendar, Gmail, Todoist, Notion, Google Drive, Spotify,
Slack, Vercel, GitHub, Supabase) são autenticados **dentro do Claude**, não
neste site — o site não tem os tokens de OAuth deles e não consegue chamá-los
sozinho. Então o painel lê um **snapshot**: um JSON com o estado atual da sua
vida, que o assistente regrava a pedido ("atualiza meu painel").

A ordem de resolução está em `src/lib/life/snapshot.ts`:

1. `LIFE_SNAPSHOT_JSON` — o JSON inteiro numa variável de ambiente (use em deploy).
2. `data/life-snapshot.local.json` — o seu snapshot real, **fora do git**.
3. `data/life-snapshot.example.json` — exemplo público, para o painel nunca ficar vazio.

O formato está tipado em `src/lib/life/types.ts`. Se um dia você quiser dados ao
vivo sem passar pelo assistente, é aqui que entra: troque `getLifeSnapshot()` por
chamadas às APIs de cada serviço com OAuth próprio, mantendo o mesmo formato — o
resto da página não muda.

### Por que o snapshot real não está no repositório

Ele contém assunto de e-mail, remetente, compromissos e nomes de arquivos seus.
`data/life-snapshot.local.json` está no `.gitignore`; só o exemplo, com dados
fictícios, é versionado.
