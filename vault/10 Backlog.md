---
title: Backlog
tags: [backlog]
updated: 2026-10-14
---

# Backlog and known limitations

## Do next

- [ ] **Connect the guest desk**: run `supabase/schema.sql`, set `SUPABASE_URL`, `SUPABASE_ANON_KEY` (and optionally `VISITOR_SALT`) on Vercel; cards go live at once, hide one with the `hidden` column if needed ([[06 Supabase Setup]]). Delete the old unused tables and storage bucket.
- [x] ~~Add the first real postcards and remove the sample entries~~ done 2026-10-14 ([[12 Sample Content and Credits]]). Next: add trips and stories when there are some; both pages are ready and show empty states until then.
- [ ] Run Lighthouse, axe on the new pages (postcard, itinerary, places, cafés, visitors, search dialog) in both themes, and a real-device pass; record in [[08 Quality and Verification]].
- [ ] Optional: a daily Vercel cron that pings Supabase so the free project does not pause.
- [ ] Deploy to the subdomain and set the environment variables.

## Known limitations

- Detail pages ([slug] routes) deliver their content through React's streaming swap: the served HTML holds it in a hidden block that a small inline script moves into place. Browsers do this at once; with JavaScript off only the loading skeleton is visible. Fixing it means making these routes fully part of the static shell, which Cache Components does not currently do for dynamic params.

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

## Feature ideas (prioritised, not committed)

Guardrail: the site is a single-creator journal. Anything that stores visitor data needs spam protection and a privacy line, so it sits lower. Hobby hosting is non-commercial only.

**Do first**
- [x] A page per postcard (`/postcards/[slug]`) with its own metadata and share image; today photos only have a hash link.
- [ ] Trim `images.deviceSizes` to protect the 5K monthly optimisation quota.
- [x] Itineraries: a `trip_stops` table (day, order, place, note, tip, optional lat/lng, linked postcard) shown as a day-by-day timeline on trip pages.
- [ ] RSS for stories and new postcards.

**Next**
- [x] Café and food guide fields: usual order, price level, best seat, wifi and power, link to the place on a map.
- [ ] Tag pages and tag filter (tags are stored but not used in the UI yet).
- [x] Search (title, caption, place, tags).
- [x] Map view of postcards with coordinates (flat map next to the globe).
- [x] "Planned" status on places and trips for a "dreaming of" list.
- [x] Related postcards in the lightbox (same place, tag or kind).
- [ ] Per-postcard share image styled as the back of a postcard.
- [ ] Dark ("night") theme.
- [ ] CI: lint, typecheck, build and a small browser smoke test on every push.
- [ ] Privacy-friendly analytics.
- [ ] Scheduled export of the tables to JSON as a backup.
- [ ] Licence and copyright line for the photographs.

**Later, with care**
- [ ] "Suggest a place" form: insert-only table, bot check (e.g. Cloudflare Turnstile), rate limit, optional email, you review in the dashboard.
- [ ] Guestbook ("send me a postcard back"): moderated, shown only after approval.
- [ ] Comments on stories via GitHub-backed comments (no database, moderation by GitHub).
- [ ] "My shoebox": visitors save postcards locally in their browser and share the list by link, no accounts.
- [ ] Single-user admin page behind Supabase Auth, only if the script stops being enough.

**Probably not**
- Likes, followers, feeds, public uploads, user profiles (deferred on purpose, see [[01 Product and Scope]]).
- Selling prints, ads or affiliate links: makes the project commercial, which the Hobby plan does not allow.

## Ideas, not committed

- A per-postcard page for sharing and indexing (currently a hash deep link).
- Map view of coordinates.
- `image-stream-hero` corridor as an opt-in, pausable section.
- Pre-computed blur or colour at upload time (an `image_color` helper script).
- Paginated queries if the journal passes about 1,000 postcards.
- RSS feed for stories.

## Deferred on purpose (scope)

Authentication, community posts and submissions, profiles, likes, comments, followers, feeds, moderation, custom backend or admin UI.

## Added after the pivot

- Brand: decide whether to re-theme the whole site (paper, ink, accents) to the logo's green, clay and brown, and whether the hero's giant "my postcards" should become the serif "mypostcards". Not done: the logo's colours currently appear only in the logo.
- Brand: the logo sheet is 1024px, so the traced stamp is as detailed as that allows. A higher-resolution export would let the camera lines be redrawn finer.

- Visitor cards: no review before they appear and no notification when one arrives. If abuse becomes a problem: a report button, an auto-hide after reports, or restoring approval.
- The world map thins pins to one per ~7 degrees and spreads cards on the server; very narrow screens can still show touching cards.
- The round cursor hides the native one for mouse users; reconsider if it annoys.
- Tag pages and RSS are still open.
