This repository hosts two independent projects.

## ToolScope AI (this folder's original app)

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

---

## JARVIS Universal (`apps/`, `packages/`, `scripts/`, `docs/`)

A personal-use, cinematic-inspired assistant: voice as the primary interface
(coming soon), a futuristic holographic HUD, context/memory, tool use behind
a fixed set of typed, validated actions, and (later, with pairing + an
allowlist) limited Windows control. See `docs/architecture.md` for the full
design, `docs/roadmap.md` for what's built vs. planned, and
`docs/security-model.md` for the security rules this project follows.

This is a separate app living alongside ToolScope AI in the same repo — it
does not touch `src/`, `prisma/`, `public/`, or the root `package.json`.

### Structure

```
apps/web       React + Vite + TypeScript frontend
apps/api       FastAPI backend (Mock chat provider, no paid API required)
apps/desktop   placeholder — desktop packaging, not implemented yet
apps/bridge    placeholder — paired, allowlisted Windows control, not implemented yet
packages/shared  shared types between web and api
scripts/       setup.ps1, dev.ps1, test.ps1, build.ps1 (PowerShell, no admin rights)
```

### Quick start (Windows PowerShell)

```powershell
scripts\setup.ps1   # creates apps/api/.venv and installs local deps (web + api)
scripts\dev.ps1      # runs the API (http://localhost:8000) and the web app (http://localhost:5173)
scripts\test.ps1     # runs frontend + backend tests
scripts\build.ps1    # builds the frontend for production
```

The web UI talks to the API in development through Vite's dev proxy — no
secrets are ever placed in the browser. See `apps/api/.env.example` for the
backend's environment variables.

### Current UI

The home screen is a dark, cyan-accented HUD: a central holographic core
(pure CSS/SVG, no external assets) that reflects the assistant's state
(idle, listening, thinking, speaking, executing, error), a conversation
panel, a command bar, quick shortcuts, a clock/date, service-health and
connection indicators, and a settings button. A "Workshop mode" (suit lab)
and a "Command mode" (voice/systems) share the same design language. Layout
adapts from 360px phones to desktop; full keyboard navigation, visible
focus, ARIA state announcements, and `prefers-reduced-motion` support are
included. Voice input is not implemented yet — the mic button is present but
disabled.
