import type { CSSProperties } from "react";
import { KINDS, type VisitorCard } from "@/content/visitors-shared";
import { reveal } from "@/lib/reveal";
import { DrawingSvg } from "./DrawingSvg";
import styles from "./VisitorWall.module.css";

const KIND_LABEL = Object.fromEntries(KINDS.map((k) => [k.id, k.label]));

/** A steady little tilt per card, taken from its id so it never changes between renders. */
function tiltFor(id: string): number {
  let hash = 7;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return ((Math.abs(hash) % 9) - 4) * 0.45;
}

const monthYear = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });

export function VisitorCardView({ card, index = 0 }: { card: VisitorCard; index?: number }) {
  const short = (card.message?.length ?? 0) <= 120;
  return (
    <article
      {...reveal("text", index)}
      className={styles.card}
      data-color={card.color}
      data-pinned={card.pinned || undefined}
      style={{ "--i": index % 8, "--tilt": `${tiltFor(card.id)}deg` } as CSSProperties}
    >
      <header className={styles.head}>
        <span className={styles.kind}>{KIND_LABEL[card.kind]}</span>
        {card.pinned && <span className={styles.pin}>Pinned</span>}
      </header>
      {card.drawing.length > 0 && (
        <div className={styles.drawing}>
          <DrawingSvg strokes={card.drawing} label={`A drawing from ${card.name ?? "a visitor"}`} />
        </div>
      )}
      {card.message && (
        <p className={styles.message} data-hand={short || undefined}>
          {card.message}
        </p>
      )}
      <footer className={styles.foot}>
        <span className={styles.from}>{card.name ?? "A visitor"}</span>
        <time dateTime={card.createdAt}>{monthYear(card.createdAt)}</time>
      </footer>
    </article>
  );
}

/** Visitor cards, laid out like a pinboard. */
export function VisitorWall({ cards }: { cards: VisitorCard[] }) {
  return (
    <ul role="list" className={styles.wall}>
      {cards.map((card, index) => (
        <li key={card.id} className={styles.cell}>
          <VisitorCardView card={card} index={index} />
        </li>
      ))}
    </ul>
  );
}
