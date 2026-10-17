---
title: Components
tags: [engineering, components]
updated: 2026-10-18
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
| `TripDiary` **client** | The trip's postcards day by day: a date slip and day name that stay in view, a grid of small prints (handwritten titles, play mark on videos), a spine drawn over in red as each day scrolls past; a print opens the viewer ([[09 Decisions]] D41) |
| `ItineraryExplorer` **client** | The itinerary list with day buttons, a follow-the-scroll switch, stop cards (time slip, tip, postcard print) and the route map beside it ([[09 Decisions]] D42) |
| `VisitorCardSkeleton`, `VisitorWallSkeleton` | Postcard-shaped loading placeholders with paper backgrounds, dashed stamp frames, ruled drawing blocks, and shimmer pulses |

## Added with the pivot and journal polish

- `StatsBar`: subtle scale strip under the hero showing total postcards, places, trips, and stories.
- `TripDiary`: the compact diary for multi-postcard trips (see the table above). Replaces the old one-card-per-postcard timeline.
- `VisitorWallSkeleton` / `VisitorCardSkeleton`: postcard loading skeletons supporting both standard masonry and scattered table variants.
- `BloomGallery` enhancements: curated mood filter pills (max 6 prominent moods, no hashtag clutter), non-persistent collapsible search button, and sort dropdown (default, newest first, oldest first, by place).
- `StoryCard` / `StoryFeature`: added prominent "3 min read" estimate badge and clean meta formatting.
- `Footer` upgrade: 12-postcard thumbnail mosaic with hover spring, an `airmail-edge` stripe visual divider, and social links (`siteConfig.socials`).
- `SectionHeader`: added support for an optional `badge` prop (e.g. "23 cards on the wall", "10 entries").
- `SvgMap`: server-drawn flat map (world or fit-to-pins). Pins are real links drawn as small postcards (`MapPin.image`), spread apart server-side with a thread to the true spot; `route` numbers them and draws the route. In `fit` mode it zooms to the route (`routeBox`, taller for a north-south route), draws a coordinate grid with degree labels, a scale bar and a north arrow, and shows stops without a photo as numbered, named markers at their true spot ([[09 Decisions]] D36).
- `LivePlacesMap` (`features/map/`, **client**): the live map under the globe on the home page and in the Places page's "On the map": one marker per place (photo, postcard count, name; dashed ring if planned) on the same live map, nearby places merged into one marker that zooms in when clicked ([[09 Decisions]] D39). Fed by `placePins()` in `selectors.ts`. `maplibre.ts` holds the shared loader, style and worker setup. `SectionHeader`'s badge and the trip diary's date are small handwritten paper slips with an airmail edge.
- `LiveRouteMap` (`features/map/`, **client**): takes `activeNumber`, `hoverNumber`, `focusDay`, `follow`, `focusRequest` and `onSelect` from the itinerary; draws the route as one leg per day-tagged piece, a dot at every stop, fans out photos that would overlap, and eases or fits the camera (instant with reduced motion). Base behaviour: the trip route on a real OpenStreetMap map (MapLibre GL, OpenFreeMap "positron"), wrapped around the server-drawn `SvgMap`, which it uses as placeholder and fallback. Starts when near the screen, `cooperativeGestures`, zoom buttons, compact credit, re-fits on resize until the visitor moves it, markers are real links to the itinerary stops ([[09 Decisions]] D38).
- `Itinerary`: day-by-day timeline plus sticky route map (`LiveRouteMap` around `SvgMap`). `CafeGuide`: a postal-slip card shown **above** the cover photograph (via `CollectionHero`'s `aside` slot): airmail edge, details cut apart by perforations, your rating and a handwritten line; compact when it holds only one or two things. `MapLink`: an "Open in Maps" text link with a small arrow in the details row under the café's name, right after the place link. `Rating` (`ui/`): five hand-drawn stars in marker yellow (each star wobbles a little and differs from its neighbours, the pen line overshoots where it started, the fill sits a hair off the line; each star filled by the exact amount (a 4.8 is four full stars and a fifth filled to 80%); only a faint pen line when empty) plus the number; theme-aware through the `--star-fill` and `--star-edge` tokens; used in the guide, on café cards and on postcard backs.
- `PostcardMedia` (`ui/`, **client**): the picture of a postcard on its page and in the lightbox. A photo through `Photo`, or, with a `video`, a muted looping `<video>` with controls and the poster, started on mount unless reduced motion is set. `PlayBadge` is the small play mark on gallery tiles. Clips have no audio track ([[09 Decisions]] D37).
- `GlobePostcards` / `PlacesGlobe`: take `places` (`globePlaces()`, a dot each) and `groups` (`globeGroups()`, one small postcard per state). `arrange()` lays the postcards out every frame from cobe's own marker elements; hover, tap and Escape behaviour and the arc are described in [[09 Decisions]] D40.
- `PostcardBack` / `RelatedPostcards`: shared by the lightbox and `/postcards/[slug]`.
- `SearchPalette`, `ThemeToggle`, `Cursor`. `Header`: plain links with a sweeping underline (CSS only) and `NavIcon` line icons from 75rem, frosted bar when scrolled, mobile menu with page hints (`siteConfig.navLinks[].icon` and `.hint`).
- Visitors: `CardComposer`, `DrawingPad` (marked `data-native-cursor`), `VisitorWall` / `VisitorCardView`, `DrawingSvg`.

## ViewAllButton

`ui/ViewAllButton`: the call to action at the foot of a preview section (used under the home gallery). An airmail envelope: `--print` face (light in both themes) inside `--air-stripe`, lifts and tilts a little on hover (not with reduced motion).

## Postcard back

`postcard/PostcardBack`: title, caption, handwritten note and a list of facts (where, when, kind, artist, rating, trip, place, café, story, coordinates, camera). A postcard that has a `story` shows a "Story" link to it.

## Footer

`layout/Footer`: the postcard mosaic, the airmail stripe, then four open columns (logo and tagline, Explore, Connect, credit). Explore merges the header links with `siteConfig.collections` (Art, Random clicks). Dark in both themes.

## Brand

All in `src/components/brand/`, drawn from `stampGeometry.ts`: `StampArt` / `StampBody` (the stamp), `StampMark` (header), `LogoMark` (stamp plus waves), `Seal` (round badge), `stampSvg.ts` (string version). `ui/Stamp` (hero cards and postcard backs) is the same stamp with a `tone`. `src/lib/brand.ts` builds data URIs for the share images. See [[02 Design System]].

## The 404 page

`src/app/not-found.tsx` with `LostPostcard` (`features/not-found/`): a postcard that came back "return to sender" (the first wide featured photograph, linking to its own page), a slowly turning ring seal with the small stamp inside, clay cancellation waves, the heading "Lost in the post", an "Error 404" line, a back button, a link to the gallery and a hint that "/" opens search. Built from the 21st.dev "pixelated 404" reference but rebuilt: the pixel font, shadcn button and hard-coded colours were replaced by the project's fonts, tokens and logo. CSS-only motion (the ring turns, the print straightens on hover), both off for reduced motion. `noindex`.

## The café page template

Every café uses the same layout, so a new entry in `content/cafes.json` gets it for free:

- **Header (`CollectionHero variant="split"`, `PageHead side`)**: on wide screens the heading, the details row and the guide card on the left and the cover photograph as a tilted postcard print on the right (handwritten caption from `neighborhood`, a stamp on its corner); on narrow screens it stacks, with the guide card above the photograph. Trips, places and stories keep the wide cover.
- **Details row**: city and country, "Visited 6 October 2026" (worked out from the postcards' dates; "First visited" when there are several dates), number of postcards, the place link when it adds something, and "Open in Maps".
- **Gallery (`BloomGallery`)**: photos are dealt into columns, each into the shortest column so far, so every column is used at every width (CSS columns left the last one empty when a few photos were tall). One arrangement is rendered per column count (2, 3, 4) and the stylesheet shows the one that fits; the hidden ones are `display: none`.
- **"More cafés"**: up to three other cafés, ones in the same place first.

## Routes

`/` home (hero, carousel, zoom, gallery, trip stack, story, places globe) · `/gallery` · `/trips`, `/trips/[slug]` · `/destinations`, `/destinations/[slug]` · `/cafes`, `/cafes/[slug]` · `/art`, `/random-clicks` (both `KindCollection`: the gallery narrowed to one category, no filter bar) · `/stories`, `/stories/[slug]` · `/about` · `not-found`, `error` · `/icon.svg`, `/manifest.webmanifest`, `/robots.txt`, `/sitemap.xml` · `POST /api/revalidate`.

## Conventions

- New scroll-revealed element: spread `{...reveal("text" | "photo", index)}` from `src/lib/reveal.ts` (it adds `suppressHydrationWarning`, needed because the controller mutates the DOM).
- New image: use `Photo` with honest `sizes`; give it alt text that conveys purpose, or `decorative`.
- Keep client components small; pass them plain data.
