import Link from "next/link";
import type { CSSProperties } from "react";
import { DeckDrag } from "@/components/features/hero/DeckDrag";
import { Photo } from "@/components/ui/Photo";
import type { Postcard } from "@/content/types";
import { reveal } from "@/lib/reveal";
import styles from "./PhotoSpread.module.css";

/** Small vertical offsets (in container widths) so the row sits like cards dealt by hand. */
const DROP = [2, 6.5, 0.5, 5, 3];
const TILT = [-3, 2.5, -1.5, 3, -2.5];

/**
 * A handful of postcards that spring apart from a stack into an overlapping row as they scroll
 * into view. Adapted from the gallery reference: same idea, but plain CSS transitions instead of
 * framer-motion, and every card is a real link. Mouse and pen can drag the cards around
 * (DeckDrag); touch keeps scrolling and tapping. Without JavaScript, or with reduced motion, the
 * row is simply already spread.
 */
export function PhotoSpread({ postcards, id }: { postcards: Postcard[]; id: string }) {
  const cards = postcards.slice(0, 5);
  if (cards.length === 0) return null;

  return (
    <div className={styles.stage} {...reveal("spread")}>
      <ul role="list" id={id} className={styles.row}>
        {cards.map((card, index) => (
          <li
            key={card.slug}
            className={styles.slot}
            data-slot
            style={{ "--n": index, "--y": `${DROP[index]}cqw`, "--r": `${TILT[index]}deg` } as CSSProperties}
          >
            <Link href={`/gallery#p=${card.slug}`} className={styles.card} aria-label={`Open “${card.title}”`}>
              <Photo image={card.image} ratio="1 / 1" sizes="(min-width: 56rem) 15rem, 28vw" />
            </Link>
          </li>
        ))}
      </ul>
      <DeckDrag targetId={id} />
    </div>
  );
}
