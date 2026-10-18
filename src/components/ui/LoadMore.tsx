"use client";

import styles from "./LoadMore.module.css";

interface LoadMoreProps {
  shown: number;
  total: number;
  /** How many more one press reveals. */
  step: number;
  /** "postcards", "cards": used in the sentence under the bar. */
  noun: string;
  onMore: () => void;
  onAll?: () => void;
}

/**
 * The foot of a long list: how far through it you are, and a button for the next batch. Used
 * instead of endless scrolling, so the page stays a sensible length and the footer stays reachable.
 * New items are announced politely; focus stays on the button.
 */
export function LoadMore({ shown, total, step, noun, onMore, onAll }: LoadMoreProps) {
  if (total <= shown) return null;
  const next = Math.min(step, total - shown);
  return (
    <div className={styles.more}>
      <div className={styles.meter} role="presentation">
        <span className={styles.fill} style={{ width: `${Math.round((shown / total) * 100)}%` }} />
      </div>
      <p className={styles.status} aria-live="polite">
        Showing {shown} of {total} {noun}
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.button} onClick={onMore}>
          Show {next} more
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M7 2v10M2 7.5 7 12.5 12 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {onAll && total - shown > step && (
          <button type="button" className={styles.link} onClick={onAll}>
            Show all {total}
          </button>
        )}
      </div>
    </div>
  );
}
