import { useId } from "react";

/**
 * The small mark for the header: a perforated stamp with a camera on it, drawn with thicker lines
 * than the full logo so it still reads at 25 to 30 pixels. Colours come from the theme.
 */
export function StampMark({ className }: { className?: string }) {
  const maskId = `stamp-mark-${useId().replace(/:/g, "")}`;
  return (
    <svg className={className} viewBox="0 0 64 78" aria-hidden focusable="false">
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
      <rect width="64" height="78" fill="var(--logo-main)" mask={`url(#${maskId})`} />
      <g fill="none" stroke="var(--logo-paper)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="13" y="31" width="38" height="25" rx="5" />
        <path d="M22.5 31 25 25h14l2.5 6" />
        <circle cx="32" cy="43.5" r="7" />
      </g>
      <circle cx="32" cy="43.5" r="2.6" fill="var(--logo-accent)" />
    </svg>
  );
}
