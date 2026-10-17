# My Postcards

> A little collection of places I've been and moments I've kept.

A personal photo journal for **mypostcards.sahilbansal.net**, kept by Sahil Bansal: travel, cafés, city streets, food, weekend getaways the odd piece of art and random clicks, presented as digital postcards.

**Project documentation lives in the Obsidian vault at [`vault/`](vault/00%20Home.md).** Open the `vault/` folder as a vault in Obsidian. Start with `00 Home.md`.

## Stack

Next.js 16 (App Router, Cache Components), React 19, TypeScript (strict), CSS Modules with design tokens, `next/image` and `next/font`. Content is files in this repository. Supabase is used only for visitor cards. No Tailwind, no animation library.

> This Next.js version has breaking changes. Read the relevant guide in `node_modules/next/dist/docs/` before changing framework-level code (see `AGENTS.md`).

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000, rebuilds data when content/ or public/images/ change
```

No environment variables are needed to run the site. Without Supabase the visitors page works as a preview and cards can not be sent.

## Adding your own postcards

Photos go in `public/images/`; entries go in `content/*.json`. Trips can have day-by-day itineraries, cafés can have guide details, places can be marked as planned. The full guide, with examples: [`content/README.md`](content/README.md). Mistakes stop the build with a message that names the file and the fix.

## Visitor cards (Supabase, optional)

1. Run `supabase/schema.sql` in the Supabase SQL editor.
2. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` (and optionally `VISITOR_SALT`) in Vercel and `.env.local`. Never the service-role key.
3. Cards go on the wall straight away. To take one down, tick `hidden` on it in the Table Editor (or delete the row).

Runbook: `vault/06 Supabase Setup.md`.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server that also watches `content/` and `public/images/` |
| `npm run content` | Rebuild and validate the content data once |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## Layout

```text
content/          authored data (postcards, trips, destinations, cafés, stories)
public/images/    your photographs, in folders by café, kind or trip (see below)
private-originals/ your untouched originals, same folders (git-ignored)
src/app/          routes and metadata
src/components/   layout, ui primitives, feature components
src/content/      types, selectors, generated journal (not committed)
src/styles/       tokens.css (light and dark), globals.css, motion.css
supabase/         schema.sql (visitor cards)
scripts/          build-content.mjs, dev.mjs
vault/            project documentation (Obsidian)
design-reference/ supplied UI component references
```

## Finding things

**Photographs** are filed by what they belong to, and the originals mirror them:

```text
public/images/
  cafes/
    daksina-bhawan/     one folder per café: front-view.jpg, temple-bells.jpg, dosa.jpg ...
    pf-changs/          blossom-ceiling.jpg, spring-rolls.jpg ...
    costa-coffee/       mural-wall.jpg, serene-caramel-frappe.jpg, cheesecake.jpg ...
  art/                  house-on-the-hill.jpg, signed-on-the-back.jpg
  city/                 empty-metro-platform.jpg (street, skyline and transit shots that are not a trip)
  random-clicks/        lamp-over-the-pothos.jpg, plus a folder per place: ambience-mall/ (durga-pandal.jpg, flower-display.jpg), office-cafe/ (camera-and-cup.jpg, heart-latte.jpg)
  trips/<trip>/         photos from a trip (when there are trips)
  destinations/<place>/ photos from a place that belong to no café or trip
private-originals/      the same folders, holding your untouched originals (git-ignored, never published)
```

**Code** is filed by what it is for:

| Looking for | Go to |
|---|---|
| a page or its address | `src/app/<route>/page.tsx` |
| the header, footer, theme toggle | `src/components/layout/` |
| a small reusable piece (photo, rating, page title) | `src/components/ui/` |
| a whole feature (gallery, globe, trips, cafés, visitors, search) | `src/components/features/<feature>/` |
| the logo and stamp | `src/components/brand/` (drawn from `stampGeometry.ts`) |
| nav links, site name, socials | `src/config/site.ts` |
| colours, type, spacing, dark mode | `src/styles/tokens.css` |
| the shape of the data | `src/content/types/index.ts` |
| how photos and entries are checked | `scripts/build-content.mjs` |

## Scope

Single-creator journal. Deliberately not built: accounts, profiles, likes, feeds, a custom backend. Visitors can leave a card; nothing else is user-generated. See `vault/10 Backlog.md`.
