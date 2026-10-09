import { Photo } from "@/components/ui/Photo";
import type { Postcard } from "@/content/types";
import styles from "./ZoomGallery.module.css";

/**
 * A collage that opens up as you scroll past it: the centre photograph grows until it fills the
 * screen and the others fly out to the edges. Adapted from the zoom-parallax reference, but driven
 * by CSS scroll-linked animation instead of framer-motion and Lenis, so scrolling is never smoothed
 * or intercepted.
 *
 * Only runs on wide screens, with motion allowed, in browsers that support it. Everywhere else it
 * is a plain grid of the same photographs.
 */
export function ZoomGallery({ postcards }: { postcards: Postcard[] }) {
  const tiles = postcards.slice(0, 7);
  if (tiles.length < 7) return null;

  return (
    <div className={styles.zoom}>
      <div className={styles.stage}>
        <ul role="list" className={styles.tiles}>
          {tiles.map((card, index) => (
            <li key={card.slug} className={styles.tile} data-tile={index}>
              <div className={styles.frame}>
                <Photo image={card.image} sizes="(min-width: 62rem) 100vw, 50vw" className={styles.photo} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
