---
title: Components
tags: [engineering, components]
updated: 2026-10-09
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
| `PlacesIndex` | Typographic list with a sliding print |
| `StoryFeature`, `StoryCard` | Home feature and list cards. `as="h2"` on index pages for correct heading order |
| `CafeCard` | Photo, name, location, vibe tags, usual order |

## Routes

`/` home (hero, carousel, zoom, gallery, trip stack, story, places globe) · `/gallery` · `/trips`, `/trips/[slug]` · `/destinations`, `/destinations/[slug]` · `/cafes`, `/cafes/[slug]` · `/stories`, `/stories/[slug]` · `/about` · `not-found`, `error` · `/icon.svg`, `/manifest.webmanifest`, `/robots.txt`, `/sitemap.xml` · `POST /api/revalidate`.

## Conventions

- New scroll-revealed element: spread `{...reveal("text" | "photo", index)}` from `src/lib/reveal.ts` (it adds `suppressHydrationWarning`, needed because the controller mutates the DOM).
- New image: use `Photo` with honest `sizes`; give it alt text that conveys purpose, or `decorative`.
- Keep client components small; pass them plain data.
