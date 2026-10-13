import styles from "./MapLink.module.css";

/** "Open in Maps": a text link in the details row under a café's name. Opens the map in a new tab. */
export function MapLink({ href, name }: { href: string; name: string }) {
  return (
    <a href={href} className={styles.link} target="_blank" rel="noopener noreferrer" aria-label={`Open ${name} in Maps (new tab)`}>
      <span className="text-link">Open in Maps</span>
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden className={styles.arrow}>
        <path d="M3 9 9 3M4 3h5v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}
