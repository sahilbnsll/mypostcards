---
title: Quality and Verification
tags: [quality]
updated: 2026-10-14
---

# Quality and verification

Everything below was actually run on 2026-10-09. Anything not listed was **not** verified.

## Automated gates

| Check | Command | Result |
|---|---|---|
| Types | `npm run typecheck` | Pass |
| Lint (incl. React Compiler rules) | `npm run lint` | Pass, 0 problems |
| Production build | `npm run build` | Pass, 35 static pages |
| Dependency audit, production | `npm audit --omit=dev` | 0 vulnerabilities |
| Dependency audit, all | `npm audit` | 5 high, **dev-only**: `braces` ReDoS in the ESLint tooling chain (`eslint-config-next`). Pre-existing. The proposed fix downgrades to Next 14 tooling, so it is not applied |
| Secret scan | `superpack/scripts/secrets.mjs` | Clean |

## Data and SQL

- `schema.sql` and `seed.sql` run in an embedded Postgres (PGlite) with stubbed Supabase roles: schema re-run is idempotent, seed re-run upserts, counts 5/5/4/3/48.
- RLS: the `anon` role sees only published rows (unpublished hidden), and insert/update/delete are denied. Bad slugs and bad categories are rejected by constraints.
- Mapper round trip: rows read back from Postgres, mapped, deep-equal to `sample.ts` for all five collections.
- All 48 distinct image URLs return HTTP 200 with an image content type (max 1.8 MB, avg 0.6 MB origin). Alt text present on every photograph.

## Browser checks (1280 and 375 wide)

- Home, gallery, trips, trip detail, places, café index, story, about rendered and visually inspected.
- No horizontal overflow at 375px.
- Filter bloom works; lightbox opens from click and from `/gallery#p=slug`; arrow keys step within the filtered set; Escape closes and clears the hash and scroll lock; mobile menu opens and closes; mobile lightbox stacks photo over card back.
- **axe-core 4.10.2**: no violations on home, gallery with lightbox open, story, about. Two findings were fixed (an `aside` nested in the dialog; heading order on café/story indexes). Trip, place and café detail pages were scanned but their final scan did not complete in the hidden pane (see the testing caveat in [[03 Motion System]]).
- Production build probe: **CLS 0**, CSS 9 KB, JS about 150 KB encoded, fonts about 200 KB after trimming axes. Header, nav, footer and page content are in the initial HTML, with no pending Suspense boundaries on index pages. Security headers present.

## Added with the second batch of references (2026-10-09)

- Typecheck, lint, production build and `npm audit --omit=dev` (0 vulnerabilities with `cobe`) pass; secret scan clean.
- Globe: renders, pins and polaroids anchor to the right places, correct orientation after calibration, works at 375px. Zoom: start collage, mid-zoom and fully zoomed states seen; falls back to a 2-column grid at 375px (no overflow). Trip stack: the next card slides over the previous. Hero drag: a real mouse drag moved the card (clamped to the table), raised it, and neither navigated nor opened the lightbox. Wordmark fits at 1024, 1280 and 1920 wide.
- **Vercel failure reproduced and fixed**: a stand-in server answering like Supabase with no tables made the old build fail exactly as reported; the new build succeeds with a warning. A stand-in answering "Invalid API key" still fails the build.
- Not verified: Safari and Firefox behaviour of CSS Anchor Positioning and scroll-linked animation (both are progressive: polaroids and the zoom simply do not appear), WebGL on low-end phones, long-run globe memory, `cobe` marker anchoring on iOS.

## Added with the third batch of references (2026-10-09)

- Bento: layout (2x2 plus four) rendered, tiles black and white, click opens the lightbox with a 5-item set ("03 / 05") and does not touch the URL hash. Spread: stacked before reveal, spring to the final overlapping row once released; no horizontal overflow.
- axe-core: no violations on `/about`; `/gallery` had one real finding (chip count contrast), fixed, then clean with and without a category filter selected.
- Caveat: in the hidden pane the scroll-reveal observer did not fire by itself, so the spread's pending-to-in step was triggered by hand for the check.

## Pivot batch (2026-10-09 and 2026-10-10)

