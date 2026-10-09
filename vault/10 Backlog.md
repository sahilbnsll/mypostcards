---
title: Backlog
tags: [backlog]
updated: 2026-10-09
---

# Backlog and known limitations

## Do next

- [ ] **Apply the schema to the live Supabase project** and seed it ([[06 Supabase Setup]]). Needs the user to run the SQL. **Vercel already has the env vars**, so until this is done the deployed site is empty.
- [ ] Optional: store the schema as `supabase/migrations/<timestamp>_init.sql` and enable Supabase's GitHub integration so schema changes apply on push (avoids two sources of truth by making the migration the source and generating `schema.sql` from it).
- [ ] Run Lighthouse and a real-device pass on the deployed site; record results in [[08 Quality and Verification]].
- [ ] Replace sample content with real postcards, then remove the sample rows.
- [ ] Add photographer names and links for any Unsplash photographs kept ([[12 Sample Content and Credits]]).
- [ ] Wire the Supabase Database Webhook to `/api/revalidate`.
- [ ] Deploy to the subdomain and set the environment variables.

## Known limitations

- Unknown slugs return HTTP 200 with the not-found UI and `noindex` (the page streams after the shell). Acceptable for SEO because of `noindex`, but not a true 404.
- First request for each image pays the optimizer's encode cost. Self-host or pre-warm the real photographs.
- Unsplash images are hot-linked; if a photo is removed upstream it will break (re-check URLs before launch if still using samples).
- `npm audit` reports 5 dev-only highs in the ESLint chain (`braces`); fix is a breaking downgrade, so deferred until Next's lint config updates.
- No Content-Security-Policy yet (inline styles from Next and the `<style>` pattern need nonce work).
- Category list is in code and in a SQL `check`: adding one is a code change plus an `alter table`.
- The home gallery preview shows 16 postcards balanced across categories; the full set is on `/gallery`.
- Scroll-linked drift and the zoom parallax only run where `animation-timeline` is supported; the globe's polaroids need CSS Anchor Positioning (Chromium, Safari 26+). Both degrade to a plain grid or a bare globe.
- The zoom parallax needs exactly seven postcards (else it is skipped); the globe needs postcards with coordinates.
- Hero card dragging is mouse and pen only, by design.

## Ideas, not committed

- A per-postcard page for sharing and indexing (currently a hash deep link).
- Map view of coordinates.
- `image-stream-hero` corridor as an opt-in, pausable section.
- Pre-computed blur or colour at upload time (an `image_color` helper script).
- Paginated queries if the journal passes about 1,000 postcards.
- RSS feed for stories.

## Deferred on purpose (scope)

Authentication, community posts and submissions, profiles, likes, comments, followers, feeds, moderation, custom backend or admin UI.
