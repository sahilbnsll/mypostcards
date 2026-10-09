import Link from "next/link";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  title: string;
  body: string;
  action?: { href: string; label: string };
}

export function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <div className={styles.empty} role="status">
      <div className="airmail-edge" aria-hidden />
      <div className={styles.inner}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.body}>{body}</p>
        {action && (
          <Link href={action.href} className="text-link">
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}
