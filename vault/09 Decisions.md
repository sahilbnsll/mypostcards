---
title: Decisions
tags: [decisions]
updated: 2026-10-18
---

# Decisions log

Newest first. Format: decision, why, trade-off.

### D43. The Ujjain trip: what is measured, what is inferred
- **Why:** 38 photographs and 8 videos from a family trip (one video was later deleted at the author's request, and one more photograph, a closer portrait on the Mahakal Lok bench, was added) (25 to 27 January 2026) arrived with a few stories from the author (the banyan Parvati is believed to have planted, the crowd on the long weekend, eight people in one auto, a dip in the river). Everything else had to come from the files and the web. **Times** are the photographs' own (EXIF, local = the stored UTC digits plus 5:30). **Places** are the photographs' GPS, which OpenStreetMap names: Ram Ghat, Mahakaleshwar, Siddhavat (Bhairavgarh), Kaal Bhairav, Barwaha, Omkareshwar and Mahakal Lok. **Facts** (Mahakaleshwar is the only south-facing Jyotirlinga; Mahakal Lok is about 900 m long and opened on 11 October 2022; alcohol is the offering at Kaal Bhairav; the Siddhavat legends) come from the web, and where sources disagree (the number of statues, the distance to Omkareshwar, which bank Mamleshwar is on) the text says so or leaves it out. The postcards carry their own GPS rounded to about 100 m, except the guesthouse courtyard photograph, which has none published.
  **Inferred, and flagged to the author:** the videos have no GPS and their file dates are when they were saved, not filmed (the Omkareshwar clips are dated the morning of the 27th, when the photographs put the group in Ujjain), so they are filed by what they show and by the day; the river video is placed at Barwaha (the clip's time is 1:39 pm, half an hour before the Barwaha photographs, and Barwaha is about 11 km from Omkareshwar) although the author said "near Omkareshwar"; the lane video is placed "on the way to Kaal Bhairav" from its time alone; two mirror selfies have no time or place, so they sit in a final "More photos" group instead of being given a day. The river video was stored on its side (its rotation flag disagreed with its content) and was re-encoded upright. Notes use only the photographs' times and the researched facts, plus what the author said. The three stories were written from the same material and need the author's review.
- **Trade-off:** a few notes are plain facts and times, not the author's own words, and the file layout (`public/images/trips/ujjain/<place>/`, videos in `videos/`) follows the Kasol trip. The 4K Kaal Bhairav clip came out very small (375 KB) because the scene is dark, but plays fully.

### D42. The itinerary and its map are one interactive thing
- **Why:** the itinerary was a long list with a map pinned beside it that did not respond to it. Now `ItineraryExplorer` (client) drives `LiveRouteMap`: **day buttons** (All days, Day 1 to 4) show one day at a time and fit the map to that day's route with the other days faded; on a wide screen the stop the reader has reached is **lit on the map** (larger photo, red ring) and the map can **ease along with the scroll** (a visible switch, off to start with reduced motion); **pointing at a stop previews it** on the map without moving it; **a stop's number is a button** that shows it on the map even with following off; **a marker on the map** takes you to its stop (switching day if that day is hidden). The reader is "on" the last stop whose top has passed a line 40% down the screen, worked out from positions on every scroll event, so a quick scroll cannot skip a short stop (a first version using an intersection band skipped stop 12). Choosing a stop scrolls to exactly that line so the choice stays lit, and the scroll tracking stands down for 1.6 s while the page is moving there. After choosing a day the map shows the whole day first and following resumes when the reader scrolls on.
  Every stop now has a point on the map except the drive from Jaipur (14 stops: the Jispa evening became "Golden light near Darcha" and "Blue hour in Jispa", and the Jispa morning and the Sissu waterfall got their positions). Photos that would sit on top of each other (the three at Jispa) are **fanned out sideways** at the current zoom and settle as the map zooms in; each stop's exact spot is a red dot drawn on the map itself.
- **Trade-off:** the tracking only runs from 62 rem up, where the map is beside the list; below that the list is a plain list and the map sits above it. Stop 6 (Manali and the Atal Tunnel) is a named dot because there is no photograph from that morning. The page is heavier on the client (a day state, a scroll listener, map effects) than the old static list; the list itself is still rendered on the server and the drawn map is still the fallback.

### D41. The trip diary is a compact day-by-day sheet, not one card per postcard
- **Why:** the "Travel diary timeline" gave each of 27 postcards a card of its own (about 16,000 px of scrolling, and the same 27 postcards again in a gallery below). It is now `TripDiary`: one panel per day, a date slip, day number and place on the left that stays in view while the day's small prints go past, a dashed spine that is drawn over in red as each day scrolls through (CSS scroll-driven animation, a static line without support or with reduced motion), and every print in one grid with its handwritten title. A print opens the existing viewer (arrows step through the diary, the note and details are on its back, `#p=` links work). All 27 postcards fit in about 2,000 px on a desktop and 4,000 px on a phone. The duplicate gallery on the trip page was removed (it remains only for a trip with a single postcard). The author's reference (a sticky date column with a progress line and a large picture per entry) was borrowed from, not copied: large entries would have made the page longer, and its ruled-box look is not this site's paper and airmail look.
- **Trade-off:** a postcard's caption and note are not on the page until it is opened (the grid shows only the title), and the diary is a client component because it holds the viewer.

### D40. The globe: a dot for every place, one postcard per state, and a hover that holds it still
- **Why:** `globePins` merged everything within 20 degrees into one pin, so all of India was one dot and one photo. The author wanted the globe to show where they have been, without the zoom of the first attempt (reverted), with small postcards on the globe, no place name under them, and a hover or tap that stops the globe and lifts that postcard. Eleven postcards on a globe whose Himalaya places are a few pixels apart could not be laid out well, so the author suggested going state by state. Now: every visited place keeps a plain red dot (`globePlaces`), and there is **one small postcard per state** (`globeGroups`: Himachal Pradesh, Haryana, Rajasthan, Uttar Pradesh, Delhi) showing the photo of its biggest place and its postcard count. cobe already makes a real element for each marker, so the component reads each dot's position and visibility every frame and lays the postcards out itself (`arrange()`): each hangs outside its places, away from the globe's middle; two never touch; none covers any dot; all stay inside the globe's box; positions carry over from frame to frame so they glide as it turns. Pointing at a postcard or any of its dots (or tapping, on touch) stops the rotation, lifts that postcard (about 1.4 times, red ring, on top), steps the others back, rings every dot of that state, names the state on a small paper slip and draws one dashed red arc from the postcard to its places. Escape or a tap on the globe lets go. Resting state has no lines at all: a first version with a thread from every postcard to its dot looked like tangled hairs and was removed.
- **Trade-off:** the postcards and dots are a pointer enhancement. They are hidden from assistive technology and not focusable, because the list of places beside the globe is the accessible version (as before). A state with several places has a postcard that does not link (it would have to choose one place), so the list and the live map carry the links; a one-place state links to its place. The Himalaya dots are still a tight cluster on a globe, and the arrangement is computed in script every frame (cheap: 5 cards, 11 dots). States come from each place's `region`, so a new place needs one (Gurugram and Delhi were filled in). Not verified: Safari, a real touch screen.

### D39. Positions come from the photographs' own GPS and OpenStreetMap, and the Places map shows every place
- **Why:** the author asked for postcards to be on their correct locations, and for the Places page to show where they have been (the globe merges all of India into one dot and was left alone). Each place's coordinates were checked against OpenStreetMap (Nominatim) and the photographs' GPS was read from the originals in `private-originals/`. Findings: Kasol, Manikaran, Manali and the pass were within about 300 m; Sissu was 2 km off and Jispa 1 km, and Jaipur's centre point about 3 km (all corrected). The GPS also showed that **the three "Baralacha La" photographs were taken on the road to Shinku La** (4,034 m, 4,186 m and 4,877 m; the last about 2 km below the 5,091 m pass), 15 to 30 km from Baralacha La, so that place, its postcards, folder and trip stops are now "Shinku La". The bike photo (18 May, 5:29 pm) is at Koshla in Manali and the roadside photo in Solang Valley (so both moved out of the Parvati valley, and "Manali" became a place), the Jägermeister photo is at the north end of the Atal Tunnel beside the flag photo (so it moved from Kasol, 18 May, to Sissu, 19 May), the first morning photo is about 15 km before Kasol (the phone's own margin there is 1.4 km), and the camp is about 3 km west of Kasol village. Trip postcards now carry their own coordinates (rounded to about 100 m); stops use where their photographs were taken.
  The Places page "On the map" is now `LivePlacesMap`: real map tiles, one marker per place with its photo and postcard count, and towns that would sit under each other (within 52 px) merged into one marker named by their area (Delhi NCR, Parvati Valley) or "N places", which zooms in when clicked. The globe and the drawn world map are unchanged and remain the fallback.
- **Trade-off:** photographs' coordinates are published rounded to about 100 m, which shows the position of a tent camp on the back of its postcard; the exact originals stay private. One postcard has no GPS (the first morning video, which sits with its place), and the roadside photo has a position but no time, so its date (18 May) is still a guess. Phone GPS can be wrong by a kilometre or more indoors or in a valley (the first photo says so itself), so a coordinate is evidence, not proof.

### D38. The trip route map is a live OpenStreetMap map, with the SVG map as fallback
- **Why:** the server-drawn route map had no streets, rivers or place names, so a route such as Kasol to Shinku La was a dashed line on a plain grey shape. The author's portfolio already uses MapLibre GL with OpenFreeMap tiles (OpenStreetMap data, no account or API key), so the trip page now does the same: `LiveRouteMap` loads `maplibre-gl` only when the map is near the screen, draws the route as a dashed line, and puts each stop on its spot (a postcard with its number, or a numbered dot with the stop's name). The server-drawn `SvgMap` stays underneath as the space-holder, the loading picture and the fallback (no WebGL, blocked tiles, JavaScript off). Scrolling the page does not zoom the map (ctrl or two fingers does), and the map re-fits when its box changes until the visitor moves it. The base style is OpenFreeMap "positron"; in the dark theme the map canvas is inverted by CSS and the markers are not.
- **Trade-off:** it adds about 200 KB (gzipped) of JavaScript and the map CSS to the trip page, and the tiles come from a third party (OpenFreeMap, which asks for the credit that the map shows). The Places world map is still the SVG one. `maplibre-gl` must be 6.14 or later (5.x has a critical XSS advisory, GHSA-jrc7-96c5-q579). The library cannot find its web worker under Turbopack, so `LiveRouteMap` points it at `maplibre-gl-worker.mjs` with `setWorkerUrl(new URL(...))`; the build emits it as a static file (checked in dev and in `next start`). The dark map is an inverted light map, so its colours are approximate.

