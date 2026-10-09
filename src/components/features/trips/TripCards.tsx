import Link from "next/link";
import { reveal } from "@/lib/reveal";
import { Photo } from "@/components/ui/Photo";
import type { Trip } from "@/content/types";
import { formatRange, plural } from "@/lib/utils";
import styles from "./TripCards.module.css";

interface TripCardsProps {
  trips: Trip[];
  /** Postcards per trip slug. */
  counts: Record<string, number>;
}

/**
 * Trip cards in the "focus" pattern from the design reference: hover or focus one card and its
 * neighbours recede. Done in CSS with :has(), so it costs no JavaScript.
 */
export function TripCards({ trips, counts }: TripCardsProps) {
  return (
    <ul role="list" className={styles.grid}>
      {trips.map((trip, index) => {
        const count = counts[trip.slug] ?? 0;
        const when = formatRange(trip.startDate, trip.endDate, trip.periodLabel);
        return (
          <li key={trip.slug} className={styles.cell} {...reveal("text", index)}>
            <Link href={`/trips/${trip.slug}`} className={styles.card}>
              <Photo
                image={trip.coverImage}
                ratio="4 / 5"
                sizes="(min-width: 62rem) 30vw, (min-width: 40rem) 50vw, 100vw"
                className={styles.photo}
                imageClassName={styles.img}
              />
              <span className={styles.text}>
                <span className={styles.title}>{trip.title}</span>
                <span className={styles.summary}>{trip.summary}</span>
                <span className={styles.meta}>
                  {[plural(count, "postcard"), when].filter(Boolean).join(", ")}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
