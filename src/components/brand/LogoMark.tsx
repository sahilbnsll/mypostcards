import { cn } from "@/lib/utils";
import { StampArt } from "./StampArt";
import styles from "./LogoMark.module.css";

/**
 * The full mark: the stamp with the cancellation waves trailing off to its left. Used where the logo
 * has room (the footer, the 404 page). Pass a `label` to name it for screen readers; otherwise it is
 * treated as decoration.
 */
export function LogoMark({ className, label }: { className?: string; label?: string }) {
  return <StampArt waves className={cn(styles.mark, className)} label={label} />;
}