### D37. Postcard videos are small silent clips that play on their own
- **Why:** the author sent short phone clips (up to 88 MB, 4K HEVC) and asked for them with no sound and playing without a click. Each is re-encoded to a 720 by 1280 H.264 MP4 of 3 to 4.5 MB with **no audio track**, plus a poster frame that is the postcard's `image` (so the grid, search and share image work as before). A postcard gets a `video` field (a path in `public/images/`); `PostcardMedia` plays it muted, looping, with controls, and starts it when the postcard page or lightbox opens. With `prefers-reduced-motion` it shows the poster and waits for play. Gallery tiles show a small play mark and say "video" to screen readers. The raw clips (with GPS) are in the git-ignored `private-originals/`.
- **Trade-off:** no ffmpeg or other install was allowed, so the re-encode ran in the preview browser (canvas and `MediaRecorder`) at about 3 Mbit/s with no quality tuning, and the files are not fast-start optimised. The clips are served from `public/` by the CDN, not a video host, so keep them short. Autoplay is on because the author asked for it; it is the one place the site moves on its own, and it is silent and respects reduced motion.

### D35. The 88 MB video is not published (superseded by D37)
- **Why:** the Kasol clip (`IMG_2041.MOV`) is 5.1 seconds long but 88 MB (HEVC, taken on 17 May 2026 at about 5:47 pm). GitHub warns above 50 MB and refuses 100 MB, Vercel would serve it uncompressed, most browsers cannot play HEVC in a .mov, and the site has no video player yet. It is kept in the git-ignored `private-originals/trips/kasol-to-jispa/`. Doing it properly needs a small H.264 MP4 (about 2 to 3 MB for 5 seconds), a poster frame, and a `video` field on postcards with a muted, controls-visible player that respects reduced motion.
- **Trade-off:** the video was missing from the trip for a while. It is published now, see D37.

