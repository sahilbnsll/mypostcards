"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import { Photo } from "@/components/ui/Photo";
import { Lightbox } from "@/components/features/lightbox/Lightbox";
import { useLightbox } from "@/components/features/lightbox/useLightbox";
import type { LightboxItem } from "@/components/features/lightbox/types";
import styles from "./PrintCarousel.module.css";

/**
 * Prints pegged to a sagging string. The scroller is a plain native one (touch, trackpad,
 * keyboard and scroll-snap all work); on top of that each print swings on its peg in proportion
 * to how fast the string is moving, then settles with a little overshoot.
 *
 * Adapted from the polaroid line carousel in the design reference: same physics (a damped
 * pendulum fed by line velocity), but driven by native scroll instead of a custom drag
 * simulation, and with no autoplay and no idle sway.
 */

const SIZES = "(min-width: 62rem) 17rem, 40vw";
const MAX_SWING_DEG = 14;

/** Small, stable per-print variation so the row never looks machine-set. */
function restAngle(index: number) {
  return ((index * 53) % 7) * 0.5 - 1.5; // -1.5deg to 1.5deg
}

interface PrintCarouselProps {
  items: LightboxItem[];
  label: string;
}

export function PrintCarousel({ items, label }: PrintCarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const lightbox = useLightbox(items, { syncHash: false });
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const swing = useRef({ angle: 0, velocity: 0, pendingVelocity: 0, lastLeft: 0, lastTime: 0, raf: 0, enabled: true });

  // The swing: a damped pendulum fed by the string's velocity.
  const runSwing = useCallback(() => {
    const s = swing.current;
    if (s.raf) return;
    let prev = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.033, (now - prev) / 1000);
      prev = now;
      const lineVelocity = now - s.lastTime < 80 ? s.pendingVelocity : 0;
      const next = s.velocity + (-38 * s.angle - 4.2 * s.velocity + lineVelocity * 0.0034) * dt;
      s.velocity = next;
      s.angle = Math.max(-0.5, Math.min(0.5, s.angle + next * dt));
      const deg = Math.max(-MAX_SWING_DEG, Math.min(MAX_SWING_DEG, (s.angle * 180) / Math.PI));
      trackRef.current?.style.setProperty("--swing", `${deg.toFixed(3)}deg`);
      if (Math.abs(s.angle) < 0.0008 && Math.abs(s.velocity) < 0.004 && now - s.lastTime > 120) {
        s.raf = 0;
        trackRef.current?.style.setProperty("--swing", "0deg");
        return;
      }
      s.raf = requestAnimationFrame(frame);
    };
    s.raf = requestAnimationFrame(frame);
  }, []);

  const updateEdges = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const start = el.scrollLeft <= 2;
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
    setEdges((current) => (current.start === start && current.end === end ? current : { start, end }));
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    swing.current.enabled = !reduce.matches;
    const onChange = () => (swing.current.enabled = !reduce.matches);
    reduce.addEventListener("change", onChange);
    swing.current.lastLeft = el.scrollLeft;
    updateEdges();
    const resize = new ResizeObserver(updateEdges);
    resize.observe(el);
    const s = swing.current;
    return () => {
      reduce.removeEventListener("change", onChange);
      resize.disconnect();
      cancelAnimationFrame(s.raf);
      s.raf = 0;
    };
  }, [updateEdges]);

  const onScroll = () => {
    const el = viewportRef.current;
    if (!el) return;
    updateEdges();
    const s = swing.current;
    if (!s.enabled) return;
    const now = performance.now();
    const dt = Math.max(1, now - (s.lastTime || now - 16)) / 1000;
    // Content moves opposite to scrollLeft, so the prints lag the other way.
    s.pendingVelocity = -((el.scrollLeft - s.lastLeft) / dt);
    s.lastLeft = el.scrollLeft;
    s.lastTime = now;
    runSwing();
  };

  const step = (direction: 1 | -1) => {
    const el = viewportRef.current;
    const track = trackRef.current;
    const first = track?.querySelector("li");
    if (!el || !track || !first) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const pitch = first.getBoundingClientRect().width + gap;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * pitch * 2, behavior: smooth ? "smooth" : "auto" });
  };

  // Mouse drag to scroll (touch and trackpad already scroll natively).
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    drag.current = { x: event.clientX, left: viewportRef.current?.scrollLeft ?? 0, moved: false };
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = viewportRef.current;
    if (!d || !el) return;
    const dx = event.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      el.dataset.dragging = "true";
      el.setPointerCapture(event.pointerId);
    }
    if (d.moved) el.scrollLeft = d.left - dx;
  };
  const endDrag = () => {
    const el = viewportRef.current;
    if (el) delete el.dataset.dragging;
    // Keep `moved` readable for the click that follows the pointerup, then clear.
    window.setTimeout(() => (drag.current = null), 0);
  };

  return (
    <div className={styles.carousel} role="group" aria-roledescription="carousel" aria-label={label}>
      <div className={styles.controls}>
        <button type="button" className={styles.round} onClick={() => step(-1)} disabled={edges.start} aria-label="Scroll back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
        <button type="button" className={styles.round} onClick={() => step(1)} disabled={edges.end} aria-label="Scroll forward">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>

      <div
        ref={viewportRef}
        className={styles.viewport}
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        tabIndex={0}
        role="region"
        aria-label={`${label}, scrollable`}
      >
        <ul role="list" ref={trackRef} className={styles.track}>
          {items.map((item, index) => (
            <li
              key={item.slug}
              className={styles.slot}
              style={{ "--rest": `${restAngle(index)}deg`, "--k": 0.75 + ((index * 37) % 5) * 0.12 } as CSSProperties}
            >
              <span className={styles.peg} aria-hidden />
              <button
                type="button"
                className={styles.print}
                onClick={(e) => {
                  if (drag.current?.moved) return;
                  lightbox.open(item.slug, e.currentTarget);
                }}
                aria-label={`Open ${item.title}`}
              >
                <Photo image={item.image} ratio="1 / 1" sizes={SIZES} />
                <span className={styles.note}>{item.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Lightbox
        list={lightbox.state?.list ?? null}
        index={lightbox.state?.index ?? 0}
        origin={lightbox.state?.origin ?? null}
        onIndexChange={lightbox.setIndex}
        onClose={lightbox.close}
      />
    </div>
  );
}
