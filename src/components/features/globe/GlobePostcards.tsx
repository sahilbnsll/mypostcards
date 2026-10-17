"use client";

import createGlobe from "cobe";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties, PointerEvent } from "react";
import { Photo } from "@/components/ui/Photo";
import type { GlobePin } from "@/content/selectors";
import styles from "./GlobePostcards.module.css";

interface GlobePostcardsProps {
  pins: GlobePin[];
}

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const readReducedMotion = () => window.matchMedia(REDUCED_QUERY).matches;

const SPIN_PER_FRAME = 0.0028;
const TILT = 0.5;

/** Rotation (phi) that brings a longitude to the middle of the globe (cobe's documented focus formula). */
const phiForLongitude = (lng: number) => Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2);

/**
 * A globe with the postcards pinned where they were taken, adapted from the cobe polaroid
 * reference. cobe draws the globe in WebGL; each polaroid is a plain DOM element that CSS Anchor
 * Positioning attaches to its pin, so it can be styled and made a link like any other element.
 *
 * Motion safety: it only turns while on screen, stops entirely with `prefers-reduced-motion`,
 * pauses while dragged, and has a visible pause button.
 */
export function GlobePostcards({ pins }: GlobePostcardsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const state = useRef({ phi: pins[0] ? phiForLongitude(pins[0].lng) : 0, theta: TILT, drag: null as null | { x: number; y: number; phi: number; theta: number }, visible: false, paused: false });
  const [heldByVisitor, setHeldByVisitor] = useState(false);
  const [supported, setSupported] = useState(true);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, readReducedMotion, () => false);
  // Reduced motion holds the globe still; the button then lets the visitor turn it if they want to.
  const [overrideReduced, setOverrideReduced] = useState(false);
  const paused = reducedMotion ? !overrideReduced : heldByVisitor;

  useEffect(() => {
    state.current.paused = paused;
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let globe: ReturnType<typeof createGlobe> | null = null;
    let raf = 0;

    const io = new IntersectionObserver(([entry]) => {
      state.current.visible = entry.isIntersecting;
    });
    io.observe(wrap);

    const frame = () => {
      const s = state.current;
      if (s.visible && !document.hidden) {
        if (!s.drag && !s.paused) s.phi += SPIN_PER_FRAME;
        globe?.update({ phi: s.phi, theta: s.theta });
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      const size = canvas.offsetWidth;
      if (size === 0 || globe) return;
      try {
        globe = createGlobe(canvas, {
          devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
          width: size,
          height: size,
          phi: state.current.phi,
          theta: state.current.theta,
          dark: 0,
          diffuse: 1.25,
          mapSamples: 16000,
          mapBrightness: 2.2,
          baseColor: [0.97, 0.97, 0.95],
          markerColor: [0.85, 0.21, 0.17],
          glowColor: [0.78, 0.8, 0.78],
          markerElevation: 0,
          markers: pins.map((pin) => ({ location: [pin.lat, pin.lng] as [number, number], size: 0.035, id: pin.id })),
          opacity: 1,
        });
        canvas.style.opacity = "1";
        raf = requestAnimationFrame(frame);
      } catch {
        // No WebGL: hide the globe, the list of places beside it still tells the story.
        setSupported(false);
      }
    };

    let ro: ResizeObserver | undefined;
    if (canvas.offsetWidth > 0) {
      start();
    } else {
      ro = new ResizeObserver(() => {
        if (canvas.offsetWidth > 0) {
          ro?.disconnect();
          start();
        }
      });
      ro.observe(canvas);
    }

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro?.disconnect();
      globe?.destroy();
    };
  }, [pins]);

  // Drag to turn the globe. Horizontal drags turn it; vertical swipes still scroll the page.
  const onPointerDown = useCallback((event: PointerEvent<HTMLCanvasElement>) => {
    const s = state.current;
    s.drag = { x: event.clientX, y: event.clientY, phi: s.phi, theta: s.theta };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.style.cursor = "grabbing";
  }, []);
  const onPointerMove = useCallback((event: PointerEvent<HTMLCanvasElement>) => {
    const s = state.current;
    if (!s.drag) return;
    s.phi = s.drag.phi + (event.clientX - s.drag.x) / 260;
    s.theta = Math.max(-0.6, Math.min(0.9, s.drag.theta + (event.clientY - s.drag.y) / 900));
  }, []);
  const endDrag = useCallback((event: PointerEvent<HTMLCanvasElement>) => {
    state.current.drag = null;
    event.currentTarget.style.cursor = "grab";
  }, []);

  if (pins.length === 0) return null;

  return (
    <div className={styles.root}>
      <div ref={wrapRef} className={styles.globe} data-supported={supported || undefined}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          aria-hidden
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        />
        {supported &&
          pins.map((pin) => (
            <div
              key={pin.id}
              className={styles.polaroid}
              style={{ "--vis": `var(--cobe-visible-${pin.id}, 0)`, rotate: `${pin.rotate}deg`, positionAnchor: `--cobe-${pin.id}` } as CSSProperties}
              aria-hidden
            >
              <Photo image={pin.image} ratio="1 / 1" sizes="72px" />
              <span className={styles.caption}>
                {pin.places.slice(0, 3).map((place) => (
                  <span key={place.name} className={styles.captionName}>
                    {place.name}
                  </span>
                ))}
              </span>
            </div>
          ))}
      </div>

      <button
        type="button"
        className={styles.pause}
        aria-pressed={paused}
        onClick={() => (reducedMotion ? setOverrideReduced((v) => !v) : setHeldByVisitor((v) => !v))}
      >
        {paused ? "Turn the globe" : "Hold the globe still"}
      </button>
    </div>
  );
}
