---
title: Architecture
tags: [engineering]
updated: 2026-10-17
---

# Architecture

## Stack

Next.js **16.4** (App Router, React 19.3, **Cache Components** + Partial Prefetching on), TypeScript strict, **CSS Modules** with global design tokens, `next/image`, `next/font`. Runtime dependencies: `cobe` (WebGL globe), `sharp` (measure local images at build, share-image photo), `d3-geo` + `topojson-client` + `world-atlas` (flat map drawn as SVG on the server), `@supabase/supabase-js` (visitor cards only, server-side). No Tailwind, no animation library. `AGENTS.md` warns this Next has breaking changes: read `node_modules/next/dist/docs/` before changing framework-level code.

## Folders

```text
content/                 authored data: postcards, trips, destinations, cafes (JSON), stories (Markdown), README
public/images/           the author's photographs, in folders by café, kind or trip (see [[05 Content Model]])
private-originals/       untouched originals, same folders (git-ignored)
scripts/                 build-content.mjs (validate + generate), dev.mjs (dev server + watcher)
src/app/                 routes: / /gallery /postcards/[slug] /trips[/slug] /destinations[/slug] /cafes[/slug] /art /random-clicks
                         /stories[/slug] /visitors /about /search-index.json + not-found, error, icon, manifest, robots, sitemap
                         (per-route opengraph-image for postcards, trips, places, cafés, stories)
src/components/
  layout/                Header, Footer, ThemeToggle
  ui/                    Photo, Stamp/Postmark, PageHead, CollectionHero, SectionHeader, ViewAllButton, Prose, EmptyState,
                         DetailSkeleton, MotionController, Cursor
  features/              hero, gallery, lightbox, carousel, trips (TripCards, TripStack, Itinerary), places, globe,
                         map (SvgMap), zoom, stories, cafes (CafeGuide), postcard (PostcardBack, RelatedPostcards),
                         search (SearchPalette), visitors (CardComposer, DrawingPad, VisitorWall)
src/content/             types, selectors, visitors(-shared), generated/journal.json (not committed), index.ts
src/lib/                 utils, reveal, supabase (anon client, server-only)
src/styles/              tokens.css (light + dark), globals.css, motion.css
supabase/                schema.sql (visitor_cards)
vault/                   this documentation (Obsidian)
```

## Data flow and caching

```text
content/*.json + content/stories/*.md + public/images/**
   → scripts/build-content.mjs  (validate, measure local images, derive covers, derive places from postcard cities)
   → src/content/generated/journal.json   (gitignored; built by prebuild, pretypecheck and npm run dev)
   → getJournal()  → server components slice it with selectors → client components get plain props
```

- The journal is a static import: no database, no network, no revalidation endpoint. Content changes by committing files; Vercel redeploys.
- Validation is strict on purpose (slug format, references, required alt text, unknown field names with suggestions, local image files exist). Errors are collected and stop the build with the file and the fix. See [[05 Content Model]].
- **Visitor cards** are the only runtime data: `getVisitorWall()` (`"use cache"`, tag `visitor-cards`, 5 minute revalidate) reads visible (not hidden) rows through the anon key. It never throws: no config means "closed", a missing table or failure means an empty wall plus a log warning. The submit path is a server action that expires the wall's cache tag (`updateTag`) so a new card shows at once, calling the `submit_visitor_card()` database function ([[06 Supabase Setup]], [[09 Decisions]] D19).
- No secret ever reaches the browser; the site never holds a write key.

## Rendering decisions

- Index pages and the home page are fully static.
- `[slug]` pages (including `/postcards/[slug]`): `generateStaticParams` prerenders every slug from the journal (133+ static pages). The page default export is a thin `<Suspense>` wrapper with a skeleton around the param-reading content, which is Cache Components' supported shape for dynamic params. See [[09 Decisions]].
- Empty collections: `staticSlugs()` returns a placeholder slug (`__none__`), because Cache Components forbids empty `generateStaticParams`. The page 404s on it.
- Header and Footer are deliberately **not** inside Suspense, so nav and footer links are in the initial HTML even on large pages.

## Client boundaries (kept small)

`Header`, `ThemeToggle`, `SearchPalette`, `Cursor`, `MotionController`, `BloomGallery`, `Lightbox` + `useLightbox`, `PrintCarousel`, the visitor composer and drawing pad, `error.tsx`. The flat map (`SvgMap`) is a server component that ships no JavaScript; the trip route map adds `LiveRouteMap`, which loads `maplibre-gl` (and its worker, as a static asset) only when the map is near the screen. Everything else is server components. Large data crosses the boundary only as `PostcardView[]`.

## Images

Postcards with a `video` use `PostcardMedia`, which plays the MP4 from `public/images/` directly (the poster is the optimised `image`; the clip is fetched when it plays). `Photo` wraps `next/image` with a frame whose aspect ratio comes from the stored width/height and a background of the photo's average colour. Always passes `sizes`. Above the fold uses `fetchPriority="high"`; lightbox images are `eager`; everything else lazy. Local photos are served from `public/images/`; sample photos are Unsplash URLs (pinned query, allow-listed in `next.config.ts`). AVIF then WebP, 31-day optimizer cache.

## Lightbox and URLs

Native `<dialog>` (focus trap, Escape, inert background). Current photo is mirrored in `#p=slug` with `history.replaceState`, so photos are linkable and the hero deep-links to `/gallery#p=slug`. Only one lightbox per page syncs the hash (the carousel's does not). Closing syncs state directly rather than waiting for the `close` event.

## Dark theme

Tokens are redefined under `:root[data-theme="dark"]` and, identically, under `@media (prefers-color-scheme: dark)` for `:root:not([data-theme])`-style fallbacks (keep both blocks the same). A tiny inline script in the layout `<head>` sets `data-theme` from `localStorage` or the system preference before first paint, so there is no flash. See [[02 Design System]].

## Search

`/search-index.json` is a static route listing postcards, places, trips, cafés and stories. `SearchPalette` (dialog, `/` or Ctrl/Cmd+K) loads it on first open and scores matches in the browser (accent-insensitive).

## Security notes

- Visitor data is written only through a `security definer` function behind RLS; the site holds the anon key only. See [[06 Supabase Setup]].
- Drawings are stroke data re-validated on write and read and rendered as SVG paths, never HTML. Cards are plain text; links are rejected.
- Response headers: `nosniff`, `Referrer-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy`. No CSP yet (see [[10 Backlog]]).
- `.env*` ignored; `.env.example` tracked. No service-role key is needed anywhere.
