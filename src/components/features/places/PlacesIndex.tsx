import Link from "next/link";
import { reveal } from "@/lib/reveal";
import { Photo } from "@/components/ui/Photo";
import type { Destination } from "@/content/types";
import { plural } from "@/lib/utils";
import styles from "./PlacesIndex.module.css";

interface PlacesIndexProps {
  places: Destination[];
  counts: Record<string, number>;
}

/**
 * Places as a typographic index. The names are the interface; a small print slides out beside
 * the one you point at.
 */
export function PlacesIndex({ places, counts }: PlacesIndexProps) {
  return (
    <ul role="list" className={styles.list}>
      {places.map((place, index) => (
        <li key={place.slug} {...reveal("text", index)}>
          <Link href={`/destinations/${place.slug}`} className={styles.row}>
            <span className={styles.name}>{place.name}</span>
            <span className={styles.where}>{[place.region, place.country].filter(Boolean).join(", ")}</span>
            <span className={styles.count}>{place.status === "planned" ? "On the list" : plural(counts[place.slug] ?? 0, "postcard")}</span>
            <span className={styles.thumb} aria-hidden data-planned={place.status === "planned" || undefined}>
              {place.coverImage ? (
                <Photo image={place.coverImage} ratio="4 / 3" sizes="(min-width: 62rem) 16rem, 8rem" />
              ) : (
                <span className={styles.someday}>Someday</span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
