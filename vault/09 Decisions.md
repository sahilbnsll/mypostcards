---
title: Decisions
tags: [decisions]
updated: 2026-10-09
---

# Decisions log

Newest first. Format: decision, why, trade-off.

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
