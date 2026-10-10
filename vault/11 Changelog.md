---
title: Changelog
tags: [changelog]
updated: 2026-10-10
---

# Changelog

Newest first.

## 2026-10-10: Dark colours, postcard map pins, round cursor, visitors always visible

- Dark theme palette lifted (clear page, well and card levels, brighter accents); prints, polaroids and stamps stay light via `--print`, text over photos uses `--on-photo`. See [[02 Design System]], [[09 Decisions]] D23.
- Flat map pins are small tilted postcards showing the place's photo (numbered with photos on itinerary maps, dashed "?" for planned places). Overlapping cards are spread apart with a thread to the real spot; labels no longer clip at the top. D24.
- Round inverted cursor for mouse users (from the Cursor reference); fix: the blend now sits on the outer layer so it inverts what is under it instead of a white disc, and it turns into a ring over buttons and links so they stay visible in light and dark. D25.
- The visitors section is always shown: the home section and the `/visitors` composer appear even before Supabase is connected (with a "being set up" note).
- Added `content/README.md` (authoring guide); rewrote [[06 Supabase Setup]], [[05 Content Model]], [[04 Architecture]] and the README for the repo-based content.

## 2026-10-09: Content moved into the repository, visitors, and eight features

- Content is authored in `content/` and `public/images/`; Supabase is kept only for visitor cards. D19, D20.
- New: a page and share image per postcard, itineraries on trips, café guide details, search, flat map next to the globe, "Dreaming of" planned places, related postcards in the viewer, dark theme. D21, D22.
- Removed: `supabase/seed.sql`, `scripts/seed.mjs`, `/api/revalidate`, the sample data module and row mappers.
- Added dependencies: `sharp`, `d3-geo`, `topojson-client`, `world-atlas` (and their types). Dev now runs `scripts/dev.mjs`.

## 2026-10-09: Mobile menu animation, hosting guidance

- Mobile menu rebuilt with CSS enter and exit transitions: slides out as well as in, backdrop fades with it, quicker and shorter stagger, opens on the tap, page scroll locked behind any modal. See [[03 Motion System]], [[09 Decisions]] D17.
- Documented Vercel Hobby and Supabase Free limits and a photo hosting recommendation ([[06 Supabase Setup]], D18).
- Wrote down the feature ideas in [[10 Backlog]].

## 2026-10-09: Third batch of references

- Read the whole reference file again (all 11 components). New: `gallery` and `gallery-4`.
- `/gallery` opens with **Selected**, a five-photo bento; About ends with a **spread** of postcards that springs apart on scroll. See [[02 Design System]] and [[09 Decisions]] D16.
- Fix: gallery filter chip counts failed text contrast (60% opacity); now solid tokens. axe-core clean on `/gallery` (with and without a filter) and `/about`.

## 2026-10-09: Second batch of references, and a deploy fix

- New from the updated reference file: places **globe** (`cobe`), draggable **hero cards**, **sticky trip stack**, **zoom parallax** interlude. See [[02 Design System]] for how each was adapted.
- Fix: the Vercel deploy failed with `Could not find the table 'public.postcards'` because the tables had not been created. A missing table now builds with a warning and an empty state ([[09 Decisions]] D13). Run `supabase/schema.sql`, then redeploy or wait a minute.
- Wordmark sized from the content width so it can never overflow; fonts trimmed (optical-size axes dropped).
- Pushed to GitHub (`origin/master`), merged with the repository's initial commit.
- Added dependency: `cobe`.

## 2026-10-09: First complete version

- Replaced the placeholder scaffold with the full site: hero, pegged-prints carousel, bloom-filter gallery, lightbox, trips, places, cafés, stories, about.
- New design system (airmail ink and paper, Bricolage Grotesque + Newsreader + Reenie Beanie). See [[02 Design System]].
- Motion system with reduced-motion handling. See [[03 Motion System]].
- Content layer with Supabase and a sample fallback; schema, RLS, storage bucket, seed SQL and seed script. See [[05 Content Model]], [[06 Supabase Setup]].
- SEO: per-page metadata, canonical URLs, Open Graph, sitemap, robots, manifest, icon.
- Revalidation endpoint for Supabase webhooks.
- Verified: typecheck, lint, build, SQL in an embedded Postgres, mapper round trip, image URLs, axe-core spot checks, CLS 0. See [[08 Quality and Verification]].
- Added dependency: `@supabase/supabase-js`. Added scripts: `typecheck`, `seed`, `seed:sql`. Set `"type": "module"`.
- Created this vault.
