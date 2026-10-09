---
title: Changelog
tags: [changelog]
updated: 2026-10-09
---

# Changelog

Newest first.

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
