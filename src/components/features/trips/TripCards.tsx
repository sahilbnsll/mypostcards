import type { CSSProperties } from "react";
import { reveal } from "@/lib/reveal";
import type { ImageAsset, Trip } from "@/content/types";
import { formatRange, plural } from "@/lib/utils";
import { PostcardFolder } from "./PostcardFolder";
import styles from "./TripCards.module.css";

interface TripCardsProps {
  trips: Trip[];
  /** Postcards per trip slug. */
  counts: Record<string, number>;
  /** A few photographs per trip slug, tucked into its folder. */
  prints?: Record<string, ImageAsset[]>;
}

/**
 * Trips as card folders (see PostcardFolder). Hover or focus one and its neighbours recede, done
 * in CSS with :has(), so it costs no JavaScript.
 */
export function TripCards({ trips, counts, prints = {} }: TripCardsProps) {
  return (
    <ul role="list" className={styles.grid} style={{ "--cols": Math.min(Math.max(trips.length, 1), 3) } as CSSProperties}>
      {trips.map((trip, index) => (
        <li key={trip.slug} className={styles.cell} {...reveal("text", index)}>
          <PostcardFolder
            href={`/trips/${trip.slug}`}
            title={trip.title}
            summary={trip.summary}
            cover={trip.coverImage}
            prints={prints[trip.slug]}
            tab={plural(counts[trip.slug] ?? 0, "postcard")}
            meta={formatRange(trip.startDate, trip.endDate, trip.periodLabel)}
            className={styles.card}
          />
        </li>
      ))}
    </ul>
  );
}
