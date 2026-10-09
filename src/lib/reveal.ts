import type { CSSProperties } from "react";

/**
 * Props for an element that should be revealed as it scrolls into view (see MotionController).
 * `suppressHydrationWarning` is deliberate: the controller adds `data-reveal-state` to the live
 * DOM, which may happen before React finishes hydrating that element.
 */
export function reveal(kind: "text" | "photo", index = 0) {
  return {
    "data-reveal": kind,
    style: { "--i": index % 8 } as CSSProperties,
    suppressHydrationWarning: true,
  } as const;
}
