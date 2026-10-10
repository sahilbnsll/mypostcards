/**
 * What a visitor card is, shared by the browser (the composer) and the server (the action and the
 * wall). No server-only imports here.
 */

export const CANVAS = { width: 1000, height: 600 } as const;

export const LIMITS = {
  name: 40,
  message: 280,
  strokes: 60,
  pointsPerStroke: 400,
  totalPoints: 2500,
} as const;

export const KINDS = [
  { id: "hello", label: "Say hello", prompt: "What would you like to say?" },
  { id: "place", label: "Suggest a place", prompt: "Where should I go, or what should I try?" },
  { id: "feedback", label: "About the site", prompt: "What works, and what could be better?" },
  { id: "other", label: "Something else", prompt: "Whatever is on your mind." },
] as const;
export type CardKind = (typeof KINDS)[number]["id"];

/** Names, never raw CSS: the page maps each to a colour of its own. */
export const STROKE_COLORS = ["ink", "blue", "red"] as const;
export type StrokeColor = (typeof STROKE_COLORS)[number];
export const STROKE_WIDTHS = [4, 8, 16] as const;

export const CARD_COLORS = ["paper", "sky", "rose", "sun", "mint"] as const;
export type CardColor = (typeof CARD_COLORS)[number];

export interface Stroke {
  c: StrokeColor;
  w: number;
  p: Array<[number, number]>;
}

export interface VisitorCard {
  id: string;
  createdAt: string;
  kind: CardKind;
  name?: string;
  message?: string;
  drawing: Stroke[];
  color: CardColor;
  pinned: boolean;
}

export const isKind = (value: unknown): value is CardKind => KINDS.some((k) => k.id === value);
export const isCardColor = (value: unknown): value is CardColor => CARD_COLORS.includes(value as CardColor);

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * Turns anything into a safe list of strokes: known colours and widths, whole-number points inside
 * the canvas, and the same size limits the database enforces. Used on the way in (the action) and
 * on the way out (the wall), so nothing odd stored in the database can ever reach the page.
 */
export function sanitizeDrawing(raw: unknown): Stroke[] {
  if (!Array.isArray(raw)) return [];
  const strokes: Stroke[] = [];
  let total = 0;
  for (const item of raw.slice(0, LIMITS.strokes)) {
    if (!item || typeof item !== "object") continue;
    const { c, w, p } = item as { c?: unknown; w?: unknown; p?: unknown };
    if (!STROKE_COLORS.includes(c as StrokeColor) || !Array.isArray(p)) continue;
    const points: Array<[number, number]> = [];
    for (const point of p.slice(0, LIMITS.pointsPerStroke)) {
      if (total >= LIMITS.totalPoints) break;
      if (!Array.isArray(point) || typeof point[0] !== "number" || typeof point[1] !== "number") continue;
      if (!Number.isFinite(point[0]) || !Number.isFinite(point[1])) continue;
      points.push([Math.round(clamp(point[0], 0, CANVAS.width)), Math.round(clamp(point[1], 0, CANVAS.height))]);
      total += 1;
    }
    if (points.length === 0) continue;
    const width = STROKE_WIDTHS.includes(w as (typeof STROKE_WIDTHS)[number]) ? (w as number) : 8;
    strokes.push({ c: c as StrokeColor, w: width, p: points });
  }
  return strokes;
}
