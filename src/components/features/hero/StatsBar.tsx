import Link from "next/link";
import styles from "./StatsBar.module.css";

interface StatsBarProps {
  totalPostcards: number;
  totalPlaces: number;
  totalTrips: number;
  totalStories: number;
}

export function StatsBar({
  totalPostcards,
  totalPlaces,
  totalTrips,
  totalStories,
}: StatsBarProps) {
  const stats = [
    { count: totalPostcards, singular: "postcard", pluralText: "postcards", href: "#collection" },
    { count: totalPlaces, singular: "place", pluralText: "places", href: "#places" },
    { count: totalTrips, singular: "trip", pluralText: "trips", href: "#trips" },
    { count: totalStories, singular: "story", pluralText: "stories", href: "#stories" },
  ];

  return (
    <aside className={styles.bar} aria-label="Journal archive scale">
      <div className={`wrap ${styles.inner}`}>
        <ul role="list" className={styles.list}>
          {stats.map((stat, i) => (
            <li key={stat.singular} className={styles.item}>
              <Link href={stat.href} className={styles.link}>
                <span className={styles.num}>{stat.count}</span>
                <span className={styles.label}>
                  {stat.count === 1 ? stat.singular : stat.pluralText}
                </span>
              </Link>
              {i < stats.length - 1 && (
                <span className={styles.dot} aria-hidden>
                  ·
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
