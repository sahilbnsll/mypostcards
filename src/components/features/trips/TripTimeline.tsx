import Link from "next/link";
import type { CSSProperties } from "react";
import { Photo } from "@/components/ui/Photo";
import { Postmark, Stamp } from "@/components/ui/Stamp";
import { formatDate, formatLocation } from "@/lib/utils";
import { reveal } from "@/lib/reveal";
import type { Postcard, PostcardView } from "@/content/types";
import styles from "./TripTimeline.module.css";

interface TripTimelineProps {
  postcards: (Postcard | PostcardView)[];
  tripTitle?: string;
}

export function TripTimeline({ postcards, tripTitle }: TripTimelineProps) {
  if (postcards.length === 0) return null;

  // Order chronologically by takenOn or sortOrder
  const sorted = [...postcards].sort((a, b) => {
    if (a.takenOn && b.takenOn) return a.takenOn.localeCompare(b.takenOn);
    return a.sortOrder - b.sortOrder;
  });

  return (
    <div className={styles.timelineWrapper}>
      <ol className={styles.timeline} aria-label={`Chronological travel diary${tripTitle ? ` for ${tripTitle}` : ""}`}>
        {sorted.map((card, index) => {
          const dateStr = card.takenOn ? formatDate(card.takenOn) : card.periodLabel ?? `Entry ${index + 1}`;
          const placeStr = formatLocation(card.location, ["placeName", "city", "country"]);
          const tilt = index % 2 === 0 ? -1.25 : 1.25;

          return (
            <li
              key={card.slug}
              className={styles.entry}
              {...reveal("text", index)}
            >
              {/* Spine marker with sequence number and date stamp */}
              <div className={styles.markerColumn}>
                <span className={styles.dot} aria-hidden>
                  {index + 1}
                </span>
                <time className={styles.dateStamp} dateTime={card.takenOn}>
                  {dateStr}
                </time>
              </div>

              {/* Travel diary postcard entry */}
              <div
                className={styles.diaryCard}
                style={{ "--tilt": `${tilt}deg` } as CSSProperties}
              >
                <div className={styles.cardHeader}>
                  <div>
                    <h4 className={styles.cardTitle}>{card.title}</h4>
                    {placeStr && <p className={styles.cardPlace}>{placeStr}</p>}
                  </div>
                  {index % 2 === 0 ? (
                    <Stamp className={styles.stamp} tone="red" />
                  ) : (
                    <Postmark
                      className={styles.postmark}
                      top={card.location.city || "mypostcards"}
                      date="kept"
                    />
                  )}
                </div>

                <Link
                  href={`/gallery#p=${card.slug}`}
                  className={styles.photoFrame}
                  aria-label={`Open photo for ${card.title}`}
                >
                  <Photo
                    image={card.image}
                    ratio="16 / 10"
                    sizes="(min-width: 52rem) 42vw, 90vw"
                    className={styles.photo}
                  />
                </Link>

                {card.note && (
                  <p className={styles.note}>
                    “{card.note}”
                  </p>
                )}

                {card.caption && !card.note && (
                  <p className={styles.caption}>{card.caption}</p>
                )}

                <div className={styles.cardFooter}>
                  <Link href={`/gallery#p=${card.slug}`} className={`text-link ${styles.viewLink}`}>
                    View postcard ↗
                  </Link>
                  {card.tags.length > 0 && (
                    <ul role="list" className={styles.tags}>
                      {card.tags.slice(0, 3).map((tag) => (
                        <li key={tag} className={styles.tag}>
                          {tag}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
