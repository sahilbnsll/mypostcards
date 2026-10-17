---
title: Changelog
tags: [changelog]
updated: 2026-10-17
---

# Changelog

Newest first.

## 2026-10-17 (last): NY United Cafe
- New café **NY United Cafe** (ground floor, Tower B, M3M Urbana Business Park, Sector 67, Gurugram), with your map link, the usual order (walking taco and chai) and a rating of 4.3/5. New postcard "Samosa chaat, in a paper bowl". The two paintings from the office café ("A camera, a cup and an old newspaper", "A heart in the foam") now belong to it, still under Random clicks, and moved to `cafes/ny-united-cafe/`. The old `random-clicks/office-cafe/` folder is gone.
- The samosa chaat photo has no date (the file carries no metadata), so the postcard has none; the café's "Visited" date comes from the paintings (13 October 2026). Originals are in the git-ignored `private-originals/cafes/ny-united-cafe/`.

## 2026-10-17 (last): Nearby cities share an area name
- Delhi, Gurugram, Noida, Faridabad and Ghaziabad are grouped as **Delhi NCR** (plus a Mumbai region and a Bay Area), so the globe's postcard and the map pin say "Delhi NCR", and the list beside the globe shows "Delhi NCR, 22 postcards" with Gurugram and Delhi as links inside it. New optional `area` on a destination; `_regions` in `scripts/gazetteer.json`. Every city still has its own page and its place on the Places list.

## 2026-10-17 (last): Places and maps update themselves
- Places are now made from postcards: every `city` becomes a place with its postcards, cover, globe pin and map pin, so the Delhi postcards added Delhi automatically (Places went from 1 to 2). Coordinates come from the postcards, then `destinations.json`, then a new `scripts/gazetteer.json`; a postcard without coordinates sits at its place and hides the approximate coordinates on its back. A pin is named after every nearby place ("Gurugram, Delhi, India"); the globe's postcard shows one line per place, and the list beside it has one row per place (with its postcard count) that opens that place's page. [[09 Decisions]] D34.
- Cafés with a `city` attach to the matching place. The Gurugram description was refreshed. The build prints a note for any visited place it cannot pin.

## 2026-10-17 (last): A friend's drawing, with credit
- New Art postcard "Two figures in charcoal": a charcoal drawing by the author's friend Dr. Nishant (psychologist and artist), photographed in Delhi on 9 October 2026 (from the photo's own metadata). Photo in `art/`, original in the git-ignored `private-originals/art/`.
- New optional postcard field `artistUrl`: the back of a postcard shows the artist's name with a link to their page as `@handle` (here https://www.instagram.com/nishant.narratives/). Checked by `scripts/build-content.mjs` (must start with https://).
- Postcard titles in the narrower side column are one step smaller below 64rem, so a long word no longer breaks in the middle.

## 2026-10-17 (last): The emptiest metro, a story
- New postcard "The emptiest metro" (10 October 2026, kind City) with the first story on the site, **The emptiest metro**: the author's own account of crossing an almost empty Delhi Metro platform on the way from Delhi to Gurugram, plus context from the news. Photo in `city/` (cleaned, no metadata), original in the git-ignored `private-originals/city/`.
- Context checked against reports by The Daily Jagran and Republic (and search results from Business Standard and NewsBytes): the CJP protest at Jantar Mantar on 10 October; Delhi Police asked DMRC to close gates at 57 stations; DMRC cut that to 45; closures were due to end at 6 pm and were extended to 10 pm. The story says the gates were closed by DMRC at the police's request (not "the Delhi government").
- A postcard that has a `story` now shows a "Story" link on its back. The home page now shows "From the stories".

## 2026-10-17 (last): Two random clicks from the office café
- Added "A camera, a cup and an old newspaper" (an illustrated still life) and "A heart in the foam" (a painted latte), both from 13 October 2026, under Random clicks. Place is "The café at my office" with no city or coordinates (none were given, so they stay off the map). Photos in `random-clicks/office-cafe/`, cleaned (no metadata); originals in the git-ignored `private-originals/random-clicks/office-cafe/`. The second photo is small (322 by 536) and is shown as it is, not enlarged.

## 2026-10-17 (last): A shorter home page
- The home page "The collection" now shows 8 postcards instead of 16 (a few favourites from every kind and place), without the filter bar, and ends with a "View all 23 postcards" button that opens the gallery. The button is drawn as an airmail envelope (postcard-stock face inside the red, white and blue stripe), so it reads the same in light and dark mode. `balancedSample` also spreads picks across cafés and places within a kind. [[09 Decisions]] D33.

## 2026-10-17 (last): Daksina Bhawan usual order
- Added the usual order to Daksina Bhawan: benne dosa and filter coffee (shown on its café page and card).

## 2026-10-17 (late): Costa Coffee, Ambience Mall
- New café **Costa Coffee** (third floor, Ambience Mall, Gurugram) with four postcards from 14 October 2026: the mural wall, a close-up of the coffee mural, the serene caramel frappe and a slice of cheesecake. Your map link, the usual order (serene caramel frappe and cheesecake) and a rating of 4.5/5 with a line about the coffee, cheesecake and ambience.
- Photos are in `cafes/costa-coffee/` (cleaned, upright, no metadata); originals in the git-ignored `private-originals/cafes/costa-coffee/`. Café and pins use the same city-level Gurugram coordinates as the other Gurugram entries.

