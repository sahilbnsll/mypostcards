---
title: Decisions
tags: [decisions]
updated: 2026-10-13
---

# Decisions log

Newest first. Format: decision, why, trade-off.

### D29. The café page is a template: split header, derived date, shortest-column gallery, "More cafés"
- **Why:** the old page was a text column on the left, a card, then a wide photo, leaving the right side empty, and the gallery left a whole column empty when a few photos were tall. The split header uses the width (text and guide beside a postcard-style cover), the visit date and next cafés come from existing data with nothing extra to type, and the gallery deals photos into the shortest column. Everything is automatic from the entry in `content/cafes.json`.
- **Trade-off:** the gallery markup is rendered once per column count (hidden copies are `display: none`, so their lazy photographs are never fetched), which makes the page HTML larger. The wide cover stays on trips, places and stories; moving them to the split header would be a separate decision.

### D28. The logo is traced to vectors in two theme-aware layers; the site palette is unchanged
- **Why:** the author's logo sheet is a raster image (1024px, cream paper texture). Cropping it would blur on retina screens, show a cream box on the dark theme and ship a large PNG. Tracing the stamp into green and clay layers gives sharp vectors, themed colours (sage and light clay on dark) and about 16 KB as cached static files used as masks. Thin camera lines vanish below about 60px, so the header and favicon use a bolder hand-built stamp from the same design (the sheet's own "small stamp" and "app icon" variants). The round seal is rebuilt as live SVG text.
- **Trade-off:** the logo's green and clay sit beside a blue-grey, airmail-red site. Re-theming the whole site to the logo palette is a bigger, separate decision ([[10 Backlog]]). The giant hero wordmark is still the sans display face.

### D27. Header: plain links with a sweeping underline, small line icons, quiet actions, frosted bar
- **Why:** from the navigation reference (`navigation-menu-05`): icon and label, generous spacing, nothing boxed, a 2px underline that scales in on hover and focus and stays under the current page. A first attempt (links in a tray with a sliding pill, an outlined Search button with a key hint) looked busy and was rejected. Now: the underline sweeps in from the left and leaves to the right; icons (a set of seven thin-line drawings, no icon library) show from 75rem up, where there is room; Search and theme are quiet icon buttons; the bar turns to frosted glass once the page moves; the mobile menu gives each page a few words of context. The sliding-highlight script was removed, so the desktop nav is pure CSS.
- **Trade-off:** no animated highlight travelling between links; the "/" shortcut is not advertised in the header (it still works and is announced to assistive tech).

### D26. Visitor cards are public immediately; the owner hides, not approves
- **Why:** the owner will not check the dashboard regularly, so an approval queue would leave visitors' cards invisible forever. `approved` became `hidden` (default false). A sent card expires the wall's cache so it shows at once.
- **Trade-off:** nothing is reviewed first. The only gates are the honeypot, minimum time, link rejection, plain-text/SVG rendering and the database rate limits (3 per hour and 8 per day per visitor, 40 per hour overall). A determined person could still post something unpleasant for a while; the fix is to tick `hidden` or delete the row. If that becomes a problem, restore approval or add a report button ([[10 Backlog]]).

### D25. A custom round cursor, for a mouse only
- **Why:** from the cursor reference: a white circle with `mix-blend-mode: difference` that eases after the pointer. Built ref-driven (no re-render per move). The blend sits on the fixed outer layer (on an inner element it does not blend and shows as a solid white disc). Over buttons and links the circle becomes a ring, so the control and its hover colours stay visible in light and dark; it shrinks on press.
- **Guard rails:** only when `(hover: hover) and (pointer: fine)`; reduced motion removes the trailing; the real cursor stays over form fields, the drawing pad and any open dialog (the top layer sits above the circle); keyboard focus is untouched.
- **Trade-off:** a hidden native cursor is a usability cost for some people; to remove it, delete `<Cursor />` from the layout.

### D24. Map postcards are spread apart on the server and tied to their place by a thread
- **Why:** pins as postcards overlap where places are close. A small relaxation pass (pure arithmetic, no client code) pushes overlapping cards apart, with a weak pull back toward each card's own spot; a thin line and a dot mark the real position. World pins are also thinned to one per ~7 degrees. Labels sit below the card so they cannot clip at the top edge.
- **Trade-off:** card size is assumed in map units (about 5% of the width; 8.5% on route maps), so on very narrow screens the cards are relatively larger and can still touch (hover or focus raises one).

