---
title: Design System
tags: [design]
updated: 2026-10-28
---

# Design system

Source of truth in code: `src/styles/tokens.css`. This note explains the intent.

## Concept

**The postcard as an object.** Cool paper and card stock, navy ink, and the red and blue of airmail edging used only as *structure* (borders, stamps, rules), never as decoration. Photographs carry all the colour. One loud thing: the giant lowercase wordmark. Everything else is quiet.

Deliberately avoided: warm cream plus terracotta, tracked all-caps eyebrows above every heading, identical rounded cards with soft grey shadows, gradient washes, glassmorphism, numbered markers on non-sequences.

## Palette

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#eceeea` | Page ground. Cool, slightly green grey |
| `--card` | `#fbfbf8` | Postcard stock, print borders, lightbox back |
| `--ink` | `#0f1a2b` | Text, wordmark, inverted chips |
| `--muted` | `#526075` | Secondary text (5.6:1 on paper) |
| `--night` | `#0c1424` | Footer, lightbox backdrop |
| `--air-red` | `#d8362b` | Stamp, nav underline, sample-note rule. Never body text |
| `--air-blue` | `#1f4da6` | Links on hover, handwritten notes, focus ring (7.4:1 on paper) |
| `--air-stripe` | red/card/blue diagonal | Airmail edge: hero foot, footer top, lightbox back, empty state, mobile menu |

### Brand and logo

The logo is **one postage stamp**, built from the site's own vocabulary: an airmail-striped frame (the same red, paper and blue diagonal as the site's edges), a night-blue window holding a dusk scene (a cream sun, a snow-capped blue peak behind a red one) and perforated paper. It sits beside the wordmark **"my postcards"**, set lowercase in Bricolage Grotesque ExtraBold with tight tracking, exactly like the big title on the home page.

- **One drawing, one place.** `src/components/brand/stampGeometry.ts` holds the colours, frame, window, peaks, perforations and waves. Every use reads it: `StampArt` (React), `stampSvg` (a string for the favicon, the app icons and the share images) and the seal. Change the logo there and it changes everywhere.
- **Fixed colours.** A stamp is a physical object, so its colours do not change with the theme (paper `#fbfbf8`, night `#0c1424`, red `#d8362b`, blue `#1f4da6`, with lighter red and blue for the peaks). Only the wordmark and the cancellation waves follow the page ink (`--logo-ink`, which is `--ink`; the footer sets it light because it is dark in both themes).
- **Sizes.** `StampMark` (header, about 26px), `LogoMark` (the stamp with cancellation waves trailing off its left side: footer and 404 fallback), `Seal` (the round "postcards from Sahil" badge on the About page, with the stamp in its centre), and the decorative `Stamp` on hero cards and postcard backs, which is the same stamp in its `night`, `red` or `blue` window.
- **Where else.** Favicon (`src/app/icon.svg`), Apple and installable-app icons (the stamp on the night colour), the default share image and the postcard share image.
- The earlier logo (a green camera stamp traced from a Gemini sheet) was retired on 2026-10-14 ([[09 Decisions]] D30). The sheet is kept in `design-reference/brand/` for reference only.

### Rating stars

`--star-fill` and `--star-edge`: marker yellow (`#f7c52b`, pen line `#b87a0c`) in light mode, a brighter `#ffd04a` and `#f0a81c` in dark mode. Used only by `Rating`, which draws hand-style stars. Yellow was chosen over the logo's clay because yellow stars are what people read as a rating.

### Dark theme

Same roles, new values, defined twice in `tokens.css` (explicit `data-theme="dark"` and the system-preference fallback; keep identical).

| Token | Dark | Notes |
|---|---|---|
| `--paper` / `--paper-deep` / `--card` | `#070b14` / `#101827` / `#1a2338` | page matches the footer (`--night`); wells and panels step up from it |
| `--ink` / `--ink-soft` / `--muted` / `--faint` | `#f1f2ee` / `#cdd3de` / `#a5b0c2` / `#7b879c` | warm white text |
| `--rule` / `--rule-strong` | `#2e3b56` / `#52627f` | borders and map outlines |
| `--air-red` / `--air-blue` | `#ff6b5e` / `#92b6ff` | lightened to stay legible |
| `--map-sea` / `--map-land` | `#0c1424` / `#2c3d5c` | flat map |

Role tokens that do not flip: `--print` (photo prints, polaroids, stamps: `#fbfbf8` light, `#ece9e0` dark), `--print-ink` (text on prints), `--on-photo` (text over photographs). Panels use `--card`, which does flip. See [[09 Decisions]] D23.

## Type

| Role | Family | Notes |
|---|---|---|
| Display | **Bricolage Grotesque** (variable, `wdth` axis) | Headings and UI labels. Tight tracking (−0.02 to −0.055em). Wordmark at weight 800, `font-stretch: 85%` |
| Text | **Newsreader** (normal + italic) | Body, ledes, captions, story prose |
| Hand | **Reenie Beanie** | Only the short message on the back of a postcard. Not preloaded |

Scale (fluid): `--step--1` 0.875rem → `--step-hero` up to 12.5rem. Measure `62ch` for prose. Optical-size axes were dropped to roughly halve font weight (~200 KB preloaded).

## Shape, depth, space

- Radius: `3px` for photographs and cards (postcards have almost-square corners). Pills only for controls.
- Depth: `--shadow-print` (a card resting on a table), `--shadow-lift` on hover.
- Space: 4px base scale `--s-1..--s-9`; section rhythm `--section` clamps 3.5rem to 9rem.
- Layout: `.wrap` max 1400px, fluid gutter. Gallery is CSS columns (2/3/4) so every photograph keeps its true ratio.

## Signature devices

