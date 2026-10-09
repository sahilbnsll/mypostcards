---
title: Quality and Verification
tags: [quality]
updated: 2026-10-09
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

## Not verified (be honest)

- **LCP, INP and Lighthouse scores**: the embedded browser exposed no LCP entries. Run Lighthouse on the deployed site.
- Real devices, Safari, Firefox. Scroll-linked drift is progressive (Chromium and Safari 26+).
- Screen-reader testing, and `prefers-reduced-motion` was verified by reading the CSS and code paths rather than toggling the OS setting.
- Connection to the live Supabase project (no credentials available).
- Cold-start image optimisation time: the first request for each photograph encodes AVIF/WebP, then it is cached for 31 days.

## How to re-run

```bash
npm run typecheck && npm run lint && npm run build
npm audit --omit=dev
npm run seed:sql          # then diff supabase/seed.sql if sample.ts changed
```

Accessibility spot check in the browser console on any page: load axe-core from cdnjs and run `axe.run()`.
