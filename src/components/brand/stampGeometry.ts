/**
 * The logo: one postage stamp, drawn on a 64 by 78 sheet. Its frame is the airmail stripe the site
 * uses on its edges, its window is a night sky with a sun and two peaks, and its paper is
 * perforated. A stamp is a physical object, so these colours are fixed and do not change with
 * the theme (only the wordmark and the cancellation waves beside it do).
 *
 * Everything that draws the mark (the React components, the favicon, the share images) reads this
 * file, so the logo is defined in exactly one place.
 */

export const COLORS = {
  paper: "#fbfbf8",
  night: "#0c1424",
  red: "#d8362b",
  redLit: "#e8574b",
  blue: "#1f4da6",
  blueLit: "#4a78d6",
  cream: "#fbfbf8",
  ink: "#0f1a2b",
} as const;

export type Tone = "night" | "red" | "blue";

/** The window colours for each variant of the stamp. "night" is the logo itself. */
export const TONES: Record<Tone, { window: string; back: string; front: string; cap: string }> = {
  night: { window: COLORS.night, back: COLORS.blueLit, front: COLORS.redLit, cap: COLORS.cream },
  red: { window: COLORS.red, back: COLORS.night, front: COLORS.cream, cap: COLORS.cream },
  blue: { window: COLORS.blue, back: COLORS.night, front: COLORS.cream, cap: COLORS.cream },
};

/** The airmail stripe frame, then the window inside it. */
export const FRAME = { x: 6, y: 6, width: 52, height: 66 } as const;
export const WINDOW = { x: 10.5, y: 10.5, width: 43, height: 57 } as const;

/** The scene in the window: a sun with a soft halo, a snow-capped peak behind a red one. */
export const SUN = { cx: 42, cy: 26, r: 6, halo: 9.5 } as const;
export const PEAKS = {
  back: "M8 68 L27 37 L46 68 Z",
  cap: "M27 37 L22.4 45 L25.6 43.2 L27 46.4 L28.6 43.2 L31.8 45 Z",
  front: "M23 68 L41 43 L56 62 L56 68 Z",
} as const;

/** The stripe pattern: red, paper, blue on the diagonal, as on the site's airmail edges. */
export const STRIPES = { size: 10, rotate: 45, red: { x: 0, width: 3.4 }, blue: { x: 5, width: 3.4 } } as const;

/** Where the perforation holes are punched out of the paper (centres, on a 64 by 78 sheet). */
export const HOLES: ReadonlyArray<readonly [number, number]> = [
  ...Array.from({ length: 8 }, (_, i) => [4 + i * 8, 0] as const),
  ...Array.from({ length: 8 }, (_, i) => [4 + i * 8, 78] as const),
  ...Array.from({ length: 10 }, (_, i) => [0, 4 + i * 8] as const),
  ...Array.from({ length: 10 }, (_, i) => [64, 4 + i * 8] as const),
];
export const HOLE_RADIUS = 2.6;

/** Cancellation waves trailing off to the left of the stamp, as on a postmark. */
export const WAVES: readonly string[] = [48, 55, 62].map((y) => `M-34 ${y} q6 -4.5 12 0 t12 0 t12 0`);

/** The view box of the stamp alone, and of the stamp with its waves. */
export const VIEWBOX_STAMP = "0 0 64 78";
export const VIEWBOX_LOCKUP = "-34 -2 100 82";
