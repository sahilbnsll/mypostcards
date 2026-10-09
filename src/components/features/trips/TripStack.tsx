import Link from "next/link";
import type { CSSProperties } from "react";
import { Photo } from "@/components/ui/Photo";
import type { Trip } from "@/content/types";
import { formatRange, plural } from "@/lib/utils";
import styles from "./TripStack.module.css";

interface TripStackProps {
  trips: Trip[];
  /** Postcards per trip slug. */
  counts: Record<string, number>;
}

/**
 * Featured trips as cards that stack as you scroll, adapted from the scroll-cards reference.
 * Each card is `position: sticky` a little lower than the one before, so the next one slides over
 * it. Plain CSS: normal scrolling, nothing intercepted, nothing to switch off for reduced motion.
 */
export function TripStack({ trips, counts }: TripStackProps) {
  return (
    <ul role="list" className={styles.stack}>
      {trips.map((trip, index) => {
        const when = formatRange(trip.startDate, trip.endDate, trip.periodLabel);
        return (
          <li key={trip.slug} className={styles.item} style={{ "--i": index } as CSSProperties}>
            <article className={styles.card}>
              <Photo
                image={trip.coverImage}
                sizes="(min-width: 90rem) 1400px, 100vw"
                className={styles.photo}
                position="50% 40%"
              />
              <div className={styles.scrim} aria-hidden />
              <div className={styles.text}>
                <h3 className={styles.title}>
                  <Link href={`/trips/${trip.slug}`} className={styles.link}>
                    {trip.title}
                  </Link>
                </h3>
                <p className={styles.summary}>{trip.summary}</p>
                <p className={styles.meta}>
                  {[plural(counts[trip.slug] ?? 0, "postcard"), when].filter(Boolean).join(", ")}
                </p>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
