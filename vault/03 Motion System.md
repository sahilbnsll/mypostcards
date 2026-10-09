---
title: Motion System
tags: [design, motion]
updated: 2026-10-09
---

# Motion system

Tokens: `--ease-out` (entrances, most things), `--ease-in-out`, `--ease-spring`; durations `--d-fast 160ms`, `--d-base 280ms`, `--d-slow 640ms`, `--d-hero 1000ms`. CSS lives in `src/styles/motion.css` and each component's module.

## Principles

1. **Three kinds only**: one *entrance* (hero), *reveals* on scroll, and *responses* to what the visitor does.
2. **No scroll hijacking.** Browser scrolling is never intercepted.
3. **Never animate layout.** Only `transform`, `opacity`, `filter`, `clip-path`. Image space is reserved from known ratios (CLS measured 0).
4. **No autoplay** carousels, no idle sway. The only unprompted motion is the hero deal-in (once) and a small bobbing arrow on the scroll cue.
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
| Mobile menu | Panel slides in, list items stagger 45ms | CSS keyframes in `<dialog>` | Open |
| Gallery filter | Non-matches go B&W and dim; matches bloom into colour from pointer, staggered up to 420ms | `clip-path: circle()` transition on a colour layer | Chip click, hover on a dimmed photo |
| Carousel | Prints swing on their pegs by scroll velocity and settle with overshoot | rAF pendulum, writes one CSS variable; stops when at rest | Scroll/drag |
| Trip cards | Neighbours recede (blur + desaturate) | `:has()`, only with hover capability | Hover, focus |
| Places | Print slides out and scales on the hovered row | CSS | Hover, focus |
| Lightbox | Photo grows out of the clicked thumbnail (FLIP, uniform scale); backdrop fades; back-of-card fades up; slide direction follows prev/next; exit fade | WAAPI + CSS | Open, step, close |

## Reduced motion

`@media (prefers-reduced-motion: reduce)` in `globals.css` collapses all animation and transition durations to ~0 and disables smooth scroll. In addition: `MotionController` does nothing (nothing is ever hidden), the carousel swing is disabled and `scrollBy` is instant, the lightbox skips FLIP and closes immediately, scroll-linked drift only exists under `prefers-reduced-motion: no-preference`.

## Mobile

Scroll-linked drift is desktop-only (`min-width: 900px`). The hero deal-in and swing are cheap transforms and stay. Hover effects only exist under `(hover: hover)`.

## Performance guardrails

Reveals observe elements once and unobserve. The pendulum rAF loop starts on scroll and exits when settled. The bloom colour layer is mounted only when the gallery is near the viewport (or the chip row is hovered).

## Known testing caveat

In a hidden or backgrounded browser pane `requestAnimationFrame` does not fire, which stalls CSS transitions and React's Suspense reveal. If something looks frozen under automation, check `document.visibilityState` before debugging.
