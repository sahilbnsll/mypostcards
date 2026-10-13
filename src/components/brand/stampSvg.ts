import { COLORS, FRAME, HOLES, HOLE_RADIUS, PEAKS, STRIPES, SUN, TONES, VIEWBOX_LOCKUP, VIEWBOX_STAMP, WAVES, WINDOW, type Tone } from "./stampGeometry";

/**
 * The logo as a stand-alone SVG string, in its fixed colours, for places that cannot use the React
 * component: share images, the favicon and the installable-app icons. It draws exactly what StampArt
 * draws, from the same geometry.
 */
export function stampSvg({
  tone = "night",
  waves = false,
  wavesColor = COLORS.ink,
  id = "s",
}: { tone?: Tone; waves?: boolean; wavesColor?: string; id?: string } = {}): string {
  const colors = TONES[tone];
  const holes = HOLES.map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="${HOLE_RADIUS}"/>`).join("");
  const rect = (r: { x: number; y: number; width: number; height: number }) => `x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}"`;
  const wavePaths = waves
    ? `<g fill="none" stroke="${wavesColor}" stroke-opacity="0.6" stroke-width="1.8" stroke-linecap="round">${WAVES.map((d) => `<path d="${d}"/>`).join("")}</g>`
    : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${waves ? VIEWBOX_LOCKUP : VIEWBOX_STAMP}">` +
    `<defs>` +
    `<mask id="${id}-holes"><rect width="64" height="78" fill="#fff"/><g fill="#000">${holes}</g></mask>` +
    `<pattern id="${id}-stripes" width="${STRIPES.size}" height="${STRIPES.size}" patternUnits="userSpaceOnUse" patternTransform="rotate(${STRIPES.rotate})">` +
    `<rect width="${STRIPES.size}" height="${STRIPES.size}" fill="${COLORS.paper}"/>` +
    `<rect x="${STRIPES.red.x}" width="${STRIPES.red.width}" height="${STRIPES.size}" fill="${COLORS.red}"/>` +
    `<rect x="${STRIPES.blue.x}" width="${STRIPES.blue.width}" height="${STRIPES.size}" fill="${COLORS.blue}"/>` +
    `</pattern>` +
    `<clipPath id="${id}-window"><rect ${rect(WINDOW)}/></clipPath>` +
    `</defs>` +
    `<g mask="url(#${id}-holes)">` +
    `<rect width="64" height="78" fill="${COLORS.paper}"/>` +
    `<rect ${rect(FRAME)} fill="url(#${id}-stripes)"/>` +
    `<rect ${rect(WINDOW)} fill="${colors.window}"/>` +
    `<g clip-path="url(#${id}-window)">` +
    `<circle cx="${SUN.cx}" cy="${SUN.cy}" r="${SUN.halo}" fill="${COLORS.cream}" opacity="0.14"/>` +
    `<circle cx="${SUN.cx}" cy="${SUN.cy}" r="${SUN.r}" fill="${COLORS.cream}"/>` +
    `<path d="${PEAKS.back}" fill="${colors.back}"/>` +
    `<path d="${PEAKS.cap}" fill="${colors.cap}"/>` +
    `<path d="${PEAKS.front}" fill="${colors.front}"/>` +
    `</g></g>` +
    wavePaths +
    `</svg>`
  );
}
