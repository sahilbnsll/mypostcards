import { useId } from "react";
import { StampArt } from "@/components/brand/StampArt";
import type { Tone } from "@/components/brand/stampGeometry";
import { cn } from "@/lib/utils";

/**
 * The decorative stamp on hero cards and postcard backs: the logo's own stamp. `tone` picks the
 * window: "ink" is the logo itself (night sky), "red" and "blue" are the same stamp in the site's
 * airmail colours. The drawing is shared with the header, the footer and the favicon.
 */
export function Stamp({ className, tone = "blue", label }: { className?: string; tone?: "blue" | "red" | "ink"; label?: string }) {
  const map: Record<"blue" | "red" | "ink", Tone> = { blue: "blue", red: "red", ink: "night" };
  return <StampArt className={className} tone={map[tone]} label={label} />;
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
