import { useId } from "react";
import { FRAME, HOLES, HOLE_RADIUS, PEAKS, STRIPES, SUN, TONES, VIEWBOX_LOCKUP, VIEWBOX_STAMP, WAVES, WINDOW, COLORS, type Tone } from "./stampGeometry";

/** The stamp's drawing without its <svg> wrapper, so it can also sit inside another drawing (the seal). */
export function StampBody({ id, tone = "night" }: { id: string; tone?: Tone }) {
  const colors = TONES[tone];
  return (
    <>
      <defs>
        <mask id={`${id}-holes`}>
          <rect width="64" height="78" fill="#fff" />
          <g fill="#000">
            {HOLES.map(([cx, cy]) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={HOLE_RADIUS} />
            ))}
          </g>
        </mask>
        <pattern id={`${id}-stripes`} width={STRIPES.size} height={STRIPES.size} patternUnits="userSpaceOnUse" patternTransform={`rotate(${STRIPES.rotate})`}>
          <rect width={STRIPES.size} height={STRIPES.size} fill={COLORS.paper} />
          <rect x={STRIPES.red.x} width={STRIPES.red.width} height={STRIPES.size} fill={COLORS.red} />
          <rect x={STRIPES.blue.x} width={STRIPES.blue.width} height={STRIPES.size} fill={COLORS.blue} />
        </pattern>
        <clipPath id={`${id}-window`}>
          <rect {...WINDOW} />
        </clipPath>
      </defs>
      <g mask={`url(#${id}-holes)`}>
        <rect width="64" height="78" fill={COLORS.paper} />
        <rect {...FRAME} fill={`url(#${id}-stripes)`} />
        <rect {...WINDOW} fill={colors.window} />
        <g clipPath={`url(#${id}-window)`}>
          <circle cx={SUN.cx} cy={SUN.cy} r={SUN.halo} fill={COLORS.cream} opacity="0.14" />
          <circle cx={SUN.cx} cy={SUN.cy} r={SUN.r} fill={COLORS.cream} />
          <path d={PEAKS.back} fill={colors.back} />
          <path d={PEAKS.cap} fill={colors.cap} />
          <path d={PEAKS.front} fill={colors.front} />
        </g>
      </g>
    </>
  );
}

/**
 * The logo's stamp. `waves` adds the cancellation waves trailing off to its left (the full mark,
 * for the footer and the 404 page). The waves are drawn in the page's ink, so they follow the theme.
 * Decorative unless a `label` is given.
 */
export function StampArt({ className, tone = "night", waves = false, label }: { className?: string; tone?: Tone; waves?: boolean; label?: string }) {
  const id = `stamp-${useId().replace(/:/g, "")}`;
  return (
    <svg
      className={className}
      viewBox={waves ? VIEWBOX_LOCKUP : VIEWBOX_STAMP}
      style={{ overflow: "visible" }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <StampBody id={id} tone={tone} />
      {waves && (
        <g fill="none" stroke="var(--logo-ink)" strokeOpacity="0.6" strokeWidth="1.8" strokeLinecap="round">
          {WAVES.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      )}
    </svg>
  );
}
