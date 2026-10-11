import Link from "next/link";
import { reveal } from "@/lib/reveal";
import styles from "./SectionHeader.module.css";

interface SectionHeaderProps {
  id?: string;
  title: string;
  intro?: string;
  action?: { href: string; label: string };
  badge?: React.ReactNode;
}

export function SectionHeader({ id, title, intro, action, badge }: SectionHeaderProps) {
  return (
    <div className={styles.head} {...reveal("text")}>
      <div>
        <div className={styles.titleRow}>
          <h2 id={id} className={styles.title}>
            {title}
          </h2>
          {badge && <span className={styles.badge}>{badge}</span>}
        </div>
        {intro && <p className={styles.intro}>{intro}</p>}
      </div>
      {action && (
        <Link href={action.href} className={`text-link ${styles.action}`}>
          {action.label}
        </Link>
      )}
    </div>
  );
}
