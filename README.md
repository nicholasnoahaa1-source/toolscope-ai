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

### Access (secret link, no login)

There is no login screen or password. Access is a single secret link:

```powershell
scripts\generate-access-link.ps1   # prints a token, its hash, and the /entrar/<token> link
```

Copy the printed `JARVIS_ACCESS_TOKEN_HASH` into `apps/api/.env` (never
commit it), restart the API, then open the printed `/entrar/<token>` link
once — it exchanges the token for a signed session cookie and the token
never stays in the address bar. Without a valid session, every page and
protected API responds exactly like a 404 ("Not Found") — nothing reveals
that a private JARVIS exists there. If the link ever leaks, run
`scripts\rotate-access-link.ps1`: it issues a new link **and** invalidates
every session already open, immediately. See `docs/security-model.md` for
the full mechanism.

### Current UI

The home screen is a dark, cyan-accented HUD built on a small design-token
system (color, spacing, type, radii, glow/shadow, motion — `src/styles/tokens.css`).
A central holographic core (pure CSS/SVG, no external assets) reflects the
assistant's state (idle, listening, thinking, speaking, executing, error). On
desktop it's a three-column layout: an information panel (clock/date,
service health, connection indicator, quick shortcuts) on the left, the core
in the center, and the conversation panel + command bar on the right. On
phones it collapses to a single column focused on the conversation and
command bar, with the information panel becoming a slide-in drawer (opened
from the header's "Painel" button), respecting safe-area insets. A
"Modo Comando" / "Modo Oficina" switch shares the same visual language — the
workshop (suit lab) panel is a placeholder, lazy-loaded so it never adds
weight to the default command view. A settings dialog toggles small,
original Web-Audio-synthesized sound cues (on by default, easily muted) —
no audio is extracted from films. Full keyboard navigation, visible focus,
ARIA live status announcements, and `prefers-reduced-motion` support are
included; the background particle layer is also lazy-loaded and skipped
entirely under reduced motion. Voice input is not implemented yet — the mic
button is present but disabled.

Verified by running both dev servers and driving the real UI in headless
Chromium at 360px, 375×812 (mobile), and 1400×900 (desktop): no console
errors, no horizontal overflow at 360px, a real chat round-trip through the
Mock backend, and the info drawer/settings dialog opening, trapping focus,
and closing on Escape.

### AI providers (mock by default, optional real ones)

Chat replies stream in over Server-Sent Events, with a "Parar" (Stop)
button that cancels mid-response and a live status (Pensando/Falando).
`JARVIS_CHAT_PROVIDER` picks the backend: `mock` (default, no key needed),
`anthropic` (server-only, needs `JARVIS_MODEL` + `JARVIS_ANTHROPIC_API_KEY`),
or `local` (an OpenAI-compatible local server at `JARVIS_LOCAL_PROVIDER_URL`,
never assumed to be installed). A misconfigured or failing optional
provider surfaces a friendly in-chat error instead of crashing — switch
back to `mock` in `apps/api/.env` at any time. See
`docs/architecture.md` and `docs/security-model.md` for the full design
(timeouts, retries, concurrency cap, and the daily message limit that only
applies to paid/external providers).

### PWA (installable app)

`apps/web` is an installable PWA: a full manifest (name, colors, standalone
display, flexible orientation), an original SVG holographic-core icon
(`apps/web/public/icons/icon-master.svg` / `icon-maskable-master.svg`, no
Marvel assets) rasterized by a reproducible script
(`npm run generate-icons` inside `apps/web`, uses `sharp` — re-run it
whenever the master SVGs change), and a service worker (`vite-plugin-pwa`)
that precaches **only** the built shell (HTML/JS/CSS/icons/manifest). It
never intercepts or caches `/api/*` — chat replies, camera/vision data, and
any future private data always go straight to the network, uncached.

- **Offline**: the shell keeps working and shows a clear "Sem conexão no
  momento" notice explaining what still works (viewing the current session)
  and what doesn't (sending new messages) until the connection returns.
- **Install**: Settings → "Instalar aplicativo" shows the native install
  button where supported (Chrome/Edge/Android), manual "Adicionar à Tela de
  Início" steps on iOS Safari, and always shows how to remove the app
  afterward. The app works identically installed or not.
- **Updates**: new versions never auto-reload. A small banner
  ("Nova versão disponível — Atualizar agora / Depois") only activates the
  new service worker when the user confirms.

**Testing locally on Windows:**

```powershell
scripts\dev.ps1              # dev mode — the service worker is disabled in `vite dev` by design
cd apps\web
npm run build; npm run preview   # production build, PWA fully active at http://localhost:4173
```

Open `http://localhost:4173` in Chrome/Edge, check DevTools → Application →
Manifest/Service Workers, then use DevTools' "Offline" throttling (or turn
off Wi-Fi) and reload to see the offline shell. Installability requires
HTTPS in real deployments — `localhost` is exempt for local testing.

**Testing in the browser's phone simulation mode:** open DevTools → Toggle
device toolbar (Ctrl+Shift+M), pick a phone preset, reload
`http://localhost:4173`, then open the JARVIS Settings panel to see the
install instructions adapt (Chrome's device emulation still reports a
desktop user agent by default, so switch DevTools' emulated device to see
the iOS manual-install text, or test on a real Android/iPhone on the same
network for the real native install prompt).
