import Link from "next/link";
import { reveal } from "@/lib/reveal";
import { Photo } from "@/components/ui/Photo";
import { Rating } from "@/components/ui/Rating";
import type { Cafe } from "@/content/types";
import { plural } from "@/lib/utils";
import styles from "./CafeCard.module.css";

export function CafeCard({ cafe, count, index = 0, as: Heading = "h3" }: { cafe: Cafe; count: number; index?: number; as?: "h2" | "h3" }) {
  const where = [cafe.neighborhood, cafe.city, cafe.country].filter(Boolean).join(", ");
  return (
    <article className={styles.card} {...reveal("text", index)}>
      <Link href={`/cafes/${cafe.slug}`} className={styles.media} tabIndex={-1} aria-hidden>
        <Photo image={cafe.coverImage} ratio="4 / 3" sizes="(min-width: 62rem) 30vw, (min-width: 40rem) 45vw, 100vw" imageClassName={styles.img} />
      </Link>
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
