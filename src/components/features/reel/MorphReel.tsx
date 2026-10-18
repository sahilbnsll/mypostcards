"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { Photo } from "@/components/ui/Photo";
import type { ImageAsset } from "@/content/types";
import { createDissolve, type DissolveHandle } from "./dissolve";
import styles from "./MorphReel.module.css";

export interface ReelFrame {
  image: ImageAsset;
  title: string;
  /** One line from the postcard. */
  caption?: string;
  /** Where "Open this postcard" goes. */
  href?: string;
}

interface MorphReelProps {
  frames: ReelFrame[];
  /** Names the group for screen readers, e.g. "Highlights from Kasol to Jispa". */
  label: string;
}

const REDUCED = "(prefers-reduced-motion: reduce)";

function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(REDUCED);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );
}

/** The file the optimiser serves for a texture: big enough for a wide frame, small enough to be quick. */
const textureUrl = (src: string, width: number) => `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;

/**
 * A few of a trip's best photographs, one at a time, that develop into each other: the new picture
 * burns through the old one in drifting patches, brightest areas first, like a print coming up in
 * the tray (adapted from the morph-gallery reference). One WebGL pass over two textures.
 *
 * Without WebGL, or before it is ready, the frame is an ordinary photograph that fades; with
 * reduced motion the pictures swap with no animation. Nothing plays by itself: the arrows, the
 * ticks, the arrow keys and a swipe all change the frame.
 */
export function MorphReel({ frames, label }: MorphReelProps) {
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<"pending" | "gl" | "plain">("pending");
  const reduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(0);
  const reducedRef = useRef(reduced);
  const dissolve = useRef<DissolveHandle | null>(null);
  const swipe = useRef<number | null>(null);
  const count = frames.length;

  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  // The shader is built once per set of pictures, and torn down with the page
  const sources = frames.map((frame) => frame.image.src).join("|");
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || sources === "") return;
    let live = true;
    const wide = window.matchMedia("(min-width: 40rem)").matches;
    const urls = sources.split("|").map((src) => textureUrl(src, wide ? 1200 : 828));
    createDissolve(canvas, urls, {
      start: activeRef.current,
      reduced: () => reducedRef.current,
    })
      .then((handle) => {
        if (!live) {
          handle.destroy();
          return;
        }
        dissolve.current = handle;
        setMode("gl");
      })
      .catch(() => {
        if (live) setMode("plain");
      });
    return () => {
      live = false;
      dissolve.current?.destroy();
      dissolve.current = null;
    };
  }, [sources]);

  const go = useCallback(
    (next: number) => {
      const to = ((next % count) + count) % count;
      if (to === activeRef.current) return;
      dissolve.current?.show(to);
      activeRef.current = to;
      setActive(to);
    },
    [count],
  );

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") go(activeRef.current + 1);
    else if (event.key === "ArrowLeft") go(activeRef.current - 1);
    else return;
    event.preventDefault();
  };
  const onPointerDown = (event: PointerEvent) => {
    swipe.current = event.clientX;
  };
  const onPointerUp = (event: PointerEvent) => {
    const from = swipe.current;
    swipe.current = null;
    if (from === null) return;
    const dx = event.clientX - from;
    if (Math.abs(dx) > 48) go(activeRef.current + (dx < 0 ? 1 : -1));
  };

  if (count === 0) return null;
  const frame = frames[active];

  return (
    <section
      className={styles.reel}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className={styles.print} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
        <span className={styles.tape} aria-hidden />
        <div className={styles.frame} style={{ backgroundColor: frame.image.color }}>
          {mode !== "gl" && (
            <span key={frame.image.src} className={styles.plain}>
              <Photo image={frame.image} ratio="4 / 5" sizes="(min-width: 62rem) 34rem, 90vw" decorative eager={active === 0} />
            </span>
          )}
          <canvas ref={canvasRef} className={styles.canvas} data-on={mode === "gl" || undefined} aria-hidden />
        </div>
      </div>

      <div className={styles.side}>
        <p className={styles.count} aria-hidden>
          {active + 1} of {count}
        </p>
        <h3 className={styles.title}>{frame.title}</h3>
        {frame.caption && <p className={styles.caption}>{frame.caption}</p>}
        {frame.href && (
          <Link href={frame.href} className={`text-link ${styles.open}`}>
            Open this postcard
          </Link>
        )}

        <div className={styles.controls}>
          <button type="button" className={styles.arrow} onClick={() => go(active - 1)} aria-label="Previous photograph">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <ol className={styles.ticks} role="list">
            {frames.map((item, i) => (
              <li key={item.image.src}>
                <button
                  type="button"
                  className={styles.tick}
                  aria-label={`Show ${item.title}`}
                  aria-current={i === active || undefined}
                  onClick={() => go(i)}
                />
              </li>
            ))}
          </ol>
          <button type="button" className={styles.arrow} onClick={() => go(active + 1)} aria-label="Next photograph">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <p className="visually-hidden" aria-live="polite">
        {frame.image.alt} ({active + 1} of {count})
      </p>
    </section>
  );
}