- Gates: `tsc`, ESLint and `npm run build` pass (134 static pages; `/visitors` revalidates every 5 minutes). Content generator: 48 postcards, 5 trips, 6 places, 4 cafés, 3 stories.
- SQL (`supabase/schema.sql`) tested in PGlite: idempotent; anon cannot insert, update, delete, read `ip_hash` or `select *`; cards public at once, hidden ones not; rate limit; bad drawing, kind and colour rejected.
- Guest desk end to end against a stand-in Supabase server: kind, name, message, strokes and the daily hash reached the function; link, empty-card and rate-limit errors became friendly messages; hostile text, colours and coordinates were sanitised; the wall rendered in dark.
- Browser (1280 wide): flat map with postcard pins, planned dashed pin, threads and hover label (below the card, not clipped); trips page overlays readable in dark; `/visitors` shows the note and composer, textarea and drawing pad keep their cursors; the round cursor inverts text under it and becomes a ring over a button, checked in light and dark.
- No-approval change (2026-10-10): the SQL was re-tested in PGlite (23 checks including the upgrade from the old approved column); typecheck and lint pass. Header (second version, from the navigation reference) checked in the browser: 1440 wide in light and dark, hover and current-page underlines, scrolled bar, 1100 wide without icons (fits, no overflow); the mobile header and menu were checked on the first version and only the menu rows changed since. The production build (134 pages), typecheck, lint and the secrets scan also pass after both changes; axe was not re-run.
- Logo (2026-10-10): checked in the browser (header, seal and footer text also after the descriptor change): header stamp and wordmark (light, dark, 375px wide without overflow), About seal, footer lockup, default share image (1200x630, text fits), app icon at 512px. Not checked: the favicon at 16px in a real tab, the installed-app icons on a phone, the postcard share image with the new lockup, axe on the changed pages.
- Full check before pushing (2026-10-10): typecheck, ESLint, production build (136 static pages), `npm audit --omit=dev` (0) and the secrets scan are clean. axe-core (light and dark, transitions off) on /, /gallery, /visitors, /about, /destinations, /trips/paper-lanterns, /postcards/greenhouse-table and a 404: no real violations. One real fix: the active filter chip's count failed contrast in dark mode (now mixed from the theme colours). Two non-issues recorded: the trip-stack caption text over a photo is flagged in light mode only because axe cannot see through the photo and its dark gradient; and the `page-has-heading-one` finding on detail pages comes from the content sitting in React's hidden streaming block until its swap script runs, which the hidden preview pane stalls (the served HTML does contain the h1; see Backlog). Production server answered 200 for real slugs and 404 for unknown ones.
- P.F. Chang's postcards (2026-10-13): `npm run content` passes (55 postcards, 7 places, 5 cafés); the gallery, a postcard page, the café page and the place page were checked in the browser, and all seven images load (200). See the gates line below for the build.
- Ratings and the guide card (2026-10-13): checked in the browser with temporary values (since removed): the café page (light, 375 wide: stacks, no overflow), a postcard back in dark mode. `rating` validation (0.5 to 5, half steps) added to the content check. Not checked: axe on these pages.
- Rating stars and map button (2026-10-13): checked in the browser on the café page in light, dark and at 375 wide (no overflow). Not checked: axe on the changed page, the rating on the café list card.
- Café page template (2026-10-13): checked in the browser at 1440 wide (light), 375 wide (dark, no overflow) and the "More cafés" strip; the gallery uses all four columns (2+2+2+1) with seven photos; an untouched tab's console had no errors or hydration warnings. Not checked: axe on the new layout, other cafés with a different number of details, a café with no map link or no rating.
- Daksina Bhawan and sample removal (2026-10-14): `npm run content` passes (16 postcards, 1 place, 2 cafés, no trips or stories); typecheck, lint, build (59 static pages), `npm audit --omit=dev` (0) and the secrets scan are clean; every main route returns 200 in dev and the café, home, Places, Trips, Stories and About pages were checked in the browser with the reduced content. Not checked: other widths of the new café page for six photos, the globe and map with only one place.
- New 404 page (2026-10-10): checked in the browser in light and dark at 1280 wide and in dark at 375 wide (no horizontal overflow). Not checked: axe, a real unknown URL on the deployed site (HTTP status), the ring animation under reduced motion.
- Itinerary route map (Japan) rendered with numbered stops and a dashed route; related postcards, postcard page and share-image metadata checked earlier.
- **Not yet verified:** axe on the new pages in light and dark; the rest of the light theme after the latest changes; mobile layouts of the map; search palette keyboard use; theme toggle persistence without flash; lightbox "More like this"; the real Supabase project. The production build ran before the final cursor tweak (CSS only); typecheck and lint were re-run after it and pass.

## Not verified (be honest)

- **LCP, INP and Lighthouse scores**: the embedded browser exposed no LCP entries. Run Lighthouse on the deployed site.
- Real devices, Safari, Firefox. Scroll-linked drift is progressive (Chromium and Safari 26+).
- Screen-reader testing, and `prefers-reduced-motion` was verified by reading the CSS and code paths rather than toggling the OS setting.
- Connection to the live Supabase project (no credentials available); the guest desk was verified against a stand-in server and an embedded Postgres only.
- Cold-start image optimisation time: the first request for each photograph encodes AVIF/WebP, then it is cached for 31 days.

## How to re-run

```bash
npm run typecheck && npm run lint && npm run build
npm audit --omit=dev
npm run content           # validate and regenerate the content data
```

Accessibility spot check in the browser console on any page: load axe-core from cdnjs and run `axe.run()`.
