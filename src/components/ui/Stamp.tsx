import { useId } from "react";
import { cn } from "@/lib/utils";

/** Which colour set each tone uses: the --stamp-clay-*, --stamp-green-* and --stamp-brown-* tokens. */
const TONES = { red: "clay", blue: "green", ink: "brown" } as const;

/**
 * The logo's postage stamp. A warm paper edge with perforations, a window graded from light to
 * deep with a thin inset line, the camera from the logo (its lens holds the sun and mountains),
 * and cancellation waves running across the corner, as on the logo's postmark. Decorative.
 * `tone`: "blue" is the logo green, "red" its clay, "ink" its brown. Every colour is a --stamp-*
 * token, so the stamp has a light-theme and a dark-theme palette (softer paper and a brighter
 * window with dark lines at night).
 */
export function Stamp({
  className,
  tone = "blue",
  label,
}: {
  className?: string;
  tone?: "blue" | "red" | "ink";
  label?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const maskId = `stamp-${uid}`;
  const paperId = `stamp-paper-${uid}`;
  const fieldId = `stamp-field-${uid}`;
  const set = TONES[tone];
  const line = `var(--stamp-${set}-line)`;
  return (
    <svg
      className={cn(className)}
      viewBox="0 0 64 78"
      style={{ overflow: "visible" }}
      role="img"
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <defs>
        <linearGradient id={paperId} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" style={{ stopColor: "var(--stamp-paper-a)" }} />
          <stop offset="1" style={{ stopColor: "var(--stamp-paper-b)" }} />
        </linearGradient>
        <linearGradient id={fieldId} x1="0.1" y1="0" x2="0.5" y2="1">
          <stop offset="0" style={{ stopColor: `var(--stamp-${set}-a)` }} />
          <stop offset="1" style={{ stopColor: `var(--stamp-${set}-b)` }} />
        </linearGradient>
        {/* The perforations: dots punched out of the edge */}
        <mask id={maskId}>
          <rect width="64" height="78" fill="#fff" />
          <g fill="#000">
            {Array.from({ length: 8 }, (_, i) => (
              <circle key={`t${i}`} cx={4 + i * 8} cy="0" r="2.6" />
            ))}
            {Array.from({ length: 8 }, (_, i) => (
              <circle key={`b${i}`} cx={4 + i * 8} cy="78" r="2.6" />
            ))}
            {Array.from({ length: 10 }, (_, i) => (
              <circle key={`l${i}`} cx="0" cy={4 + i * 8} r="2.6" />
            ))}
            {Array.from({ length: 10 }, (_, i) => (
              <circle key={`r${i}`} cx="64" cy={4 + i * 8} r="2.6" />
            ))}
          </g>
        </mask>
      </defs>

      <g mask={`url(#${maskId})`}>
        <rect width="64" height="78" fill={`url(#${paperId})`} />
        <rect x="7" y="7" width="50" height="64" fill={`url(#${fieldId})`} />
        {/* The thin line printed just inside the window */}
        <rect x="10" y="10" width="44" height="58" rx="1" fill="none" stroke={line} strokeOpacity="0.5" strokeWidth="0.9" />
      </g>

      {/* The camera, with the logo's lens: a sun over two peaks */}
      <g fill="none" stroke={line} strokeLinecap="round" strokeLinejoin="round">
        <g strokeWidth="2.4">
          <rect x="14.5" y="27" width="35" height="23" rx="4.6" />
          <path d="M23 27l2.4-4.6h13.2L41 27" />
          <circle cx="32" cy="38.5" r="7.6" />
        </g>
        <g strokeWidth="1.3">
          <path d="M27.4 39.4a4.7 4.7 0 0 1 9.2 0" />
          <path d="M26.4 43.4l3.6-3.4 2.2 2 1.8-1.5 3.6 2.9" />
          <path d="M32 31.6v-1.2M27.6 33.4l-.8-.9M36.4 33.4l.8-.9" strokeWidth="1" />
        </g>
      </g>
      <rect x="42.2" y="30" width="4.2" height="2.4" rx="0.7" fill={line} />

      {/* Cancellation waves across the lower corner */}
      <g fill="none" stroke="var(--stamp-cancel)" strokeOpacity="0.34" strokeWidth="1.4" strokeLinecap="round">
        <path d="M-6 57 q4 -3.4 8 0 t8 0 t8 0 t8 0 t8 0 t8 0 t8 0 t8 0 t8 0" />
        <path d="M-6 62.2 q4 -3.4 8 0 t8 0 t8 0 t8 0 t8 0 t8 0 t8 0 t8 0 t8 0" />
        <path d="M-6 67.4 q4 -3.4 8 0 t8 0 t8 0 t8 0 t8 0 t8 0 t8 0 t8 0 t8 0" />
      </g>
    </svg>
  );
}

/**
 * A circular postmark. `lines` run along the top arc; `date` sits in the middle.
 * The middle word is a year, "kept" for an undated postcard of the author's, or "someday" for a stand-in photograph.
 */
export function Postmark({
  top,
  date,
  className,
}: {
  top: string;
  date: string;
  className?: string;
}) {
  const id = `pm-${useId().replace(/:/g, "")}`;
  return (
    <svg className={cn(className)} viewBox="0 0 120 120" aria-hidden focusable="false">
      <defs>
        <path id={id} d="M 18 60 A 42 42 0 0 1 102 60" />
      </defs>
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="60" cy="60" r="54" />
        <circle cx="60" cy="60" r="35" strokeWidth="1.25" />
      </g>
      <text fill="currentColor" fontSize="11.5" fontWeight="600" letterSpacing="2.4" fontFamily="var(--font-display)">
        <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
          {top.toUpperCase()}
        </textPath>
      </text>
      <text
        x="60"
        y="66"
        textAnchor="middle"
        fill="currentColor"
        fontSize="13"
        fontWeight="700"
        letterSpacing="0.8"
        fontFamily="var(--font-display)"
      >
        {date.toUpperCase()}
      </text>
      <g stroke="currentColor" strokeWidth="1.25" fill="none">
        <path d="M 30 92 H 90" />
        <path d="M 36 98 H 84" />
      </g>
    </svg>
  );
}
