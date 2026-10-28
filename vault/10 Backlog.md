---
title: Backlog
tags: [backlog]
updated: 2026-10-28
---

# Backlog and known limitations

## Do next

- [ ] **Next.js security update.** `npm audit --omit=dev` (2026-10-28) reports a critical advisory for `next` 16.0.0 to 16.4.0 (image optimisation with SVG files, server actions, `use cache` typed arrays); the fix is 16.4.3. Not applied yet because it is a dependency change: run the checks after upgrading.
- [ ] Nepal, for the author to check: the notes are written from the photographs and web facts, not your words; the undated photographs and clips and the places they were put at; "Mount Kailash Resort" (read from signage and OpenStreetMap); that the dance clip is Lakeside, Pokhara; the 4K clips are at full size (large files) and the dance clip is 6.4 MB; flight photographs have no pin; the roast photographs were kept at your choice; the friends are unnamed; and the Instagram-story exports with stickers on them.
- [ ] The sticker footer: check the writing and slap timing on a real phone, in Safari and in Firefox. Share cards are one layout for every page; a hand-made image for the home page and each trip would look better.
- [ ] Where `nepal.zip` should live: it is git-ignored in the project root; consider moving it to `private-originals/trips/nepal/`.

- [ ] Brunatos, Bento B and Agra, for the author to check: dates for the new postcards (none of the photographs has one), whether the Agra clicks 1898 and 1900 were taken at Belgian Waffle or elsewhere in the market (the notes only say "near Shah Market"), and the exact wording of the dish names (Bianca al Formaggio).

- [ ] Real URL pagination for the gallery (so a page of results can be linked and shared) would need the page to read search params, which makes it dynamic under Cache Components; the current "show more" keeps the instant filters. Revisit if the collection passes a few hundred postcards.

- [ ] New references: look at `MorphReel`, `PostcardFolder`, the story covers and the lamp on a real phone and in Safari and Firefox; the reel loads up to seven textures per trip page, so measure it on a slow connection. A reel on place pages is a possible follow-up.

- [x] ~~Video on postcards~~ done 2026-10-17 ([[09 Decisions]] D37). Left: the clips were encoded in the browser at a fixed bitrate and are not fast-start optimised; re-encode with ffmpeg (`-movflags +faststart`, CRF about 26) if the files ever matter, and show a duration on the play mark.
- [x] ~~Live map for the trip route~~ done 2026-10-17 ([[09 Decisions]] D38). Left: the same live map for the Places "On the map" world view (it is still the SVG map), photo postcards that overlap where stops are a few km apart (Kasol and Manikaran; zooming apart works, clustering or fanning out would be better), and a purpose-made dark style instead of inverting the light one.
- [ ] Ujjain trip, for the author to check: the three stories and the trip story (written from the photographs, the web and what the author said); that the river video was at the Barwaha ghat (about 11 km from Omkareshwar) and not at Omkareshwar itself, and whether to call the river "Ganga ji" as the author did or the Narmada, which is what the text says; where the "lane at night" video was filmed (it is placed from its time); who is in the group photographs (the notes do not name anyone); and dates for the two mirror selfies.
- [ ] Confirm with the author: the date of the Skyhouse video (it is undated; the other Skyhouse postcards are 2 October 2026), and what to write about it (its title and caption say only where it is).
- [ ] Confirm with the author: the roadside photo's date (placed on 18 May by the camera's numbering and its dusk light), where they slept on 18 May (the photographs put them near Manali that evening), and whether they meant to go up the Shinku La road rather than to Baralacha La.
- [ ] The author's own words for the postcards whose notes are only facts and times (the trip photographs and videos, the two sky photographs).
- [ ] Write the author's own notes for the personal trip cards that have none (arms-out boulder, cairn, bike, Jägermeister, camp tent, roadside, the Manikaran flags and the "Divine vibes" photo).
- [ ] The globe pins all of India as one dot (places within 20 degrees merge). The author did not want the zoom or extra dots tried, so the list beside the globe is the current answer.
- [ ] Kasol to Jispa: the Manikaran evening, the Jägermeister photo and the roadside photo have no exact place or date from the photos; tell me what they are and I will place them.

- [ ] **Connect the guest desk**: run `supabase/schema.sql`, set `SUPABASE_URL`, `SUPABASE_ANON_KEY` (and optionally `VISITOR_SALT`) on Vercel; cards go live at once, hide one with the `hidden` column if needed ([[06 Supabase Setup]]). Delete the old unused tables and storage bucket.
- [x] ~~Add the first real postcards and remove the sample entries~~ done 2026-10-14 ([[12 Sample Content and Credits]]). Next: add trips and stories when there are some; both pages are ready and show empty states until then.
- [ ] Run Lighthouse, axe on the new pages (postcard, itinerary, places, cafés, visitors, search dialog) in both themes, and a real-device pass; record in [[08 Quality and Verification]].
- [ ] Optional: a daily Vercel cron that pings Supabase so the free project does not pause.
- [ ] Deploy to the subdomain and set the environment variables.

## Known limitations

- The world map and the globe show places that are close together (Delhi and Gurugram) as one pin named after both. A zoomable regional map would show them apart.
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