### D23. Dark theme: two identical token blocks, light "physical" surfaces, fixed light text on photos
- **Why:** an explicit choice (`data-theme`, set before first paint) plus a no-JS system-preference fallback means the same values twice; keep them identical. Prints, polaroids and stamps use `--print` so they stay light like paper; text on photos uses `--on-photo` so it stays readable whatever the theme.
- **Trade-off:** one more pair of tokens to remember; panels still use `--card`, which flips.

### D22. Postcard pages, related postcards, search, flat map and planned places added
- **Why:** each photo gets a linkable page and a share image (`opengraph-image` with `"use cache"` so they prerender); related postcards score trip, café, place, tags and category; search is a static index plus a client palette; the flat map is server-drawn SVG (`d3-geo`, `world-atlas`) so it needs no tile service or key; planned places make a "dreaming of" list.
- **Trade-off:** more static pages (134) and a few small dependencies; the search index grows with the content.

### D21. Itineraries and café guide fields are optional data, shown only when provided
- **Why:** nothing is invented. A stop shows only what was filled in; a café shows price, seat, wifi or a map link only when given.

### D20. The guest desk: visitor cards, protected in the database (approval removed by D26)
- **Why:** visitors can draw or type a card. All writes go through `submit_visitor_card()` with validation and rate limits; RLS lets the anon key read only visible rows and public columns. Drawings are stroke data rendered as SVG paths, never HTML. The page works without Supabase as a preview ("being set up").
- **Trade-off:** Supabase Free pauses after a week idle ([[10 Backlog]]).

### D19. Content moved from Supabase into the repository; Supabase is for visitor cards only
- **Why:** the author edits the gallery by committing files, photos live in the repo, nothing needs an upload script, no keys are needed to build, and the free-plan limits (storage, pausing) stop mattering for content. Validation moved into `scripts/build-content.mjs`, with clear errors.
- **Trade-off:** adding a postcard is a commit and deploy instead of a dashboard edit; repo size grows with photos (keep them near 2400 px).

### D18. Photo hosting recommendation: Supabase Storage plus a local upload script (superseded by D19)
- **Why:** keeps all content in one place and makes adding a postcard a one-command job (resize, strip EXIF, read date/GPS/camera, upload, insert the row) with no commit or deploy. See [[06 Supabase Setup]] for the limits behind it.
- **Trade-off:** 1 GB storage cap, the one-week pause on free projects (needs a keep-alive cron), and a local script that holds the service-role key.

### D17. Mobile menu animates with CSS enter/exit transitions, not keyframes
- **Why:** keyframes could not animate the dialog out (it vanished) and the backdrop popped while the panel faded. `@starting-style` plus `allow-discrete` gives matching enter and exit, is interruptible, and needs no timers. Opened in the tap handler so it starts on the next frame; page scroll is locked while any modal is open.
- **Trade-off:** browsers without `@starting-style` or `allow-discrete` show and hide it instantly (still fully usable).

### D16. The two gallery references became a bento on /gallery and a spread on About
- **Why:** the bento adds the editorial "varied rhythm" the masonry alone lacks and gives /gallery a curated opening; the spread gives the otherwise text-only About page a tactile image. Both reuse existing pieces (lightbox, `DeckDrag`) instead of adding Radix, framer-motion or shadcn.
- **Trade-off:** the five selected photos also appear in the full gallery below (intentional). The bento's black and white default means colour only on hover or touch, which is why the "Selected" intro says so.

### D15. Zoom parallax uses CSS scroll-linked animation, not framer-motion and Lenis
- **Why:** Lenis replaces native scrolling with a smoothed version, which conflicts with the no-scroll-hijack rule; framer-motion would be a heavy dependency for one effect. `view-timeline` does the same job with no JS.
- **Trade-off:** wide screens with motion allowed in supporting browsers only; elsewhere a static grid. The animation range assumes a 250svh section (28.57% to 71.43% of the cover range); change both together.

