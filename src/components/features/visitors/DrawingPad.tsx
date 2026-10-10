"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import {
  CANVAS,
  LIMITS,
  STROKE_COLORS,
  STROKE_WIDTHS,
  type Stroke,
  type StrokeColor,
} from "@/content/visitors-shared";
import { cn } from "@/lib/utils";
import { DrawingSvg } from "./DrawingSvg";
import styles from "./DrawingPad.module.css";

interface DrawingPadProps {
  strokes: Stroke[];
  onChange: (strokes: Stroke[]) => void;
}

const COLOR_LABEL: Record<StrokeColor, string> = { ink: "Ink", blue: "Blue", red: "Red" };
const WIDTH_LABEL = ["Thin", "Medium", "Thick"] as const;
/** Skip points closer than this (in canvas units): keeps drawings small without looking jagged. */
const MIN_STEP = 5;

const pointCount = (strokes: Stroke[]) => strokes.reduce((n, s) => n + s.p.length, 0);

/**
 * A small drawing pad. Drawing is recorded as strokes (colour, width, points) rather than an
 * image, so a card stays a few kilobytes and is redrawn as crisp vector lines. It works with a
 * mouse, a finger or a pen; writing is always an alternative.
 */
export function DrawingPad({ strokes, onChange }: DrawingPadProps) {
  const surface = useRef<HTMLDivElement>(null);
  const live = useRef<number | null>(null); // pointer id while a stroke is being drawn
  // The strokes being drawn live here too, so a burst of pointer events never works from a stale copy.
  const latest = useRef(strokes);
  useEffect(() => {
    latest.current = strokes;
  }, [strokes]);
  const commit = (next: Stroke[]) => {
    latest.current = next;
    onChange(next);
  };
  const [color, setColor] = useState<StrokeColor>("ink");
  const [width, setWidth] = useState<number>(STROKE_WIDTHS[1]);
  const full = strokes.length >= LIMITS.strokes || pointCount(strokes) >= LIMITS.totalPoints;

  const locate = (event: PointerEvent): [number, number] => {
    const rect = surface.current!.getBoundingClientRect();
    return [
      Math.round(((event.clientX - rect.left) / rect.width) * CANVAS.width),
      Math.round(((event.clientY - rect.top) / rect.height) * CANVAS.height),
    ];
  };

  const start = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || live.current !== null || full) return;
    event.preventDefault();
    surface.current?.setPointerCapture(event.pointerId);
    live.current = event.pointerId;
    commit([...latest.current, { c: color, w: width, p: [locate(event)] }]);
  };

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (live.current !== event.pointerId) return;
    const current = latest.current;
    const last = current[current.length - 1];
    if (!last || last.p.length >= LIMITS.pointsPerStroke || pointCount(current) >= LIMITS.totalPoints) return;
    const next = locate(event);
    const [px, py] = last.p[last.p.length - 1];
    if (Math.hypot(next[0] - px, next[1] - py) < MIN_STEP) return;
    commit([...current.slice(0, -1), { ...last, p: [...last.p, next] }]);
  };

  const end = (event: PointerEvent<HTMLDivElement>) => {
    if (live.current === event.pointerId) live.current = null;
  };

  return (
    <div className={styles.pad}>
      <div
        ref={surface}
        className={styles.surface}
        data-native-cursor=""
        role="group"
        aria-label="Drawing pad. Draw with a mouse, finger or pen."
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
      >
        <DrawingSvg strokes={strokes} label="Your drawing so far" />
        {strokes.length === 0 && <span className={styles.hint}>Draw here</span>}
      </div>

      <div className={styles.tools}>
        <fieldset className={styles.group}>
          <legend className="visually-hidden">Pen colour</legend>
          {STROKE_COLORS.map((name) => (
            <label key={name} className={styles.swatch} data-color={name}>
              <input type="radio" name="pen-color" value={name} checked={color === name} onChange={() => setColor(name)} />
              <span className="visually-hidden">{COLOR_LABEL[name]}</span>
            </label>
          ))}
        </fieldset>

        <fieldset className={styles.group}>
          <legend className="visually-hidden">Pen width</legend>
          {STROKE_WIDTHS.map((w, i) => (
            <label key={w} className={styles.size}>
              <input type="radio" name="pen-width" value={w} checked={width === w} onChange={() => setWidth(w)} />
              <span className={styles.dot} style={{ width: 6 + i * 5, height: 6 + i * 5 }} aria-hidden />
              <span className="visually-hidden">{WIDTH_LABEL[i]}</span>
            </label>
          ))}
        </fieldset>

        <div className={styles.group}>
          <button type="button" className={cn(styles.action)} onClick={() => onChange(strokes.slice(0, -1))} disabled={strokes.length === 0}>
            Undo
          </button>
          <button type="button" className={cn(styles.action)} onClick={() => onChange([])} disabled={strokes.length === 0}>
            Clear
          </button>
        </div>
      </div>

      <p className={styles.note} role="status" aria-live="polite">
        {full ? "That is the full page. Undo a stroke to keep drawing." : strokes.length > 0 ? `${strokes.length} ${strokes.length === 1 ? "stroke" : "strokes"}` : ""}
      </p>
    </div>
  );
}
