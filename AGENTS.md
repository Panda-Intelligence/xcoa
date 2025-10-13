# Repository Guidelines

## Project Structure & Module Organization
- App: `src/app` (Next.js App Router). Segment groups `(admin)`, `(auth)`, `(dashboard)`; APIs in `src/app/api/**/route.ts`.
- UI: `src/components` (shared), `src/layouts`, `src/icons`.
- Data: `src/db/schema.ts`, `src/db/migrations/*` (Drizzle + D1), `src/schemas/*` (zod).
- Server & Libs: `src/server/*`, `src/lib/*`, `src/utils/*`, `src/state/*`.
- Emails: `src/react-email/*`.
- Infra: `wrangler.jsonc`, `open-next.config.ts`, `drizzle.config.ts`, `scripts/*`, `public/*`.

## Build, Test, and Development Commands
```bash
pnpm install                # install deps
pnpm dev                    # start Next.js dev server (http://localhost:3000)
pnpm db:migrate:dev         # apply D1 migrations locally via Wrangler
pnpm lint                   # ESLint (Next + TS rules)
pnpm cf-typegen            # generate Cloudflare runtime types
pnpm build                  # production build (Next)
pnpm deploy                 # OpenNext build + deploy to Cloudflare
pnpm preview                # OpenNext preview deployment
```
Tip: Cloudflare resources are configured in `wrangler.jsonc`; local secrets live in `.dev.vars` and app env in `.env`.

## Coding Style & Naming Conventions
- TypeScript + React 19 + Next 15; 2‑space indent (`.editorconfig`).
- Linting: `eslint.config.mjs` (extends `next/core-web-vitals`, `next/typescript`).
- Files: pages use `page.tsx`, API routes `route.ts`, server actions `*.action.ts` in `src/actions/`.
- Components: PascalCase file names in `src/components/*`; client components may use `.client.tsx` suffix.
- Styling: Tailwind CSS; prefer utility classes over custom CSS.

## Testing Guidelines
- No formal unit test suite yet; required checks: `pnpm lint` and `pnpm cf-typegen` must pass.
- If adding tests, prefer Playwright for e2e (`e2e/*.spec.ts`) and colocated unit tests as `*.spec.ts` next to source.

## Commit & Pull Request Guidelines
- Commits: use concise, imperative messages. Common prefixes in history: `feat:`, `fix:`, `chore:` (e.g., `feat: optimize search`).
- Branches: `feature/<slug>` or `fix/<slug>` (e.g., `feature/crawler`).
- PRs must include: summary, scope of impact, screenshots/GIFs for UI, migration notes (`src/db/migrations/*`), env changes, and how to validate locally.
- Before opening PR: run `pnpm lint`, `pnpm db:migrate:dev` (if migrations), and a full `pnpm build`.

## Security & Configuration Tips
- Never commit secrets. Use `.env.example` as reference; keep `.env` and `.dev.vars` local; production secrets via `wrangler secret put`.
- Keep D1 and KV bindings in sync between `wrangler.jsonc` and code; DB changes go through Drizzle migrations only.
