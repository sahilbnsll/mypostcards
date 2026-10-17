import Link from "next/link";
import type { GlobePin } from "@/content/selectors";
import { plural } from "@/lib/utils";
import { GlobePostcards } from "./GlobePostcards";
import styles from "./PlacesGlobe.module.css";

/**
 * The globe plus a plain list of the places pinned on it, one row per place or named area (Delhi
 * NCR). The globe is decorative; the list is the accessible version of the same information.
 * A row for a single place opens that place; a row for an area lists the places inside it, each
 * with its own link, so nearby cities share one dot but none is hidden.
 */
export function PlacesGlobe({ pins }: { pins: GlobePin[] }) {
  if (pins.length === 0) return null;
  const rows = pins.flatMap((pin) => pin.places.map((place) => ({ ...place, key: `${pin.id}-${place.name}` })));
  return (
    <div className={styles.band}>
      <div className={styles.text}>
        <p className={styles.lede}>
          Every place with a postcard is on the globe. Turn it by dragging, or pick a place from the list.
        </p>
        <ul role="list" className={styles.list} aria-label="Places with postcards">
          {rows.map((row) => (
            <li key={row.key}>
              {row.places.length === 0 ? (
                <Link href={row.href} className={styles.link}>
                  <span className={styles.title}>{row.name}</span>
                  <span className={styles.label}>{plural(row.count, "postcard")}</span>
                </Link>
              ) : (
                <div className={styles.area}>
                  <p className={styles.areaHead}>
                    <span className={styles.title}>{row.name}</span>
                    <span className={styles.label}>{plural(row.count, "postcard")}</span>
                  </p>
                  <ul role="list" className={styles.areaPlaces} aria-label={`Places in ${row.name}`}>
                    {row.places.map((place) => (
                      <li key={place.name}>
                        <Link href={place.href} className={styles.areaLink}>
                          {place.name}
                          <span className={styles.areaCount}>{place.count}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      <GlobePostcards pins={pins} />
    </div>
  );
}