1. **Airmail edge**: 8px stripe, used on a handful of structural edges only.
2. **Stamp and postmark** (`Stamp.tsx`): perforated SVG stamp, circular postmark. The postmark reads "SAMPLE" for stand-in photos, which is also honest.
3. **Back of the postcard** (lightbox panel): title, caption, handwritten note, "address lines" of facts, stamp and postmark.
4. **Developing prints**: scroll reveals bring a photograph from greyscale to colour. The filter does the same on demand.

## How the reference file was used

Reference: `design-reference/Ui-components.md` (five 21st.dev-style components written for Tailwind and shadcn). This project uses CSS Modules, so each was **adapted, not copied**.

| Reference component | Used as | What changed and why |
|---|---|---|
| `color-filter-gallery` | `BloomGallery`: category filter where non-matching photos go black and white and matching ones bloom into colour from the pointer | Filters by *category*, not hue. **No autoplay** (motion safety). Colour layer mounts lazily. Keeps radiogroup + arrow-key pattern, status live region, pointer-origin bloom |
| `polaroid-line-carousel` | `PrintCarousel`: prints pegged to a sagging string, pendulum swing on scroll | Native scroll-snap scroller instead of a custom drag sim (touch, keyboard, trackpad for free). Same damped-pendulum constants. **No autoplay, no idle sway.** String is one repeating SVG tile |
| `focus-cards` | `TripCards`: hover or focus one card, neighbours recede | Pure CSS with `:has()`, zero JS. Blur only under `(hover: hover)` |
| `scroll-morph-hero` | Hero "deal": postcards scatter and settle once on load | **Rejected the virtual-scroll** (`wheel` `preventDefault`) because it hijacks scrolling. Kept the scatter-to-arrangement idea as a one-time CSS entrance |
| `cobe-globe-polaroids` | `GlobePostcards` + `PlacesGlobe`: a draggable WebGL globe (`cobe`) with postcards pinned where they were taken, on home and Places | Pause button (it auto-rotates), stops with reduced motion and when off screen, a visible list of the same places beside it as the accessible version, pins spread so polaroids do not collide. Polaroids are plain DOM attached by CSS Anchor Positioning (hidden where unsupported) |
| `drag-cards` | `DeckDrag`: hero postcards can be picked up and moved around the table, and still open on click | Mouse and pen only: a finger must keep scrolling and tapping. Works on server-rendered markup via `data-slot` and CSS variables, keeps the keyboard path (the cards are still links). A drag never counts as a click |
| `scroll-cards` | `TripStack` (since removed, [[09 Decisions]] D45): featured trips as cards that stack as you scroll | Pure CSS `position: sticky` (no JS). Text sits on a scrim for contrast. Whole card is one link |
| `zoom-parallax` | `ZoomGallery`: a collage that opens up so the middle photo fills the screen, between the carousel and the gallery | CSS scroll-linked animation instead of framer-motion, and **no Lenis** (smooth-scroll libraries take over scrolling). Only on wide screens with motion allowed; otherwise a plain grid |
| `gallery` ("Welcome to My Stories") | `PhotoSpread` on the About page: five postcards spring apart from a stack into an overlapping row as they scroll into view; mouse and pen can drag them (reuses `DeckDrag`) | CSS transitions instead of framer-motion; sized in container widths so it holds its proportions on phones; every card is a link to its postcard; already spread when JavaScript is off or motion is reduced. Dropped the shadcn `Button` and the gradient headline |
| `gallery-4` ("Selected Work") | `FeaturedBento` at the top of `/gallery`: five selected postcards in a bento (one 2x2 tile, four small), black and white until hovered | Uses the site's own lightbox instead of Radix `Dialog` (stepping through just those five). Greyscale only where hover exists, so touch screens see colour. Shows title and place on hover or focus |
| `image-stream-hero` | Not used | An endlessly looping 3D corridor of 18 cards is constant ambient motion and heavy for a photo-first site. Revisit only as an opt-in section (see [[10 Backlog]]) |

**Second round (2026-10-18): the file now has 23 components. The new eight are `glass-folder-cards` (used as `PostcardFolder`), `works-wheel` (not used: it traps the wheel), `murmuration-wordmark` (not used: a constant heavy canvas), `pull-lamp` (used as the footer `PullLamp`), `morph-gallery` (used as `MorphReel`), `card-25` (the print stack behind `CafeCard`), `card-7` (used as the `StoryCard` cover) and `prisma-hero` (not used). Reasons in [[09 Decisions]] D44.**

**Third round (2026-10-28): the file now has 25 components. `sticker-slap-footer` is used as the footer `StickerWall` (hand-lettered "places seen, moments kept", die-cut postal stickers, no framer-motion). `perspective-tunnel-hero` is not used: it hijacks the mouse wheel and is an endless corridor. Reasons in [[09 Decisions]] D52.**

**All 11 references in `design-reference/Ui-components.md` have been read in full** (colour-filter gallery, polaroid line carousel, focus cards, scroll-morph hero, image-stream hero, cobe globe polaroids, drag cards, scroll cards, zoom parallax, gallery, gallery-4). Nine are used, adapted; two are deliberately not (virtual-scroll hero, endless 3D corridor).

Reference notes about "shadcn project structure" and `/components/ui` were not applicable: the project already has its own `components/ui` primitives layer in CSS Modules and no Tailwind. No `framer-motion` was added.

## Text is never clipped
A sentence is shown whole: no line clamps and no ellipses on prose, captions or titles ([[09 Decisions]] D49). Containers grow to fit instead.

## Accessibility baked into the system

Two-tone focus ring visible on photos and paper, 44px minimum targets on round buttons, contrast checked for text tokens, `prefers-reduced-motion` removes all non-essential motion (see [[03 Motion System]]).
