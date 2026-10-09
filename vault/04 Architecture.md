---
title: Architecture
tags: [engineering]
updated: 2026-10-09
---

# Architecture

## Stack

Next.js **16.4** (App Router, React 19.3, **Cache Components** + Partial Prefetching on), TypeScript strict, **CSS Modules** with global design tokens, `next/image`, `next/font`. Only runtime dependency added: `@supabase/supabase-js` (server-side only). No Tailwind, no animation library. `AGENTS.md` warns this Next has breaking changes: read `node_modules/next/dist/docs/` before changing framework-level code.

## Folders

```text
src/app/                 routes: / /gallery /trips[/slug] /destinations[/slug] /cafes[/slug] /stories[/slug] /about
                         + not-found, error, icon.svg, manifest, robots, sitemap, api/revalidate
src/components/
  layout/                Header (client), Footer (server)
  ui/                    Photo, Stamp/Postmark, PageHead, CollectionHero, SectionHeader, Prose, EmptyState,
                         DetailSkeleton, MotionController
  features/              hero, gallery (BloomGallery), lightbox, carousel, trips, places, stories, cafes
src/content/             types, categories, mappers (row to domain), selectors (pure slicing), data/sample.ts, index.ts
src/lib/                 utils (formatting), reveal (scroll-reveal props)
src/styles/              tokens.css, globals.css, motion.css
supabase/                schema.sql, seed.sql (generated)
scripts/seed.mjs         seed Supabase or emit seed.sql
vault/                   this documentation (Obsidian)
```

## Data flow and caching

```text
Supabase (or sample.ts)
   → getJournal()  ["use cache", cacheLife("hours"), cacheTag("journal")]
   → server components slice it with selectors (by trip, place, category...)
   → client components receive plain serialisable props (PostcardView[])
```

- One cached call loads **everything** (five small queries in parallel). Right for a single-creator journal up to a few hundred postcards. Revisit past ~1,000 (see [[10 Backlog]]).
- Source choice (`src/content/index.ts`): Supabase if `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set, else the bundled sample journal. `CONTENT_SOURCE=local` forces samples. If Supabase is configured but a query fails, the error **throws** (shown by `error.tsx`) instead of silently falling back, so a broken connection is never hidden.
- Freshness: content refreshes at most hourly, or immediately via `POST /api/revalidate` (header `x-revalidate-secret`, constant-time compare, 503 when no secret is configured).
- The Supabase key is **server-only** (not `NEXT_PUBLIC_`), so it never ships to the browser.

## Rendering decisions

- Index pages and the home page are fully static.
- `[slug]` pages: `generateStaticParams` prerenders every known slug. The page default export is a thin `<Suspense>` wrapper with a skeleton around the param-reading content. That is Next's supported way for **new slugs added in Supabase to appear without a rebuild** (shell served, content streams). See [[09 Decisions]].
- Empty collections: `staticSlugs()` returns a placeholder slug (`__none__`), because Cache Components forbids empty `generateStaticParams`. The page 404s on it.
- Header and Footer are deliberately **not** inside Suspense, so nav and footer links are in the initial HTML even on large pages.

## Client boundaries (kept small)

`Header`, `MotionController`, `BloomGallery`, `Lightbox` + `useLightbox`, `PrintCarousel`, `error.tsx`. Everything else is server components. Large data crosses the boundary only as `PostcardView[]`.

## Images

`Photo` wraps `next/image` with a frame whose aspect ratio comes from the stored width/height and a background of the photo's average colour. Always passes `sizes`. Above the fold uses `fetchPriority="high"`; lightbox images are `eager`; everything else lazy. Origin URLs are pinned (`?auto=format&fit=max&w=2000&q=80`) and allow-listed in `next.config.ts` (`images.unsplash.com`, plus the Supabase Storage host derived from `SUPABASE_URL`). AVIF then WebP, 31-day optimizer cache.

## Lightbox and URLs

Native `<dialog>` (focus trap, Escape, inert background). Current photo is mirrored in `#p=slug` with `history.replaceState`, so photos are linkable and the hero deep-links to `/gallery#p=slug`. Only one lightbox per page syncs the hash (the carousel's does not). Closing syncs state directly rather than waiting for the `close` event.

## Security notes

- Public read only through RLS; the site never holds a write key. Service-role key is used only by `npm run seed`, locally.
- Response headers: `nosniff`, `Referrer-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy`. No CSP yet (see [[10 Backlog]]).
- `.env*` ignored; `.env.example` tracked. Secret scan of the working tree: clean.
