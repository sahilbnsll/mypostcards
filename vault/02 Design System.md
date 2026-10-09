---
title: Design System
tags: [design]
updated: 2026-10-09
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
| `image-stream-hero` | Not used | An endlessly looping 3D corridor of 18 cards is constant ambient motion and heavy for a photo-first site. Revisit only as an opt-in section (see [[10 Backlog]]) |

Reference notes about "shadcn project structure" and `/components/ui` were not applicable: the project already has its own `components/ui` primitives layer in CSS Modules and no Tailwind. No `framer-motion` was added.

## Accessibility baked into the system

Two-tone focus ring visible on photos and paper, 44px minimum targets on round buttons, contrast checked for text tokens, `prefers-reduced-motion` removes all non-essential motion (see [[03 Motion System]]).
