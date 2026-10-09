"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Releases `[data-reveal]` elements as they scroll into view.
 *
 * Elements already on screen are left alone (no flash, no delay for the first screenful). Those
 * below the fold are hidden just before the visitor can see them, then revealed once. With
 * `prefers-reduced-motion` this does nothing and everything stays visible.
 */
export function MotionController() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-reveal-state="in"])'),
    );
    if (targets.length === 0) return;

    const viewportBottom = window.innerHeight;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealState = "in";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
    );

    // An effect can run twice (Strict Mode, route changes), so already-pending elements are
    // picked up again rather than skipped.
    for (const el of targets) {
      const alreadyPending = el.dataset.revealState === "pending";
      if (!alreadyPending && el.getBoundingClientRect().top < viewportBottom) continue;
      el.dataset.revealState = "pending";
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
