---
title: Components
tags: [engineering, components]
updated: 2026-10-10
---

# Components

Server components unless marked **client**. Styles are co-located CSS Modules.

## Layout

| Component | Notes |
|---|---|
| `Header` **client** | Fixed bar; wordmark with a CSS-drawn stamp; sliding underline; opaque after scroll (IntersectionObserver sentinel); below 62rem a **Menu** button opens a modal `<dialog>` with staggered links. The menu is tied to the pathname it was opened on, so navigating closes it without an effect |
| `Footer` | Night-blue, airmail edge on top, nav links, credit line, and the sample-content notice when any sample row exists |

## Primitives (`ui/`)

| Component | Notes |
|---|---|
| `Photo` | `next/image` in a frame with reserved ratio (`--photo-ratio`) and average-colour placeholder. Props: `sizes` (required), `priority` (high fetch priority), `eager`, `ratio` override, `position`, `decorative` |
| `Stamp`, `Postmark` | Decorative SVG; unique ids via `useId` |
| `PageHead` | Title, lede, back link |
| `CollectionHero` | `PageHead` + facts row + wide cover with drift |
| `SectionHeader` | Heading, intro, optional action link, text reveal |
| `Prose` | Renders plain text with blank-line paragraphs and `## ` subheadings |
| `EmptyState` | Airmail-edged card with title, body, optional link |
| `DetailSkeleton` | Fallback for `[slug]` pages |
| `MotionController` **client** | Releases `[data-reveal]` elements on scroll; no-op under reduced motion |

## Features

| Component | Notes |
|---|---|
| `DeckDrag` **client** (renders nothing) | Mouse/pen dragging for the hero cards: pointer events on `#hero-deck`, move and up on `window` for the length of a press, clamps to the table, raises the card, swallows the click after a real drag. Not for touch |
| `Hero` | Five postcards in art-directed slots (each slot crops to a fixed ratio), one stamp and one postmark, giant wordmark, count line, scroll cue. First card is the high-priority image. Links deep-link to `/gallery#p=slug`. Empty state when there are no postcards |
| `BloomGallery` **client** | Category chips (radiogroup, arrow keys), live status, CSS-columns grid with true ratios, bloom filter, hover caption, lightbox. `filterable={false}` for trip/place/café/story pages; `stickyFilters` on `/gallery` |
| `Lightbox` **client** + `useLightbox` | Native dialog; FLIP open; arrows, swipe, buttons; wrap-around; neighbour preloading; postcard-back metadata panel; hash deep link; focus returns to the opener |
| `PrintCarousel` **client** | Pegged prints on a string; native scroll-snap; pendulum swing; mouse-drag; back/forward buttons with edge states; opens the lightbox |
| `TripCards` | Focus-card grid (used on `/trips` and place pages) |
| `TripStack` | Sticky stacking cards for the home page's featured trips; whole card is a link; text on a scrim |
| `GlobePostcards` **client** | cobe globe with pins and anchored polaroids; drag to turn; pause button; WebGL failure hides it; reduced motion holds it still |
| `PlacesGlobe` | Globe plus the visible list of pinned postcards (links to `/gallery#p=slug`); on home and `/destinations` |
| `ZoomGallery` | Seven-photo collage; scroll-linked zoom on wide screens, a plain columns grid elsewhere. Needs exactly 7 postcards |
| `FeaturedBento` **client** | Five selected postcards in a bento on `/gallery`; opens the lightbox for just those five (no hash sync, so it never fights the main gallery) |
| `PhotoSpread` | Five postcards in an overlapping row that springs apart on scroll; reuses `DeckDrag`; used on About |
| `PlacesIndex` | Typographic list with a sliding print |
| `StoryFeature`, `StoryCard` | Home feature and list cards. `as="h2"` on index pages for correct heading order |
| `CafeCard` | Photo, name, location, vibe tags, usual order |
| `StatsBar` | Scale indicator under the hero: horizontal paper strip displaying postcard, place, trip, and story counts with quick links |
| `TripTimeline` | Travel diary vertical timeline for trips with multiple postcards: numbered nodes on a dotted spine, date stamps, tilted postcard cards, and handwritten notes (`--font-hand`) |
| `VisitorCardSkeleton`, `VisitorWallSkeleton` | Postcard-shaped loading placeholders with paper backgrounds, dashed stamp frames, ruled drawing blocks, and shimmer pulses |

