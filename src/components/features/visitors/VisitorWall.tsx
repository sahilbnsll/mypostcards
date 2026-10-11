import type { CSSProperties } from "react";
import { KINDS, type VisitorCard } from "@/content/visitors-shared";
import { reveal } from "@/lib/reveal";
import { DrawingSvg } from "./DrawingSvg";
import styles from "./VisitorWall.module.css";

const KIND_LABEL = Object.fromEntries(KINDS.map((k) => [k.id, k.label]));

/** A steady little tilt per card, taken from its id so it never changes between renders. */
function hashOf(id: string): number {
  let hash = 7;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return Math.abs(hash);
}

function tiltFor(id: string): number {
  return ((hashOf(id) % 9) - 4) * 0.45;
}

/** Deterministic per-card scatter: tilt, nudge, and z-index so cards look tossed on a table. */
function scatterStyle(id: string, index: number): CSSProperties {
  const h = hashOf(id);
  const tilt = ((h % 17) - 8) * 1.2;          // −9.6° to +9.6°
  const nudgeX = ((h >> 4) % 21) - 10;        // −10px to +10px
  const nudgeY = ((h >> 8) % 13) - 6;         // −6px to +6px
  const z = (h % 5) + 1;                      // 1–5
  return {
    "--scatter-tilt": `${tilt}deg`,
    "--scatter-x": `${nudgeX}px`,
    "--scatter-y": `${nudgeY}px`,
    "--scatter-z": z,
    "--i": index % 10,
  } as CSSProperties;
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

/** Visitor cards, laid out like a pinboard. Use `scattered` for the homepage "cards on the desk" look. */
export function VisitorWall({ cards, scattered }: { cards: VisitorCard[]; scattered?: boolean }) {
  return (
    <ul role="list" className={styles.wall} data-scattered={scattered || undefined}>
      {cards.map((card, index) => (
        <li
          key={card.id}
          className={styles.cell}
          style={scattered ? scatterStyle(card.id, index) : undefined}
        >
          <VisitorCardView card={card} index={index} />
        </li>
      ))}
    </ul>
  );
}

export function VisitorCardSkeleton({ index = 0 }: { index?: number }) {
  const lineDiff = index % 3;
  return (
    <article
      className={styles.skeletonCard}
      aria-hidden="true"
      style={{ "--i": index % 8, "--tilt": `${((index % 5) - 2) * 0.75}deg` } as CSSProperties}
    >
      <header className={styles.skeletonHead}>
        <span className={`${styles.skeletonKind} ${styles.bone}`} />
        <span className={styles.skeletonStamp} />
      </header>
      {index % 2 === 0 && <div className={styles.skeletonDrawing} />}
      <div className={styles.skeletonLines}>
        <span className={`${styles.skeletonLine} ${styles.bone}`} style={{ width: lineDiff === 0 ? "92%" : "84%" }} />
        <span className={`${styles.skeletonLine} ${styles.bone}`} style={{ width: lineDiff === 1 ? "72%" : "58%" }} />
      </div>
      <footer className={styles.skeletonFoot}>
        <span className={`${styles.skeletonFrom} ${styles.bone}`} />
        <span className={`${styles.skeletonDate} ${styles.bone}`} />
      </footer>
    </article>
  );
}

/** Postcard-shaped loading placeholders for visitor cards. */
export function VisitorWallSkeleton({
  count = 6,
  scattered,
}: {
  count?: number;
  scattered?: boolean;
}) {
  const items = Array.from({ length: count }, (_, i) => i);
  return (
    <ul role="list" className={styles.wall} data-scattered={scattered || undefined} aria-label="Loading visitor cards...">
      {items.map((i) => (
        <li
          key={`skeleton-${i}`}
          className={styles.cell}
          style={scattered ? scatterStyle(`skel-${i}`, i) : undefined}
        >
          <VisitorCardSkeleton index={i} />
        </li>
      ))}
    </ul>
  );
}
