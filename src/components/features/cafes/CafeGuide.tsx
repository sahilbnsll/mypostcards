import { Rating } from "@/components/ui/Rating";
import type { Cafe } from "@/content/types";
import styles from "./CafeGuide.module.css";

/**
 * The practical details of a café or food spot, laid out like a postal slip: an airmail edge, a row
 * of details separated by perforations, my rating in stamps and a handwritten line. Every part is optional:
 * a detail that was not filled in is not shown, and if none were filled in neither is the card.
 */
export function CafeGuide({ cafe }: { cafe: Cafe }) {
  const rows: Array<[string, string]> = [
    ["Usual order", cafe.favoriteOrder],
    ["Price", cafe.price],
    ["Best seat", cafe.bestSeat],
    ["Wi-Fi", cafe.wifi],
  ].filter((row): row is [string, string] => Boolean(row[1]));

  const cells = rows.length + (cafe.rating ? 1 : 0);
  const hasFooter = Boolean(cafe.ratingNote);
  if (cells === 0 && !hasFooter) return null;

  return (
    <section className={styles.guide} data-compact={cells <= 2 || undefined} aria-label={`Guide to ${cafe.name}`}>
      <div className="airmail-edge" aria-hidden />
      {cells > 0 && (
        <dl className={styles.grid} style={{ "--cols": cells } as React.CSSProperties}>
          {cafe.rating && (
            <div className={styles.cell}>
              <dt>My rating</dt>
              <dd>
                <Rating value={cafe.rating} />
              </dd>
            </div>
          )}
          {rows.map(([label, value]) => (
            <div key={label} className={styles.cell}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
      {hasFooter && (
        <div className={styles.footer}>
          <p className={styles.note}>{cafe.ratingNote}</p>
        </div>
      )}
    </section>
  );
}
