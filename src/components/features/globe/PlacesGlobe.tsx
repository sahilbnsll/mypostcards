import Link from "next/link";
import type { GlobePin } from "@/content/selectors";
import { GlobePostcards } from "./GlobePostcards";
import styles from "./PlacesGlobe.module.css";

/**
 * The globe plus a plain list of the places pinned on it. The globe is decorative; the list is
 * the accessible version of the same information, and each entry opens that postcard.
 */
export function PlacesGlobe({ pins }: { pins: GlobePin[] }) {
  if (pins.length === 0) return null;
  return (
    <div className={styles.band}>
      <div className={styles.text}>
        <p className={styles.lede}>
          Each pin is a postcard with a known location. Turn the globe by dragging it, or pick a place from the list.
        </p>
        <ul role="list" className={styles.list} aria-label="Pinned postcards">
          {pins.map((pin) => (
            <li key={pin.id}>
              <Link href={`/gallery#p=${pin.id}`} className={styles.link}>
                <span className={styles.title}>{pin.title}</span>
                <span className={styles.label}>{pin.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <GlobePostcards pins={pins} />
    </div>
  );
}
