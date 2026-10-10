import { CANVAS, sanitizeDrawing, type Stroke, type StrokeColor } from "@/content/visitors-shared";
import styles from "./DrawingSvg.module.css";

const COLOR_CLASS: Record<StrokeColor, string> = {
  ink: styles.ink,
  blue: styles.blue,
  red: styles.red,
};

/** One stroke as an SVG path. A single point becomes a dot (a zero-length line with round caps). */
function pathOf(stroke: Stroke): string {
  const [first, ...rest] = stroke.p;
  if (!first) return "";
  if (rest.length === 0) return `M${first[0]} ${first[1]}l0.01 0`;
  return `M${first[0]} ${first[1]}${rest.map(([x, y]) => `L${x} ${y}`).join("")}`;
}

/**
 * Draws a visitor's strokes. Everything is re-sanitised here, so whatever is in the database can
 * only ever produce known colours, numbers and paths: never markup.
 */
export function DrawingSvg({ strokes, label = "A drawing left by a visitor" }: { strokes: Stroke[]; label?: string }) {
  const safe = sanitizeDrawing(strokes);
  return (
    <svg className={styles.svg} viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`} role="img" aria-label={label}>
      {safe.map((stroke, index) => (
        <path key={index} d={pathOf(stroke)} className={COLOR_CLASS[stroke.c]} strokeWidth={stroke.w} />
      ))}
    </svg>
  );
}
