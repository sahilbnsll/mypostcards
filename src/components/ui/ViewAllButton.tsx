import Link from "next/link";
import styles from "./ViewAllButton.module.css";

interface ViewAllButtonProps {
  href: string;
  children: React.ReactNode;
}

/** The "see everything" call to action at the foot of a preview section: an airmail envelope. */
export function ViewAllButton({ href, children }: ViewAllButtonProps) {
  return (
    <div className={styles.wrap}>
      <Link href={href} className={styles.button}>
        {children}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden className={styles.arrow}>
          <path d="M1 6h15.5M11.5 1 16.5 6l-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  );
}
