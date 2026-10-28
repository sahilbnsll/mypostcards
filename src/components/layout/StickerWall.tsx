"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent, ReactNode } from "react";
import { SLANT, STROKE, clamp, layoutScript, round } from "./script";
import styles from "./StickerWall.module.css";

/**
 * The footer's signature, adapted from the sticker-slap footer reference and redrawn as a postcard
 * sign-off, "places seen, moments kept" (the site's own tagline, shortened), is written once in a fat single-stroke script as the footer
 * scrolls into view, and postal stickers slap down as the pen passes. Stickers can be dragged with
 * a mouse, finger or pen (they tilt as they are thrown), moved with the arrow keys, and put back
 * with Escape or a double click. Click the writing to see it written again. Nothing here touches
 * scrolling; with reduced motion the finished wall just appears.
 */

const REDUCED = "(prefers-reduced-motion: reduce)";
const LINES = ["places seen", "moments kept"];
/** How long the pen takes over the whole phrase, in seconds. */
const WRITE_SECONDS = 3.2;
const LINE_GAP = 34;
const PAD = 5;
const LEAN = Math.atan(SLANT) * (180 / Math.PI);

const words = LINES.map(layoutScript);
const widest = Math.max(...words.map((w) => w.width));
const topmost = Math.min(...words.map((w) => w.top));
const deepest = Math.max(...words.map((w) => w.bottom));
const totalWidth = words.reduce((sum, w) => sum + w.width, 0);
const VIEW_W = round(widest + PAD * 2 + 5);
const VIEW_H = round(PAD * 2 - topmost + LINE_GAP * (LINES.length - 1) + deepest);

/** Each line's start and share of the pen time. */
const lines = words.map((word, i) => {
  const before = words.slice(0, i).reduce((sum, w) => sum + w.width, 0);
  return {
    word,
    x: round(PAD + (widest - word.width) / 2 + (i % 2) * 3),
    y: round(PAD - topmost + i * LINE_GAP),
    start: (before / totalWidth) * WRITE_SECONDS,
    seconds: (word.width / totalWidth) * WRITE_SECONDS,
  };
});

const tag = layoutScript("air mail");