### D36. Route maps zoom to the route
- **Why:** a fitted map never zoomed closer than a 10 by 6 degree region (so two stops in one city still showed where in the world they were). A real route such as Kasol to Shinku La (about 100 km long) was bunched into one corner with its photo pins on top of each other. Now a route whose stops are 0.25 degrees or more apart is shown at its own size, and a mostly north-to-south route gets a taller map; stops that are really close together keep the wide view.
- **Trade-off:** at a very tight zoom the country outlines are out of sight, so inland routes show a plain map with the route line and photo pins.

### D34. Places and map pins are derived from postcards, not listed by hand
- **Why:** `destinations.json` listed only Gurugram, so new postcards from Delhi (and anywhere else) never reached the Places page, the map or the globe. Now the build creates a place for every postcard `city`, finds its coordinates (postcards, then the place entry, then `scripts/gazetteer.json`), and gives a postcard that has none its place's coordinates, marked approximate. Cities that sit next to each other are grouped into a named area (`_regions` in the gazetteer, or `area` on a destination), so a pin on the globe or map is called "Delhi NCR" rather than listing cities; a pin that covers places with no named area is named after all of them.
- **Trade-off:** a new city without coordinates anywhere is listed but not pinned (the build says so), and cities near each other share one pin on the world map (named by their area, which is configured by hand for now). The gazetteer is a small hand-kept list rather than a geocoder, because the build has no network. `destinations.json` still wins when it names the city.

