import Link from "next/link";
import { Photo } from "@/components/ui/Photo";
import type { Postcard } from "@/content/types";
import { reveal } from "@/lib/reveal";
import { formatLocation } from "@/lib/utils";
import styles from "./RelatedPostcards.module.css";

/** A short row of postcards that share a place, trip, tags or kind with the one being viewed. */
export function RelatedPostcards({ postcards }: { postcards: Postcard[] }) {
  return (
    <ul role="list" className={styles.grid}>
      {postcards.map((card, index) => (
        <li key={card.slug} {...reveal("photo", index)}>
          <Link href={`/postcards/${card.slug}`} className={styles.card}>
            <Photo image={card.image} ratio="4 / 5" sizes="(min-width: 62rem) 22vw, 45vw" className={styles.photo} imageClassName={styles.img} />
            <span className={styles.title}>{card.title}</span>
            <span className={styles.where}>{formatLocation(card.location, ["city", "country"]) || "Postcard"}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
