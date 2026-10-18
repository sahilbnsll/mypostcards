import Link from "next/link";
import { reveal } from "@/lib/reveal";
import { Photo } from "@/components/ui/Photo";
import { Rating } from "@/components/ui/Rating";
import type { Cafe, ImageAsset } from "@/content/types";
import { plural } from "@/lib/utils";
import styles from "./CafeCard.module.css";

interface CafeCardProps {
  cafe: Cafe;
  count: number;
  index?: number;
  as?: "h2" | "h3";
  /** Up to two other photographs from the café, tucked behind the cover; they fan out on hover. */
  prints?: ImageAsset[];
}

/**
 * A café as a card. Its cover sits on top of a small stack of the café's other prints, which fan
 * out sideways when you point at it (the stacked-image card from the design reference, in CSS).
 */
export function CafeCard({ cafe, count, index = 0, as: Heading = "h3", prints = [] }: CafeCardProps) {
  const where = [cafe.neighborhood, cafe.city, cafe.country].filter(Boolean).join(", ");
  return (
    <article className={styles.card} {...reveal("text", index)}>
      <div className={styles.stack} data-prints={Math.min(prints.length, 2)}>
        {prints.slice(0, 2).map((image, i) => (
          <span key={image.src} className={styles.print} data-side={i === 0 ? "left" : "right"} aria-hidden>
            <Photo image={image} ratio="4 / 3" sizes="(min-width: 62rem) 30vw, (min-width: 40rem) 45vw, 100vw" decorative />
          </span>
        ))}
        <Link href={`/cafes/${cafe.slug}`} className={styles.media} tabIndex={-1} aria-hidden>
          <Photo image={cafe.coverImage} ratio="4 / 3" sizes="(min-width: 62rem) 30vw, (min-width: 40rem) 45vw, 100vw" imageClassName={styles.img} />
        </Link>
      </div>
      <Heading className={styles.name}>
        <Link href={`/cafes/${cafe.slug}`}>{cafe.name}</Link>
      </Heading>
      {where && <p className={styles.where}>{where}</p>}
      {cafe.vibeTags.length > 0 && (
        <ul role="list" className={styles.tags} aria-label="Vibe">
          {cafe.vibeTags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}
      {cafe.rating && <Rating value={cafe.rating} size="sm" className={styles.rating} />}
      <p className={styles.meta}>
        {[cafe.favoriteOrder ? `Usual order: ${cafe.favoriteOrder}` : undefined, cafe.price, plural(count, "postcard")].filter(Boolean).join(", ")}
      </p>
    </article>
  );
}