### D33. The home page shows eight postcards, then a button to the gallery
- **Why:** the "collection" section on the home page listed up to 16 postcards with filters, which made the page very long as the journal grew. It now shows 8, chosen by `balancedSample`: turns across categories (so every kind appears), and within a kind across cafés, trips and places (so one spot does not fill it), featured first. A "View all N postcards" button leads to `/gallery`, which keeps the filters, tags and search. The home preview has no filter bar.
- **Trade-off:** the preview is a fixed size, so it stays short however many postcards there are, but a visitor has to go to the gallery to filter. The footer mosaic uses the same selection.

### D32. Photos are filed in folders by what they belong to
- **Why:** one flat `public/images/postcards/` folder with prefixes in the names (`daksina-`, `pf-changs-`) made it hard to see what belonged to what. Now each café has a folder (`cafes/daksina-bhawan/`), and art and random clicks have theirs, with short names inside. `private-originals/` mirrors the same folders, and each original is renamed `<shot>__IMG_nnnn` so it traces back to its published copy.
- **Trade-off:** the folder is part of the photo's address (`/images/cafes/pf-changs/two-drinks.jpg`), so moving a photo means updating its entry in `content/postcards.json`; the build stops with a clear message if they disagree.

### D31. Art and Random clicks live in the footer's Explore list, not the header
- **Why:** the header already carries seven links plus search, theme and menu, and two more would crowd it. They are also smaller sections than Gallery or Cafés. They are listed after Cafés in the footer's Explore list (`siteConfig.collections`, merged in `Footer.tsx`), are filter chips in the gallery, show up in search, and have their own pages (`/art`, `/random-clicks`). "Random clicks" is a real category (`random`) rather than a tag, so it filters like every other kind. The lamp postcard moved there and was renamed `random-lamp-over-the-pothos`.
- **Trade-off:** less discoverable than a header link, and the mobile menu does not list them. Promote one to the header if it grows.

### D30. A new logo drawn from the site's own design language (replaces D28)
- **Why:** the first logo (a green camera stamp traced from an AI-generated sheet) did not belong to the site: its green and terracotta appeared nowhere else, and its serif wordmark clashed with the heavy lowercase title on the home page. The new mark is a perforated airmail stamp whose frame is the site's own red-white-blue stripe, with a night window and a dusk landscape, next to a "my postcards" wordmark set exactly like the home title. One drawing (`stampGeometry.ts`) feeds every use, so the favicon, icons, header, footer, seal, hero stamps and share images can never drift apart.
- **Trade-off:** the stamp's colours are fixed rather than themed, so on a dark page it keeps its cream paper edge (a stamp is paper); the wordmark and waves follow the theme. The old green and clay tokens and the traced mask files were deleted.

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