const starPath = (cx: number, cy: number, outer: number, inner: number): string => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${round(cx + Math.cos(a) * r)} ${round(cy + Math.sin(a) * r)}`);
  }
  return `M${pts.join("L")}Z`;
};

interface StickerDef {
  id: string;
  label: string;
  /** Centre on a wide screen and on a narrow one, in percent of the stage. */
  at: [number, number];
  narrow: [number, number];
  /** Width in rem and height as a share of it. */
  size: number;
  ratio?: number;
  view?: string;
  rotate: number;
  /** How far along the writing (0 to 1) the pen is when it lands. */
  lands: number;
  art: ReactNode;
}

/** The die-cut white edge every sticker has, drawn first and thick under the colour. */
const cut = (d: string): ReactNode => <path d={d} className={styles.cut} />;

const STICKERS: StickerDef[] = [
  {
    id: "plane",
    label: "Paper plane sticker",
    at: [11, 27],
    narrow: [18, 10],
    size: 5.6,
    rotate: -12,
    lands: 0.12,
    art: (
      <>
        {cut("M10 46L92 12L66 88L48 62Z")}
        <path d="M10 46L92 12L48 62Z" className={styles.white} />
        <path d="M92 12L66 88L48 62Z" className={styles.blue} />
        <path d="M48 62L66 88L56 66Z" className={styles.red} />
      </>
    ),
  },
  {
    id: "postmark",
    label: "Postmark sticker",
    at: [17, 76],
    narrow: [18, 90],
    size: 6,
    rotate: 7,
    lands: 0.38,
    art: (
      <>
        <circle cx="50" cy="50" r="45" className={styles.cutFill} />
        <circle cx="50" cy="50" r="39" className={styles.ringBlue} />
        <circle cx="50" cy="50" r="27" className={styles.ringThin} />
        <path d="M31 42q4.75-5 9.5 0t9.5 0t9.5 0t9.5 0M31 50q4.75-5 9.5 0t9.5 0t9.5 0t9.5 0M31 58q4.75-5 9.5 0t9.5 0t9.5 0t9.5 0" className={styles.wave} />
      </>
    ),
  },
  {
    id: "star",
    label: "Star sticker",
    at: [6, 60],
    narrow: [82, 90],
    size: 4.2,
    rotate: 14,
    lands: 0.55,
    art: (
      <>
        {cut(starPath(50, 52, 42, 18))}
        <path d={starPath(50, 52, 42, 18)} className={styles.gold} />
      </>
    ),
  },
  {
    id: "stamp",
    label: "Stamp sticker",
    at: [88, 25],
    narrow: [82, 10],
    size: 5.2,
    rotate: 8,
    lands: 0.7,
    art: (
      <>
        <rect x="6" y="6" width="88" height="88" rx="2" className={styles.cutFill} />
        <rect x="7" y="7" width="86" height="86" className={styles.perforation} />
        <rect x="12" y="12" width="76" height="76" className={styles.paperFill} />
        <rect x="17" y="17" width="66" height="66" className={styles.blue} />
        <circle cx="66" cy="36" r="8" className={styles.gold} />
        <path d="M17 83L38 48L52 68L63 54L83 83Z" className={styles.white} />
      </>
    ),
  },
  {
    id: "compass",
    label: "Compass sticker",
    at: [93, 54],
    narrow: [50, 8],
    size: 4.8,
    rotate: -6,
    lands: 0.85,
    art: (
      <>
        <circle cx="50" cy="50" r="46" className={styles.cutFill} />
        <circle cx="50" cy="50" r="38" className={styles.ringInk} />
        <path d="M50 14L60 50L40 50Z" className={styles.red} />
        <path d="M50 86L60 50L40 50Z" className={styles.blue} />
        <circle cx="50" cy="50" r="4.5" className={styles.hub} />
      </>
    ),
  },
  {
    id: "airmail",
    label: "Air mail tag sticker",
    at: [82, 78],
    narrow: [50, 91],
    size: 7.4,
    ratio: 0.64,
    view: "0 18 100 64",
    rotate: -8,
    lands: 1,
    art: (
      <>
        <rect x="3" y="22" width="94" height="56" rx="5" className={styles.cutFill} />
        <rect x="8" y="27" width="84" height="46" rx="2" className={styles.paperFill} />
        <rect x="11" y="30" width="78" height="40" fill="none" className={styles.dashRed} />
        <rect x="11" y="30" width="78" height="40" fill="none" className={styles.dashBlue} />
        <g transform={`translate(19 56) scale(.7) skewX(-${LEAN})`}>
          <path d={tag.main} className={styles.tagInk} />
          {tag.extra.map((d, i) => (
            <path key={i} d={d} className={styles.tagInk} />
          ))}
        </g>
      </>
    ),
  },
];

export function StickerWall() {
  const hintId = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const homes = useRef(new WeakMap<HTMLElement, { x: number; y: number }>());
  const drag = useRef<{ id: number; sx: number; sy: number; ox: number; oy: number; lx: number; box: [number, number, number, number] } | null>(null);
  const top = useRef(10);
  const [phase, setPhase] = useState<"done" | "waiting" | "writing">("done");

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || window.matchMedia(REDUCED).matches || !("IntersectionObserver" in window)) return;
    // Hide the finished wall until the footer is in view, then write it once
    setPhase("waiting");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPhase("writing");
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(stage);
    return () => io.disconnect();
  }, []);

  const move = (el: HTMLElement, x: number, y: number) => {
    homes.current.set(el, { x, y });
    el.style.setProperty("--dx", `${round(x)}px`);
    el.style.setProperty("--dy", `${round(y)}px`);
  };

  /** How far this sticker may travel from where it is now and still stay inside the stage. */
  const room = (el: HTMLElement): [number, number, number, number] => {
    const stage = stageRef.current;
    if (!stage) return [0, 0, 0, 0];
    const s = stage.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const at = homes.current.get(el) ?? { x: 0, y: 0 };
    return [at.x + (s.left - r.left), at.x + (s.right - r.right), at.y + (s.top - r.top), at.y + (s.bottom - r.bottom)];
  };

  const putBack = (el: HTMLElement) => {
    el.dataset.returning = "";
    move(el, 0, 0);
    window.setTimeout(() => delete el.dataset.returning, 500);
  };

  const onDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const el = event.currentTarget;
    el.setPointerCapture(event.pointerId);
    const at = homes.current.get(el) ?? { x: 0, y: 0 };
    drag.current = { id: event.pointerId, sx: event.clientX, sy: event.clientY, ox: at.x, oy: at.y, lx: event.clientX, box: room(el) };
    el.dataset.drag = "";
    el.style.zIndex = String(++top.current);
  };

  const onMove = (event: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== event.pointerId) return;
    const el = event.currentTarget;
    move(el, clamp(d.ox + event.clientX - d.sx, d.box[0], d.box[1]), clamp(d.oy + event.clientY - d.sy, d.box[2], d.box[3]));
    // Thrown stickers lean into the throw and settle back when let go
    el.style.setProperty("--lean", `${round(clamp((event.clientX - d.lx) * 1.4, -16, 16))}deg`);
    d.lx = event.clientX;
  };

  const onUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (drag.current?.id !== event.pointerId) return;
    const el = event.currentTarget;
    drag.current = null;
    delete el.dataset.drag;
    el.style.setProperty("--lean", "0deg");
  };

  const onKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const el = event.currentTarget;
    if (event.key === "Escape") {
      putBack(el);
      return;
    }
    const step = event.shiftKey ? 36 : 12;
    const dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
    if (!dir) return;
    event.preventDefault();
    const box = room(el);
    const at = homes.current.get(el) ?? { x: 0, y: 0 };
    move(el, clamp(at.x + dir[0] * step, box[0], box[1]), clamp(at.y + dir[1] * step, box[2], box[3]));
    el.style.zIndex = String(++top.current);
  };

  const replay = () => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.querySelectorAll<HTMLElement>("[data-sticker]").forEach((el) => {
      move(el, 0, 0);
      el.style.zIndex = "";
    });
    if (window.matchMedia(REDUCED).matches) return;
    setPhase("waiting");
    requestAnimationFrame(() => requestAnimationFrame(() => setPhase("writing")));
  };

  return (
    <div className={styles.stage} ref={stageRef} data-phase={phase} data-native-cursor>
      <p id={hintId} className="visually-hidden">
        Stickers can be dragged, or moved with the arrow keys. Escape puts a sticker back.
      </p>

      <button type="button" className={styles.script} onClick={replay} aria-label="Places seen, moments kept. Write it again.">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className={styles.writing} aria-hidden focusable="false">
          {lines.map(({ word, x, y, start, seconds }, i) => (
            <g key={LINES[i]} transform={`translate(${x} ${y}) skewX(-${LEAN})`}>
              <path d={word.main} pathLength={1} className={styles.stroke} style={{ "--delay": `${round(start)}s`, "--dur": `${round(seconds)}s`, strokeWidth: STROKE } as CSSProperties} />
              {word.extra.map((d, k) => (
                <path key={k} d={d} className={styles.extra} style={{ "--delay": `${round(start + seconds)}s`, strokeWidth: STROKE } as CSSProperties} />
              ))}
            </g>
          ))}
        </svg>
      </button>

      {STICKERS.map((s) => (
        <button
          key={s.id}
          type="button"
          data-sticker
          className={styles.sticker}
          aria-label={s.label}
          aria-describedby={hintId}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onKeyDown={onKey}
          onDoubleClick={(event) => putBack(event.currentTarget)}
          style={
            {
              "--x": `${s.at[0]}%`,
              "--y": `${s.at[1]}%`,
              "--mx": `${s.narrow[0]}%`,
              "--my": `${s.narrow[1]}%`,
              "--w": s.size,
              "--ratio": s.ratio ?? 1,
              "--rot": `${s.rotate}deg`,
              "--land": `${round(0.15 + s.lands * (WRITE_SECONDS - 0.4))}s`,
            } as CSSProperties
          }
        >
          <svg viewBox={s.view ?? "0 0 100 100"} aria-hidden focusable="false" className={styles.art}>
            {s.art}
          </svg>
        </button>
      ))}
    </div>
  );
}
