import { useId } from "react";
import { siteConfig } from "@/config/site";
import { StampBody } from "./StampArt";
import { cn } from "@/lib/utils";
import styles from "./Seal.module.css";

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
            MY POSTCARDS
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
      {/* The logo's stamp in the middle of the ring */}
      <svg x="77" y="68" width="46" height="56" viewBox="0 0 64 78" aria-hidden>
        <StampBody id={`${id}-stamp`} />
      </svg>
    </svg>
  );
}
