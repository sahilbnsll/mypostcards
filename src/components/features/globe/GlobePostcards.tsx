"use client";

import createGlobe from "cobe";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { MouseEvent, PointerEvent } from "react";
import { Photo } from "@/components/ui/Photo";
import type { GlobeGroup, PlacePin } from "@/content/selectors";
import styles from "./GlobePostcards.module.css";

interface GlobePostcardsProps {
  /** Every place to mark with a dot. */
  places: PlacePin[];
  /** One postcard per state, standing for the places in it. */
  groups: GlobeGroup[];
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
/** A small tilt per card so the postcards look pinned by hand. */
const TILTS = [-3, 2, -2, 3, -2, 2, -3, 2];
/** The size of a mouse target around each dot, in pixels. */
const HIT = 22;
/** Keep a card at least this far (px) from every dot, so no dot is ever hidden under a card. */
const DOT_CLEAR = 9;
/** Space (px) left between two cards, enough to cover the tilt of the pair. */
const CARD_GAP = 7;

const markerId = (place: PlacePin) => `place-${place.id}`;

/** Rotation (phi) that brings a longitude to the middle of the globe (cobe's documented focus formula). */
const phiForLongitude = (lng: number) => Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2);

/** Where one state's places are on screen (their middle), and where its card sits, in px inside the globe's box. */
interface Slot {
  x: number;
  y: number;
  cx: number;
  cy: number;
  /** The card has had a first position. */
  placed: boolean;
  /** At least one of its places is on the side of the globe facing the viewer. */
  facing: boolean;
}

interface Dot {
  x: number;
  y: number;
  facing: boolean;
}

/**
 * Lay the cards out. Each card wants to sit just outside its places, pointing away from the middle
 * of the globe (so it hangs over the edge and not over the land), then any two cards that touch are
 * pushed apart, every card is kept clear of every dot, and every card is kept inside the box. The
 * positions carry over from one frame to the next, so the cards glide as the globe turns and
 * never jump. States on the far side of the globe are left alone.
 */
function arrange(slots: Slot[], dots: Dot[], box: number, cw: number, ch: number) {
  const live = slots.filter((slot) => slot.facing);
  const seen = dots.filter((dot) => dot.facing);
  const reach = Math.max(cw, ch) * 0.95;

  for (const slot of live) {
    const dx = slot.x - box / 2;
    const dy = slot.y - box / 2;
    const length = Math.hypot(dx, dy) || 1;
    const wantX = slot.x + (dx / length) * reach;
    const wantY = slot.y + (dy / length) * reach;
    if (!slot.placed) {
      slot.cx = wantX;
      slot.cy = wantY;
      slot.placed = true;
    }
    slot.cx += (wantX - slot.cx) * 0.08;
    slot.cy += (wantY - slot.cy) * 0.08;
  }

  for (let pass = 0; pass < 10; pass++) {
    // Cards off every dot
    for (const card of live) {
      for (const dot of seen) {
        const nearX = Math.max(card.cx - cw / 2, Math.min(dot.x, card.cx + cw / 2));
        const nearY = Math.max(card.cy - ch / 2, Math.min(dot.y, card.cy + ch / 2));
        const distance = Math.hypot(dot.x - nearX, dot.y - nearY);
        if (distance >= DOT_CLEAR) continue;
        const vx = card.cx - dot.x;
        const vy = card.cy - dot.y;
        const vl = Math.hypot(vx, vy) || 1;
        // A dot under the card has to be cleared completely, so push by at least half a card
        const push = (DOT_CLEAR - distance + (distance === 0 ? Math.min(cw, ch) / 2 : 0)) * 0.5;
        card.cx += (vx / vl) * push;
        card.cy += (vy / vl) * push;
      }
    }
    // Cards off each other, along the shorter way out (last, so no two cards end a pass touching)
    for (let i = 0; i < live.length; i++) {
      for (let j = i + 1; j < live.length; j++) {
        const a = live[i];
        const b = live[j];
        const dx = b.cx - a.cx;
        const dy = b.cy - a.cy;
        const overlapX = cw + CARD_GAP - Math.abs(dx);
        const overlapY = ch + CARD_GAP - Math.abs(dy);
        if (overlapX <= 0 || overlapY <= 0) continue;
        if (overlapX < overlapY) {
          const push = (overlapX / 2) * (dx >= 0 ? 1 : -1);
          a.cx -= push;
          b.cx += push;
        } else {
          const push = (overlapY / 2) * (dy >= 0 ? 1 : -1);
          a.cy -= push;
          b.cy += push;
        }
      }
    }
    for (const card of live) {
      card.cx = Math.min(box - cw / 2 - 2, Math.max(cw / 2 + 2, card.cx));
      card.cy = Math.min(box - ch / 2 - 2, Math.max(ch / 2 + 2, card.cy));
    }
  }
}

