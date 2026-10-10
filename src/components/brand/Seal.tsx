import { useId } from "react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import styles from "./Seal.module.css";

/** Short sun rays above the lens, as in the logo. */
const RAYS = [-150, -120, -90, -60, -30].map((deg) => {
  const a = (deg * Math.PI) / 180;
  return { x1: 100 + Math.cos(a) * 10.5, y1: 107 + Math.sin(a) * 10.5, x2: 100 + Math.cos(a) * 14, y2: 107 + Math.sin(a) * 14 };
});

/**
 * The round travel-photo-journal badge, drawn as live SVG so its lettering is real text that
 * follows the ring and stays sharp at any size. Colours come from the theme.
 */
export function Seal({ className, label = `${siteConfig.name}: ${siteConfig.descriptor}` }: { className?: string; label?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={cn(styles.seal, className)} viewBox="0 0 200 200" role="img" aria-label={label}>
      <defs>
        {/* Top lettering runs clockwise over the top; bottom lettering left to right under it */}
        <path id={`${id}-top`} d="M 28 100 A 72 72 0 0 1 172 100" />
        <path id={`${id}-bottom`} d="M 16 100 A 84 84 0 0 0 184 100" />
      </defs>
      <g fill="none" stroke="var(--logo-ink)">
        <circle cx="100" cy="100" r="95" strokeWidth="3.4" />
        <circle cx="100" cy="100" r="64" strokeWidth="2.4" />
      </g>
      <g className={styles.letters} fill="var(--logo-ink)">
        <text fontSize="17" letterSpacing="3.4">
          <textPath href={`#${id}-top`} startOffset="50%" textAnchor="middle">
            MYPOSTCARDS
          </textPath>
        </text>
        <text fontSize="12.5" letterSpacing="2.6">
          <textPath href={`#${id}-bottom`} startOffset="50%" textAnchor="middle">
            {siteConfig.descriptor.toUpperCase()}
          </textPath>
        </text>
        <circle cx="19" cy="100" r="3" />
        <circle cx="181" cy="100" r="3" />
      </g>
      <g fill="none" stroke="var(--logo-main)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="62" y="84" width="76" height="50" rx="9" />
        <path d="M79 84l5-11h32l5 11" />
        <circle cx="100" cy="109" r="16" />
      </g>
      <g fill="none" stroke="var(--logo-accent)" strokeWidth="2.6" strokeLinecap="round">
        <path d="M91 107a9 9 0 0 1 18 0" />
        {RAYS.map((ray, i) => (
          <line key={i} {...ray} />
        ))}
      </g>
    </svg>
  );
}
