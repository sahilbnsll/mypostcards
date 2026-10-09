# My Postcards

> A little collection of places I've been and moments I've kept.

A personal photo journal for **mypostcards.sahilbansal.net**, kept by Sahil Bansal: travel, cafés, city streets, food and weekend getaways, presented as digital postcards.

**Project documentation lives in the Obsidian vault at [`vault/`](vault/00%20Home.md).** Open the `vault/` folder as a vault in Obsidian. Start with `00 Home.md`.

## Stack

Next.js 16 (App Router, Cache Components), React 19, TypeScript (strict), CSS Modules with design tokens, `next/image` and `next/font`, Supabase (Postgres, read-only from the site). No Tailwind, no animation library.

> This Next.js version has breaking changes. Read the relevant guide in `node_modules/next/dist/docs/` before changing framework-level code (see `AGENTS.md`).

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

With no environment variables the site shows built-in **sample content** (48 sample postcards).

## Connect Supabase

1. Run `supabase/schema.sql` in the Supabase SQL editor (creates tables, RLS, storage bucket).
2. Optionally load samples: paste `supabase/seed.sql`, or set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` and run `npm run seed`.
3. Copy `.env.example` to `.env.local` and set `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Restart the dev server.

Full runbook, including adding your own postcards and uploading photos: `vault/06 Supabase Setup.md`.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run seed` | Upsert sample rows into Supabase (needs `.env.local`) |
| `npm run seed:sql` | Regenerate `supabase/seed.sql` from `src/content/data/sample.ts` |

## Layout

```text
src/app/          routes and metadata
src/components/   layout, ui primitives, feature components
src/content/      types, data layer (Supabase + sample), selectors
src/styles/       tokens.css, globals.css, motion.css
supabase/         schema.sql, seed.sql
scripts/          seed.mjs
vault/            project documentation (Obsidian)
design-reference/ supplied UI component references
```

## Scope

Single-creator journal. Deliberately not built: authentication, community posts, profiles, likes, comments, feeds, moderation, custom backend. See `vault/10 Backlog.md`.