### D14. Globe is a client island with a visible place list beside it
- **Why:** the globe is a picture of the same information as the list; the list is the accessible and no-WebGL version. Auto-rotation has a pause button and honours reduced motion.
- **Trade-off:** CSS Anchor Positioning is not everywhere, so polaroids are hidden where unsupported (pins and list remain). Adds the `cobe` dependency.

### D13. A missing Supabase table is a setup state, not a build failure
- **Why:** Vercel's first deploy failed because env vars were set before `schema.sql` was run, and the data layer threw. Treating `PGRST205`/`42P01` as "empty journal, warn loudly, re-check every minute" lets the deploy succeed and the site fill in once the tables exist.
- **Trade-off:** a forgotten schema now yields a live but empty site instead of a failed deploy; the build-log warning and the empty-state copy point at the fix. Every other error still fails loudly.

### D12. `[slug]` pages use Suspense with a skeleton; header and footer do not
- **Why:** with Cache Components, unknown slugs get an app shell. Without a Suspense boundary the shell was empty and the page rendered only in the browser, which defeats adding rows in Supabase without a rebuild. With it, new slugs server-render and stream.
- **Trade-off:** React moves large boundaries out of line, so on big detail pages the content arrives in a `<template>` swapped by a script. Known pages are fully in the HTML; nothing relies on the swap for metadata. Header and footer were taken out of Suspense after we saw large pages hide them in templates.

### D11. Lightbox closes by syncing state directly, not via the `close` event
- **Why:** some embedded browsers never fire `close` on `<dialog>`; relying on it left stale hash and scroll lock.
- **Trade-off:** `close` is still wired as a fallback, so the handler must be idempotent (it is).

### D10. Scroll reveals via a tiny controller, marked `suppressHydrationWarning`
- **Why:** hiding only below-the-fold elements after hydration keeps everything visible with no JS or reduced motion, with no animation library.
- **Trade-off:** the controller mutates attributes React owns, so elements opt out of the hydration warning through `reveal()`.

### D9. Dropped Bricolage `opsz` and Newsreader `opsz` axes
- **Why:** preloaded fonts went from about 400 KB to about 200 KB.
- **Trade-off:** slightly less refined optical sizing at extreme sizes.

### D8. Whole journal as one cached query, sliced in memory
- **Why:** single creator, hundreds of rows; one round trip and trivial selectors.
- **Trade-off:** does not scale to thousands of postcards. Switch to paginated queries then.

### D7. Slugs are primary keys in Supabase
- **Why:** hand-entry in the Table Editor, readable URLs and relations.
- **Trade-off:** renaming a slug changes a URL (FKs cascade, but links break).

### D6. Sample photographs: Unsplash CDN, neutral captions, no dates, `is_sample` everywhere
- **Why:** user asked for relevant, non-broken imagery without implying it is their travel history. Unsplash's website is behind a bot check (not scraped); the image CDN was probed with candidate IDs and visually reviewed on contact sheets.
- **Trade-off:** photographer names are unknown, so credit is "Unsplash". Hot-linked, not self-hosted (see [[10 Backlog]]).

### D5. Hash-based photo deep links (`#p=slug`)
- **Why:** shareable photos without server routes or intercepting routes; works with a static page.
- **Trade-off:** a photo URL is not crawlable as its own page. Trips and places are the indexable units.

### D4. Gallery filter dims instead of hiding
- **Why:** keeps the layout stable (no shifts), keeps all photographs reachable, and makes the colour-bloom reference work.
- **Trade-off:** the filter does not shorten the page. The lightbox steps only through the matching set.

### D3. No animation library; CSS, WAAPI, one rAF pendulum
- **Why:** the stack already covers it; avoids `framer-motion` weight. See [[03 Motion System]].

### D2. Rejected the virtual-scroll hero and the endless 3D corridor from the reference
- **Why:** wheel `preventDefault` hijacks scrolling; the corridor is constant ambient motion. See [[02 Design System]].

### D1. Kept the existing stack, replaced the scaffold UI
- **Why:** Next 16 + CSS Modules + TypeScript was already chosen; the scaffold's pages were placeholder. The old scaffold was moved aside (not deleted) and replaced. Added one dependency (`@supabase/supabase-js`), because the data lives in Supabase.