## Added with the pivot and journal polish

- `StatsBar`: subtle scale strip under the hero showing total postcards, places, trips, and stories.
- `TripTimeline`: travel diary view for multi-postcard trips, displaying entries chronologically with date stamps, location, and handwritten diary notes.
- `VisitorWallSkeleton` / `VisitorCardSkeleton`: postcard loading skeletons supporting both standard masonry and scattered table variants.
- `BloomGallery` enhancements: curated mood filter pills (max 6 prominent moods, no hashtag clutter), non-persistent collapsible search button, and sort dropdown (default, newest first, oldest first, by place).
- `StoryCard` / `StoryFeature`: added prominent "3 min read" estimate badge and clean meta formatting.
- `Footer` upgrade: 12-postcard thumbnail mosaic with hover spring, an `airmail-edge` stripe visual divider, and social links (`siteConfig.socials`).
- `SectionHeader`: added support for an optional `badge` prop (e.g. "23 cards on the wall", "10 entries").
- `SvgMap`: server-drawn flat map (world or fit-to-pins). Pins are real links drawn as small postcards (`MapPin.image`), spread apart server-side with a thread to the true spot; `route` numbers them and draws the route.
- `Itinerary`: day-by-day timeline plus sticky route map. `CafeGuide`: usual order, price, seat, wifi, map link (only if given).
- `PostcardBack` / `RelatedPostcards`: shared by the lightbox and `/postcards/[slug]`.
- `SearchPalette`, `ThemeToggle`, `Cursor`. `Header`: plain links with a sweeping underline (CSS only) and `NavIcon` line icons from 75rem, frosted bar when scrolled, mobile menu with page hints (`siteConfig.navLinks[].icon` and `.hint`).
- Visitors: `CardComposer`, `DrawingPad` (marked `data-native-cursor`), `VisitorWall` / `VisitorCardView`, `DrawingSvg`.

## Brand

- `StampMark` (header), `LogoMark` (footer, mask-based), `Seal` (About), all in `src/components/brand/`. Colours from the `--logo-*` tokens.
- Share images: `src/app/opengraph-image.tsx` (site default) and the postcard one use `src/lib/brand.ts` (brand colours, logo and stamp as data URIs). Icons: `src/app/icon.svg`, `src/app/apple-icon.png`, `public/icons/*` (192, 512, maskable), listed in `manifest.ts`.

## The 404 page

`src/app/not-found.tsx` with `LostPostcard` (`features/not-found/`): a postcard that came back "return to sender" (the first wide featured photograph, linking to its own page), a slowly turning ring seal with the small stamp inside, clay cancellation waves, the heading "Lost in the post", an "Error 404" line, a back button, a link to the gallery and a hint that "/" opens search. Built from the 21st.dev "pixelated 404" reference but rebuilt: the pixel font, shadcn button and hard-coded colours were replaced by the project's fonts, tokens and logo. CSS-only motion (the ring turns, the print straightens on hover), both off for reduced motion. `noindex`.

## Routes

`/` home (hero, carousel, zoom, gallery, trip stack, story, places globe) · `/gallery` · `/trips`, `/trips/[slug]` · `/destinations`, `/destinations/[slug]` · `/cafes`, `/cafes/[slug]` · `/stories`, `/stories/[slug]` · `/about` · `not-found`, `error` · `/icon.svg`, `/manifest.webmanifest`, `/robots.txt`, `/sitemap.xml` · `POST /api/revalidate`.

## Conventions

- New scroll-revealed element: spread `{...reveal("text" | "photo", index)}` from `src/lib/reveal.ts` (it adds `suppressHydrationWarning`, needed because the controller mutates the DOM).
- New image: use `Photo` with honest `sizes`; give it alt text that conveys purpose, or `decorative`.
- Keep client components small; pass them plain data.
