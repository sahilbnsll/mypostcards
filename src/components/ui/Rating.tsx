import { useId } from "react";
import { cn } from "@/lib/utils";
import styles from "./Rating.module.css";

/** Each star is drawn in a 24 square, with a 3 gap between stars. */
const STEP = 27;
const COUNT = 5;

/** 4 stays "4"; 4.5 and 4.8 keep their one decimal. */
const format = (value: number) => (Number.isInteger(value) ? String(value) : value.toFixed(1));

/** A small repeatable random number generator, so every star is "hand drawn" but the same on every render. */
function seeded(seed: number) {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * One hand-drawn star. The points wander a little, the edges bow, each star is turned slightly, and
 * the outline is left open and overshoots where the pen started, like a star drawn in one go.
 */
function handStar(index: number) {
  const random = seeded(index * 7919 + 17);
  const wobble = (amount: number) => (random() - 0.5) * 2 * amount;
  const turn = wobble(0.09);
  const points: Array<[number, number]> = [];
  for (let k = 0; k < 10; k++) {
    const outer = k % 2 === 0;
    const angle = -Math.PI / 2 + (k * Math.PI) / 5 + turn + wobble(0.05);
    const radius = (outer ? 10.4 : 4.6) + wobble(outer ? 0.7 : 0.4);
    points.push([12 + Math.cos(angle) * radius, 12.7 + Math.sin(angle) * radius]);
  }
  const n = (v: number) => v.toFixed(2);
  const edges = points
    .map((from, k) => {
      const to = points[(k + 1) % 10];
      const [dx, dy] = [to[0] - from[0], to[1] - from[1]];
      const length = Math.hypot(dx, dy) || 1;
      const bow = wobble(0.5);
      const cx = (from[0] + to[0]) / 2 - (dy / length) * bow;
      const cy = (from[1] + to[1]) / 2 + (dx / length) * bow;
      return `Q${n(cx)} ${n(cy)} ${n(to[0])} ${n(to[1])}`;
    })
    .join("");
  const start = `M${n(points[0][0])} ${n(points[0][1])}`;
  const overshoot = `L${n(points[0][0] + (points[1][0] - points[0][0]) * 0.16)} ${n(points[0][1] + (points[1][1] - points[0][1]) * 0.16)}`;
  return { fill: `${start}${edges}Z`, line: `${start}${edges}${overshoot}` };
}

const STARS = Array.from({ length: COUNT }, (_, i) => handStar(i));

/**
 * A rating drawn as five hand-drawn stars in marker yellow. Each star is filled by the exact amount
 * (a 4.8 has four full stars and a fifth filled to 80%; values run from 0.5 to 5 with one decimal).
 * The accessible name is the number ("Rated 4.8 out of 5"); the drawing is decoration. The yellow comes from the --star-fill and --star-edge tokens, with a light and a dark
 * palette.
 */
export function Rating({ value, size = "md", showValue = true, className }: { value: number; size?: "sm" | "md"; showValue?: boolean; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const clipId = (i: number) => `rating-clip-${uid}-${i}`;
  const clamped = Math.max(0, Math.min(COUNT, value));

  return (
    <span className={cn(styles.rating, styles[size], className)} role="img" aria-label={`Rated ${format(clamped)} out of ${COUNT}`}>
      <svg className={styles.stars} viewBox={`-1 -1 ${COUNT * STEP - 1} 26`} aria-hidden focusable="false">
        <defs>
          {/* Keeps the coloured part of a partly filled star to its left side. The star itself
              spans about 1.6 to 22.4 across, so the cut is measured over that. */}
          {STARS.map((_, i) => {
            const share = Math.min(1, Math.max(0, clamped - i));
            return share > 0 && share < 1 ? (
              <clipPath key={i} id={clipId(i)}>
                <rect x="-2" y="-2" width={1.6 + share * 20.8 + 2} height="30" />
              </clipPath>
            ) : null;
          })}
        </defs>
        {STARS.map((star, i) => {
          const share = Math.min(1, Math.max(0, clamped - i));
          const state = share >= 1 ? "full" : share > 0 ? "part" : "empty";
          return (
            <g key={i} transform={`translate(${i * STEP} 0)`}>
              {state !== "empty" && (
                // The marker fill sits a hair off the pen line, as it does on paper
                <path d={star.fill} className={styles.fill} transform="translate(0.5 0.6)" clipPath={state === "part" ? `url(#${clipId(i)})` : undefined} />
              )}
              <path d={star.line} className={cn(styles.line, state === "empty" && styles.faint)} />
            </g>
          );
        })}
      </svg>
      {showValue && (
        <span className={styles.value} aria-hidden>
          {format(clamped)}
          <span className={styles.outOf}>/{COUNT}</span>
        </span>
      )}
    </span>
  );
}
