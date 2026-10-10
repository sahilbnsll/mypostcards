"use client";

import { Photo } from "@/components/ui/Photo";
import { Lightbox } from "@/components/features/lightbox/Lightbox";
import { useLightbox } from "@/components/features/lightbox/useLightbox";
import type { LightboxItem } from "@/components/features/lightbox/types";
import { formatLocation } from "@/lib/utils";
import styles from "./FeaturedBento.module.css";

/**
 * Five selected postcards in a bento: one large tile and four small, each cropped on purpose.
 * Adapted from the gallery-4 reference: black and white until you point at a tile, then colour.
 * Opens the same lightbox as the rest of the site (stepping through just these five).
 *
 * Touch screens have no hover, so tiles stay in colour there.
 */
export function FeaturedBento({ items }: { items: LightboxItem[] }) {
  // The full gallery below owns the URL hash; this one only needs to open and close.
  const lightbox = useLightbox(items, { syncHash: false });
  if (items.length < 5) return null;

  return (
    <>
      <ul role="list" className={styles.bento}>
        {items.slice(0, 5).map((item, index) => {
          const where = formatLocation(item.location, ["city", "country"]);
          return (
            <li key={item.slug} className={styles.cell} data-large={index === 0 || undefined}>
              <button
                type="button"
                className={styles.tile}
                aria-label={`Open ${[item.title, where].filter(Boolean).join(", ")}`}
                onClick={(event) => lightbox.open(item.slug, event.currentTarget)}
              >
                <Photo
                  image={item.image}
                  sizes={index === 0 ? "(min-width: 62rem) 50vw, 100vw" : "(min-width: 62rem) 25vw, 50vw"}
                  className={styles.photo}
                  position="50% 40%"
                />
                <span className={styles.caption} aria-hidden>
                  <span className={styles.title}>{item.title}</span>
                  {where && <span className={styles.where}>{where}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <Lightbox
        list={lightbox.state?.list ?? null}
        index={lightbox.state?.index ?? 0}
        origin={lightbox.state?.origin ?? null}
        onIndexChange={lightbox.setIndex}
        onClose={lightbox.close}
      />
    </>
  );
}