/**
 * A globe with the places you have been to marked on it: a dot for every place and a small
 * postcard for every state. cobe draws the globe in WebGL and gives every marker a real element;
 * this component reads where each one is every frame, lays the postcards out so none covers
 * another or a dot, and, for the state being pointed at, rings its dots, names it and draws an arc
 * from its postcard to them. Pointing at a dot or a postcard (or tapping one) holds the globe still
 * and lifts that state's postcard above the rest.
 *
 * Motion safety: it only turns while on screen, stops entirely with `prefers-reduced-motion`,
 * pauses while dragged or while a state is pointed at, and has a visible pause button. The
 * postcards are a pointer enhancement: the list of places beside the globe is the accessible
 * version of the same information, so the cards are hidden from assistive technology.
 */
export function GlobePostcards({ places, groups }: GlobePostcardsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const arcRefs = useRef<Record<string, SVGPathElement | null>>({});
  const hitRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const touched = useRef(false);

  const startLng = places.length > 0 ? places.reduce((sum, place) => sum + place.lng, 0) / places.length : 0;
  const state = useRef({
    phi: phiForLongitude(startLng),
    theta: TILT,
    drag: null as null | { x: number; y: number; phi: number; theta: number },
    visible: false,
    paused: false,
    hold: false,
    /** The state being pointed at, whose places are ringed and joined to its postcard by an arc. */
    active: null as string | null,
  });
  const [heldByVisitor, setHeldByVisitor] = useState(false);
  const [supported, setSupported] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, readReducedMotion, () => false);
  // Reduced motion holds the globe still; the button then lets the visitor turn it if they want to.
  const [overrideReduced, setOverrideReduced] = useState(false);
  const paused = reducedMotion ? !overrideReduced : heldByVisitor;
  // The state being pointed at, or the one tapped last
  const active = hovered ?? pinned;

  const groupOfPlace = new Map<string, string>();
  for (const group of groups) for (const id of group.placeIds) groupOfPlace.set(id, group.id);

  useEffect(() => {
    state.current.paused = paused;
  }, [paused]);

  // A state that is pointed at holds the globe still
  useEffect(() => {
    state.current.hold = active !== null;
    state.current.active = active;
  }, [active]);

  // Escape lets go of a tapped state
  useEffect(() => {
    if (pinned === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPinned(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pinned]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let globe: ReturnType<typeof createGlobe> | null = null;
    let raf = 0;

    const dots: Dot[] = places.map(() => ({ x: 0, y: 0, facing: false }));
    const indexOfPlace = new Map(places.map((place, i) => [place.id, i]));
    const slots: Slot[] = groups.map(() => ({ x: 0, y: 0, cx: 0, cy: 0, placed: false, facing: false }));
    const markerEls = new Map<string, HTMLElement>();
    const box = { size: 0, cw: 0, ch: 0 };

    const measure = () => {
      box.size = wrap.clientWidth;
      const first = Object.values(cardRefs.current).find((el): el is HTMLElement => Boolean(el));
      if (first) {
        box.cw = first.offsetWidth;
        box.ch = first.offsetHeight;
      }
    };

    // cobe adds one element per marker (inside a wrapper it makes around the canvas), positioned in
    // percent of the globe's box and named by id
    const findMarkers = () => {
      for (const el of Array.from(wrap.querySelectorAll<HTMLElement>("div[style*='anchor-name']"))) {
        const match = /--cobe-(place-[^;\s]+)/.exec(el.getAttribute("style") ?? "");
        if (match) markerEls.set(match[1], el);
      }
    };

    const setFacing = (target: HTMLElement | SVGElement | null | undefined, facing: boolean) => {
      if (target) target.dataset.facing = facing ? "true" : "false";
    };

    const place = () => {
      if (box.size === 0 || box.cw === 0) return;
      if (markerEls.size < places.length) findMarkers();
      const root = getComputedStyle(document.documentElement);

      places.forEach((p, i) => {
        const el = markerEls.get(markerId(p));
        if (!el) return;
        const dot = dots[i];
        dot.x = (parseFloat(el.style.left) / 100) * box.size;
        dot.y = (parseFloat(el.style.top) / 100) * box.size;
        // cobe sets this variable only for markers on the side facing the viewer
        const facing = root.getPropertyValue(`--cobe-visible-${markerId(p)}`).trim() !== "";
        if (facing !== dot.facing) {
          dot.facing = facing;
          setFacing(hitRefs.current[p.id], facing);
        }
        const hit = hitRefs.current[p.id];
        if (hit && facing) hit.style.translate = `${dot.x - HIT / 2}px ${dot.y - HIT / 2}px`;
      });

      // A state's postcard stands at the middle of its places that are in view
      groups.forEach((g, i) => {
        const slot = slots[i];
        const inView = g.placeIds.map((id) => dots[indexOfPlace.get(id) ?? -1]).filter((dot): dot is Dot => Boolean(dot?.facing));
        const facing = inView.length > 0;
        if (facing) {
          slot.x = inView.reduce((sum, dot) => sum + dot.x, 0) / inView.length;
          slot.y = inView.reduce((sum, dot) => sum + dot.y, 0) / inView.length;
        }
        if (facing !== slot.facing) {
          slot.facing = facing;
          setFacing(cardRefs.current[g.id], facing);
          setFacing(arcRefs.current[g.id], facing);
        }
      });

      arrange(slots, dots, box.size, box.cw, box.ch);

      groups.forEach((g, i) => {
        const slot = slots[i];
        if (!slot.facing) return;
        const card = cardRefs.current[g.id];
        if (card) card.style.translate = `${slot.cx - box.cw / 2}px ${slot.cy - box.ch / 2}px`;
        // Only the state being pointed at is joined to its places, by a gentle arc; at rest there are no lines
        const arc = arcRefs.current[g.id];
        if (arc && g.id === state.current.active) {
          const dx = slot.cx - slot.x;
          const dy = slot.cy - slot.y;
          const length = Math.hypot(dx, dy) || 1;
          const bend = Math.min(26, length * 0.22);
          const qx = (slot.x + slot.cx) / 2 - (dy / length) * bend;
          const qy = (slot.y + slot.cy) / 2 + (dx / length) * bend;
          arc.setAttribute("d", `M${slot.x} ${slot.y} Q${qx} ${qy} ${slot.cx} ${slot.cy}`);
        }
      });
    };

    const io = new IntersectionObserver(([entry]) => {
      state.current.visible = entry.isIntersecting;
    });
    io.observe(wrap);

    const frame = () => {
      const s = state.current;
      if (s.visible && !document.hidden) {
        if (!s.drag && !s.paused && !s.hold) s.phi += SPIN_PER_FRAME;
        globe?.update({ phi: s.phi, theta: s.theta });
        place();
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
          markers: places.map((p) => ({ location: [p.lat, p.lng] as [number, number], size: 0.03, id: markerId(p) })),
          opacity: 1,
        });
        canvas.style.opacity = "1";
        measure();
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
    // The cards scale with the globe, so measure again when it changes size
    const sizer = new ResizeObserver(measure);
    sizer.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro?.disconnect();
      sizer.disconnect();
      globe?.destroy();
    };
  }, [places, groups]);

  // Drag to turn the globe. Horizontal drags turn it; vertical swipes still scroll the page.
  const onPointerDown = useCallback((event: PointerEvent<HTMLCanvasElement>) => {
    const s = state.current;
    s.drag = { x: event.clientX, y: event.clientY, phi: s.phi, theta: s.theta };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.style.cursor = "grabbing";
    setPinned(null);
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

  // Pointing is for mice and pens; a finger taps to pick a state instead (touch has no hover)
  const point = (id: string) => (event: PointerEvent) => {
    touched.current = event.pointerType === "touch";
    if (event.pointerType !== "touch") setHovered(id);
  };
  const leave = (id: string) => (event: PointerEvent) => {
    if (event.pointerType !== "touch") setHovered((current) => (current === id ? null : current));
  };
  const togglePinned = (id: string) => setPinned((current) => (current === id ? null : id));
  // On a touch screen the first tap on a postcard picks it; a second tap opens the place
  const openCard = (id: string) => (event: MouseEvent) => {
    if (touched.current && pinned !== id) {
      event.preventDefault();
      setPinned(id);
    }
  };

  if (places.length === 0) return null;

  return (
    <div className={styles.root}>
      <div ref={wrapRef} className={styles.globe} data-supported={supported || undefined} data-active={active !== null || undefined}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          aria-hidden
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        />

        {supported && (
          <>
            <svg className={styles.arcs} aria-hidden focusable="false">
              {groups.map((g) => (
                <path
                  key={g.id}
                  ref={(el) => {
                    arcRefs.current[g.id] = el;
                  }}
                  className={styles.arc}
                  data-facing="false"
                  data-active={active === g.id || undefined}
                />
              ))}
            </svg>

            {places.map((p) => {
              const group = groupOfPlace.get(p.id);
              return (
                <span
                  key={p.id}
                  ref={(el) => {
                    hitRefs.current[p.id] = el;
                  }}
                  className={styles.hit}
                  data-facing="false"
                  data-active={(group !== undefined && active === group) || undefined}
                  aria-hidden
                  onPointerEnter={group ? point(group) : undefined}
                  onPointerLeave={group ? leave(group) : undefined}
                  onClick={group ? () => togglePinned(group) : undefined}
                />
              );
            })}

            {groups.map((g, i) => {
              if (!g.image) return null;
              const common = {
                className: styles.card,
                style: { rotate: `${TILTS[i % TILTS.length]}deg` },
                "data-facing": "false",
                "data-active": active === g.id || undefined,
                "data-dim": (active !== null && active !== g.id) || undefined,
                "aria-hidden": true,
                onPointerEnter: point(g.id),
                onPointerLeave: leave(g.id),
              } as const;
              const face = (
                <>
                  <Photo image={g.image} ratio="1 / 1" sizes="64px" decorative />
                  <span className={styles.count}>{g.count}</span>
                  <span className={styles.tag}>{g.name}</span>
                </>
              );
              return g.href ? (
                <Link
                  key={g.id}
                  ref={(el) => {
                    cardRefs.current[g.id] = el;
                  }}
                  href={g.href}
                  tabIndex={-1}
                  onClick={openCard(g.id)}
                  {...common}
                >
                  {face}
                </Link>
              ) : (
                <div
                  key={g.id}
                  ref={(el) => {
                    cardRefs.current[g.id] = el;
                  }}
                  onClick={() => togglePinned(g.id)}
                  {...common}
                >
                  {face}
                </div>
              );
            })}
          </>
        )}
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
