---
title: Motion System
tags: [design, motion]
updated: 2026-10-30
---

# Motion system

Tokens: `--ease-out` (entrances, most things), `--ease-in-out`, `--ease-spring`; durations `--d-fast 160ms`, `--d-base 280ms`, `--d-slow 640ms`, `--d-hero 1000ms`. CSS lives in `src/styles/motion.css` and each component's module.

## Principles

1. **Three kinds only**: one *entrance* (hero), *reveals* on scroll, and *responses* to what the visitor does.
2. **No scroll hijacking.** Browser scrolling is never intercepted.
3. **Never animate layout.** Only `transform`, `opacity`, `filter`, `clip-path`. Image space is reserved from known ratios (CLS measured 0).
4. **No autoplay** carousels, no idle sway. The unprompted motion is the hero deal-in (once), a small bobbing arrow on the scroll cue, and the slowly turning globe, which has a visible hold button, stops with reduced motion, and only runs while on screen.
5. **Everything works without animation.** Reveals are progressive enhancement.

## Inventory

| Where | What | How | Trigger |
|---|---|---|---|
| Hero | Postcards dealt onto the table, staggered 120ms | CSS `@keyframes deal` on `translate/rotate/scale` | Page load, once |
| Hero | Table drifts down slightly as the page scrolls | `animation-timeline: scroll(root)` | Scroll (Chromium/Safari 26+, desktop only) |
| Hero | Hover lifts a card toward flat | `rotate`/`translate` transition | Hover, focus |
| Sections | Text settles (14px rise + fade); photographs *develop* (greyscale to colour) | `MotionController` sets `data-reveal-state`; CSS transitions | Enters viewport; stagger `--i × 70ms` capped by `i % 8` |
| Story, collection heroes | Photograph drifts inside its frame | `[data-drift]` + `animation-timeline: view()` | Scroll (desktop, supported browsers) |
| Header | Single underline slides to hovered or current link; opaque bar after scroll | Measured `translateX/width`; IntersectionObserver sentinel | Hover/focus/route |
| Mobile menu | Panel slides in from the right over a fading backdrop (340ms out-ease), items fade up 40ms apart; on close the panel leaves quickly (240ms) and the dialog stays displayed until it has finished | CSS `transition` with `@starting-style` and `display`/`overlay` `allow-discrete` on the `<dialog>`; opened synchronously in the tap handler; page scroll locked with `html:has(dialog[open])` | Open, close, route change |
| Gallery filter | Non-matches go B&W and dim; matches bloom into colour from pointer, staggered up to 420ms | `clip-path: circle()` transition on a colour layer | Chip click, hover on a dimmed photo |
| Carousel | Prints swing on their pegs by scroll velocity and settle with overshoot | rAF pendulum, writes one CSS variable; stops when at rest | Scroll/drag |
| Trip cards | Neighbours recede (fade + desaturate, never blurred) | `:has()`, only with hover capability | Hover, focus |
| Places | Print slides out and scales on the hovered row | CSS | Hover, focus |
| Hero | Cards can be dragged with a mouse or pen; the picked-up card comes to the front | Pointer events writing `--dx/--dy`; clamped to the table | Press and move (not touch) |
| Look closer | Collage scales up so the centre photo fills the viewport, others fly outward (about 250svh of scroll) | `view-timeline` on the section, tiles scale by `--to`; stage is `position: sticky` | Scroll, wide screens, motion allowed, supported browsers only |
| Trips | Cards stack: each sticks a little lower and the next slides over | `position: sticky` | Scroll |
| Places globe | Globe turns slowly and can be dragged; polaroids fade as their pin goes behind the globe | cobe (WebGL) + rAF only while visible; CSS variable `--cobe-visible-id` drives opacity | On while on screen unless held, paused, or reduced motion |
| About | Five postcards spring apart from a stack into an overlapping row (spring overshoot, 90ms stagger) | Container `data-reveal="spread"`; CSS `translate` transitions keyed on `data-reveal-state` | Scrolls into view, once |
| Gallery, Selected | Tiles go from black and white to colour and zoom 4% on hover or focus; caption fades up | CSS filter and scale | Hover/focus, hover-capable devices only |
| Lightbox | Photo grows out of the clicked thumbnail (FLIP, uniform scale); backdrop fades; back-of-card fades up; slide direction follows prev/next; exit fade | WAAPI + CSS | Open, step, close |

### Added with the pivot

- **Round cursor** (`Cursor`): rAF eased follow (22% per frame, stops when settled); ring over pressable things, smaller on press; with reduced motion it sits exactly on the pointer and transitions are off. Mouse only. D25.
- **Header links**: the underline scales in from the left and leaves to the right (transform only, 280ms, off with reduced motion).
- **Map postcards**: hover or focus scales the card (spring); no entrance animation.
- **Search dialog and mobile menu**: CSS transitions with `@starting-style` and `allow-discrete`.

## Reduced motion

`@media (prefers-reduced-motion: reduce)` in `globals.css` collapses all animation and transition durations to ~0 and disables smooth scroll. In addition: `MotionController` does nothing (nothing is ever hidden), the carousel swing is disabled and `scrollBy` is instant, the lightbox skips FLIP and closes immediately, scroll-linked drift only exists under `prefers-reduced-motion: no-preference`.

## Mobile

Scroll-linked drift and the zoom parallax are desktop-only (the zoom falls back to a grid). Card dragging is not offered on touch. The hero deal-in and swing are cheap transforms and stay. Hover effects only exist under `(hover: hover)`.

## Performance guardrails

Reveals observe elements once and unobserve. The pendulum rAF loop starts on scroll and exits when settled. The bloom colour layer is mounted only when the gallery is near the viewport (or the chip row is hovered).

## Known testing caveat

In a hidden or backgrounded browser pane `requestAnimationFrame` does not fire, which stalls CSS transitions and React's Suspense reveal. If something looks frozen under automation, check `document.visibilityState` before debugging.

## Footer sticker wall

The script is a stroke-dashoffset transition (3.2 s, linear, started once when the footer is 35% in view); each sticker waits for the pen (`--land`) then plays a 0.55 s `slap` keyframe (scale in, a small overshoot). Drag uses the CSS `translate`, `rotate` and `scale` properties so it never fights the keyframe's `transform`. Reduced motion: no write, no slap, the finished wall at once. See [[09 Decisions]] D52.
