import type { Cafe } from "@/content/types";
import styles from "./CafeGuide.module.css";

/**
 * The practical details of a café or food spot. Every row is optional: a detail that was not
 * filled in is simply not shown, and if none were filled in neither is the block.
 */
export function CafeGuide({ cafe }: { cafe: Cafe }) {
  const rows: Array<[string, string]> = [
    ["Usual order", cafe.favoriteOrder],
    ["Price", cafe.price],
    ["Best seat", cafe.bestSeat],
    ["Wi-Fi", cafe.wifi],
  ].filter((row): row is [string, string] => Boolean(row[1]));

  if (rows.length === 0 && !cafe.mapUrl) return null;

  return (
    <section className={styles.guide} aria-label={`Guide to ${cafe.name}`}>
      <dl className={styles.list}>
        {rows.map(([label, value]) => (
          <div key={label} className={styles.row}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {cafe.mapUrl && (
        <a href={cafe.mapUrl} className={`text-link ${styles.map}`} target="_blank" rel="noopener noreferrer">
          Open on a map<span className="visually-hidden"> (new tab)</span>
        </a>
      )}
    </section>
  );
}
