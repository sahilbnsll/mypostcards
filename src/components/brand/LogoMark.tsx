import { cn } from "@/lib/utils";
import styles from "./LogoMark.module.css";

/**
 * The full mark: a postage stamp with a camera, and the postmark waves running off its edge.
 * It is drawn from two single-colour SVG files used as masks, so the frame and the postmark each
 * take their colour from the theme (--logo-main, --logo-accent) and the page ships no path data.
 * Use it at 64px wide and up; below that, use StampMark, which is drawn for small sizes.
 */
export function LogoMark({ className, label }: { className?: string; label?: string }) {
  return (
    <span className={cn(styles.mark, className)} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <span className={styles.main} />
      <span className={styles.accent} />
    </span>
  );
}
