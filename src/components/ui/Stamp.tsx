import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * A postage stamp: perforated edge, a framed field and a tiny peak glyph. Decorative.
 * `tone` picks the field colour; the perforations take the surrounding surface colour.
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
  const field = tone === "red" ? "var(--air-red)" : tone === "ink" ? "var(--ink)" : "var(--air-blue)";
  return (
    <svg
      className={cn(className)}
      viewBox="0 0 64 78"
      role="img"
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {/* Card with perforated edge: dots punched out with a mask */}
      <defs>
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
        <rect width="64" height="78" fill="var(--print)" />
        <rect x="7" y="7" width="50" height="64" fill={field} />
        <circle cx="45" cy="21" r="5" fill="var(--print)" opacity="0.92" />
        <path d="M7 71 L24 40 L34 56 L42 44 L57 71 Z" fill="var(--print)" opacity="0.92" />
      </g>
    </svg>
  );
}

/**
 * A circular postmark. `lines` run along the top arc; `date` sits in the middle.
 * Falls back to "SAMPLE" when a postcard has no date, which is also honest for stand-in photos.
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