## 2026-10-17 (night): Two random clicks from Ambience Mall
- Added "Durga Maa, for Navratri" (a white and gold idol in a mall pandal) and "Flowers at the crossing" (a floral centrepiece), both from 14 October 2026, under Random clicks. Photos are in `random-clicks/ambience-mall/`, cleaned (upright, no metadata), originals in the git-ignored `private-originals/random-clicks/ambience-mall/`.
- Place is Ambience Mall, Gurugram, Haryana (from the author's address); the pin uses the same city-level coordinates as the other Gurugram postcards.

## 2026-10-17 (evening): Staircase photo replaced
- Swapped the Daksina Bhawan staircase photo for a new version and renamed the file to `wooden-stairs.jpg` so no cache (Next's 31-day image cache, browsers) keeps serving the old picture. The published copy was cleaned again (upright, no metadata, 1125 by 2000), and the raw file is kept in the git-ignored `private-originals/cafes/daksina-bhawan/`.

## 2026-10-17 (later): Photos filed by café and kind
- Moved every photo out of the flat `public/images/postcards/` folder into `cafes/daksina-bhawan/`, `cafes/pf-changs/`, `art/` and `random-clicks/`, with short names (`front-view.jpg`). The git-ignored `private-originals/` now mirrors the same folders, each original renamed `<shot>__IMG_nnnn`. No postcard slug or URL changed. [[09 Decisions]] D32.
- Added a "Finding things" section to the README (where photos and code live).

## 2026-10-17: Daksina Bhawan front view
- One more Daksina Bhawan postcard, "The carved front door" (taken 15 October 2026, date from the photo's own metadata). Published copy cleaned (upright, no metadata, under 2000px); the original is in the git-ignored `private-originals/daksina-bhawan/`. The café page now shows 7 postcards and "First visited 12 October 2026".

## 2026-10-14 (latest): Art and Random clicks
- Two new sections, `/art` and `/random-clicks`, linked from the footer's Explore list (the header is unchanged: [[09 Decisions]] D31). New category `random` ("Random clicks"). The house piece and its signed back are under Art; the lamp-lit pothos moved to Random clicks and was renamed `random-lamp-over-the-pothos`.
- Footer: the brand lockup is one line at the header wordmark's size, and the Explore list now includes Art and Random clicks (three rows of three on wide screens). A bordered postcard-back version was tried and dropped as it looked heavier than the rest of the site.

## 2026-10-14 (later): A new logo

- Replaced the green camera-stamp logo with an airmail postage stamp drawn from the site's own colours and stripe, plus a "my postcards" wordmark in the home title's face. Header, footer lockup, About seal, 404 seal, hero and postcard-back stamps, favicon, app icons and both share images all use it. [[09 Decisions]] D30, [[02 Design System]].
- Removed the old `--logo-*` and `--stamp-*` colour tokens and the traced mask files.

## 2026-10-14: Daksina Bhawan, ratings to one decimal, and the samples are gone

- **Daksina Bhawan** (South Indian restaurant, Sector 67, Gurugram) added as a café with six postcards (a dosa and five interior shots under the brass temple bells), your map link, and a rating of 4.8/5 with a line about the benne dosa, idli and filter coffee. A staff member in the staircase photo is softly blurred; originals are in `private-originals/daksina-bhawan/`.
- **Ratings take one decimal** (0.5 to 5, so 4.8 works). Each star is filled by the exact amount: a 4.8 is four full stars and a fifth filled to 80%.
- **All sample content removed** (48 postcards, 5 trips, 6 places, 4 cafés, 3 stories). The site now holds only the author's own 16 postcards, 1 place and 2 cafés; the Trips and Stories pages show friendly empty states. About and the home empty state no longer mention samples, and the Unsplash allowlist was dropped from `next.config.ts`. [[12 Sample Content and Credits]]

## 2026-10-13 (late): Art

- New kind **Art** (gallery filter) and an optional `artist` field, shown as "Artist" on the back of a postcard. Three postcards added: a miniature hill with a lit house by Aslam Khan, the signed back of the same piece, and a lamp-lit pothos (all 10 October 2026). Originals kept in the git-ignored `private-originals/art/`.

## 2026-10-13 (night): the café page as a template

- Café pages use a split header (text, details and guide on the left, the cover as a tilted print with a stamp and handwritten caption on the right), a derived "Visited" date, a gallery that fills every column, and a "More cafés" strip. Rating stars are hand-drawn and yellow, and the map link is a text link "Open in Maps". See [[07 Components]], [[09 Decisions]] D29.

## 2026-10-13 (evening): P.F. Chang's rated, redrawn stamps, a map button by the name

- P.F. Chang's is rated 4.5/5.
- The rating is drawn as five hand-drawn stars in marker yellow (earlier versions used miniature stamps, then clay stars) with the number beside them, and the line under it reads "Good food, good ambience, and a ceiling worth looking up at." The "Open on a map" link became an "Open in Maps" text link with an arrow in the details row beside the place link (Gurugram) and left the guide card, which is now compact when it holds little. See [[07 Components]].

## 2026-10-13 (later): Ratings, and the guide above the photo

- Cafés and postcards can carry your own rating (`rating`, 0.5 to 5 in half steps; cafés also `ratingNote`), drawn as five stamps. The café guide card moved above the cover photograph and was redesigned as a postal slip. See [[07 Components]] and `content/README.md`.

## 2026-10-13: The first real postcards

- Seven photographs from P.F. Chang's, Gurugram (6 October 2026) added with captions and handwritten notes, a café entry (with the map link) and a Gurugram place. The blossom-ceiling photo is featured, so it leads the gallery bento. Photos were cleaned (upright, 2000px, no GPS or device data); originals moved to the git-ignored `private-originals/`. See [[12 Sample Content and Credits]].

## 2026-10-11: Nine journal polish features

- **Loading skeletons**: postcard-shaped placeholders (`VisitorWallSkeleton`, `VisitorCardSkeleton`) with paper tint, dashed stamp outline, ruled lines, and shimmer sweep while Supabase loads. Added `src/app/visitors/loading.tsx` and wrapped home visitor wall in `<Suspense>`.
- **Footer upgrade**: added a 12-postcard thumbnail mosaic with hover tilts and spring animation, an `airmail-edge` visual divider, and links to socials (GitHub, Twitter / X, Instagram, personal site).
- **Card count badge**: section headers now support an optional `badge` prop; added "X cards on the wall" to the home visitors section and the `/visitors` wall.
- **Reading time estimate**: added a small "3 min read" glassmorphism postal pill on story cards (`StoryCard`, `StoryFeature`) and story page meta headers.
- **Related postcards**: story detail pages now show postcards matching both the trip and destination (deduplicated) under a "Related postcards" section with count badge.
- **Trip timeline**: for trips with multiple postcards, added a vertical "Travel diary timeline" (`TripTimeline`) showing entries in chronological order with date stamps, location tags, stamp watermarks, and handwritten notes (`--font-hand`).
- **Mood filtering**: `BloomGallery` now curates up to 6 prominent mood pills (`alps`, `lake`, `mountains`, etc.) without noisy hashtags or counters, keeping the interface calm and uncluttered.
- **Non-persistent search**: search bar in `BloomGallery` is now a quiet pill button by default; clicking it expands the search input with autofocus, and closing or pressing Escape collapses it back.
- **Sort options**: added a sort dropdown in `BloomGallery` supporting Default order, Newest first, Oldest first, and By place (A–Z).
- **Stats bar**: added `<StatsBar>` horizontal strip under the hero showing `48 postcards · 6 places · 5 trips · 3 stories` with quick-nav links.

## 2026-10-10 (night): New 404 page

- The "page not found" screen is redesigned from the 404 reference: tilted postcard, turning seal, cancellation waves, personal copy, back button and search hint. Works in light and dark and on phones. [[07 Components]].

## 2026-10-10 (evening): The logo

- The author's logo is now the brand across the site: header stamp and serif wordmark, footer lockup, About-page seal, favicon, Apple icon, installable-app icons, a default share image and the postcard share image. Dark theme gets its own light colours. [[09 Decisions]] D28, [[02 Design System]].
- Descriptor changed from "A travel photo journal" to "Postcards from Sahil" (`siteConfig.descriptor`: footer, About seal ring, default share image).
- The red decorative stamp on the hero cards and the blue one on postcard backs are now the logo stamp, drawn like a real one (paper edge, graded window, inset line, sun-and-peaks lens, cancellation waves), with a light and a dark palette (`--stamp-*` tokens). The "page not found" screen shows the full mark.
- Postcard postmark: a stand-in photograph now says "someday" instead of "sample" (the line under the facts still says it is a sample and not from my travels); real ones show the year or "kept". The postmark sits clear of the stamp.
- Dark mode: the hero postmark was invisible over the cream print and the photo; it is now brown ink in light mode and a deep-green seal with sage ink in dark mode.
- Privacy line under the card form no longer says cards are read before they appear.

## 2026-10-10 (later): No approval step, new header

- Visitor cards go live straight away; `approved` is replaced by `hidden` (take one down in the dashboard). A new card refreshes the wall at once. Schema upgrades an earlier table safely. [[09 Decisions]] D26, [[06 Supabase Setup]].
- Header redesigned after the navigation reference: plain links with a thin underline that sweeps in, small line icons on wide screens, quiet search and theme buttons, frosted bar on scroll, wordmark never wraps, mobile menu with a hint under each page. (A first tray-and-pill version was rejected and replaced.) D27, [[07 Components]].

## 2026-10-10: Dark colours, postcard map pins, round cursor, visitors always visible

- Dark page background now matches the footer (`#070b14`); wells and cards re-stepped (`#101827`, `#1a2338`).

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
