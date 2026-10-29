"use client";

import Link from "next/link";
import { useId, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { Photo } from "@/components/ui/Photo";
import type { ImageAsset } from "@/content/types";
import styles from "./PostcardHand.module.css";

export interface HandCard {
  slug: string;
  title: string;
  image: ImageAsset;
  /** Where and when, shown under the title. */
  meta?: string;
  caption?: string;
}

/** Total sweep of the fan in degrees; a bigger hand fans tighter, a small one at most 9 degrees a card. */
const SWEEP = 46;

/**
 * A hand of postcards, adapted from the card-hand-gallery reference and rebuilt in CSS with no
 * animation library. The picked postcard is lifted out of the hand with its title beside it; the
 * rest fan out below it, and with a mouse the one under the pointer rises while its neighbours
 * make room. Tap or click a card (or use the arrow keys) to pick it; "Open" goes to its page. Every
 * movement is a CSS transition on `translate`, `rotate` and `scale`, so reduced motion is just
 * "no transition".
 */
export function PostcardHand({ cards, label }: { cards: HandCard[]; label: string }) {
  const [active, setActive] = useState(0);
  const statusId = useId();
  const current = cards[active];
  const hand = cards.map((_, i) => i).filter((i) => i !== active);
  const step = hand.length > 1 ? Math.min(9, SWEEP / (hand.length - 1)) : 0;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const next = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (!next) return;
    event.preventDefault();
    const to = (active + next + cards.length) % cards.length;
    setActive(to);
    // Keep focus on the card that was just picked
    requestAnimationFrame(() => event.currentTarget.querySelector<HTMLElement>(`[data-index="${to}"]`)?.focus());
  };

  if (!current) return null;

  return (
    <div className={styles.hand} role="group" aria-label={label} aria-describedby={statusId} onKeyDown={onKeyDown}>
      <div className={styles.text} key={current.slug}>
        <p className={styles.count}>
          {active + 1} of {cards.length}
        </p>
        <h3 className={styles.title}>{current.title}</h3>
        {current.meta && <p className={styles.meta}>{current.meta}</p>}
        {current.caption && <p className={styles.caption}>{current.caption}</p>}
        <Link href={`/postcards/${current.slug}`} className={styles.open}>
          Open this postcard
        </Link>
      </div>

      <div className={styles.frame}>
       <div className={styles.stage} style={{ "--reach": Math.max(0, (hand.length - 1) / 2) } as CSSProperties}>
        {cards.map((card, i) => {
          const isActive = i === active;
          const slot = hand.indexOf(i);
          const offset = slot - (hand.length - 1) / 2;
          const rotate = offset * step;
          const vars = isActive
            ? { "--o": 0, "--r": 0, "--drop": 0 }
            : { "--o": offset, "--r": rotate, "--drop": Math.abs(rotate) };
          return (
            <div key={card.slug} className={styles.slot} data-active={isActive || undefined} style={{ ...vars, "--z": isActive ? 100 : 10 + slot } as CSSProperties}>
              <button
                type="button"
                className={styles.card}
                data-index={i}
                aria-label={card.title}
                aria-pressed={isActive}
                onClick={() => setActive(i)}
              >
                <Photo image={card.image} ratio="5 / 7" sizes="(min-width: 62rem) 14rem, 36vw" imageClassName={styles.image} />
              </button>
            </div>
          );
        })}
       </div>
      </div>

      <p id={statusId} className="visually-hidden" aria-live="polite">
        Showing {current.title}, {active + 1} of {cards.length}. Use the arrow keys to pick another.
      </p>
    </div>
  );
}
