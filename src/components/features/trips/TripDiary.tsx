"use client";

import { useMemo } from "react";
import type { CSSProperties } from "react";
import { Lightbox } from "@/components/features/lightbox/Lightbox";
import { useLightbox } from "@/components/features/lightbox/useLightbox";
import type { LightboxItem } from "@/components/features/lightbox/types";
import { Photo } from "@/components/ui/Photo";
import { PlayBadge } from "@/components/ui/PostcardMedia";
import type { ItineraryDay } from "@/content/types";
import { formatDate, plural } from "@/lib/utils";
import styles from "./TripDiary.module.css";

interface TripDiaryProps {
  postcards: LightboxItem[];
  /** The itinerary's days, used to name each day of the diary when the two line up. */
  days?: ItineraryDay[];
  tripTitle: string;
}

/** "Sunday 17 May: Jaipur to Kasol" becomes "Jaipur to Kasol". */
const placeOf = (title: string | undefined) => (title && title.includes(":") ? title.split(":").slice(1).join(":").trim() : undefined);

const SIZES = "(min-width: 62rem) 12vw, (min-width: 40rem) 22vw, 44vw";

/**
 * A trip's postcards, day by day, as one compact panel per day: a date slip on the left that stays
 * in view while the day's small prints go past, and every print in one grid, so the whole trip fits
 * in a few screens instead of one card per screen. A print opens the viewer, where its note and
 * details are; the arrows there step through the diary in order.
 */
export function TripDiary({ postcards, days = [], tripTitle }: TripDiaryProps) {
  const sorted = useMemo(
    () =>
      [...postcards].sort((a, b) => {
        if (a.takenOn && b.takenOn) return a.takenOn.localeCompare(b.takenOn);
        return a.sortOrder - b.sortOrder;
      }),
    [postcards],
  );

  const groups = useMemo(() => {
    const byDay = new Map<string, LightboxItem[]>();
    for (const card of sorted) {
      const key = card.takenOn ?? card.periodLabel ?? "undated";
      byDay.set(key, [...(byDay.get(key) ?? []), card]);
    }
    return [...byDay.entries()].map(([key, cards]) => ({ key, cards }));
  }, [sorted]);

  const lightbox = useLightbox(sorted);

  if (sorted.length === 0) return null;
  const named = days.length === groups.length;

  return (
    <div className={styles.diary}>
      <ol role="list" className={styles.days} aria-label={`Postcards from ${tripTitle}, day by day`}>
        {groups.map((group, dayIndex) => {
          const first = group.cards[0];
          const dated = first.takenOn !== undefined;
          const place = named ? placeOf(days[dayIndex]?.title) : undefined;
          return (
            <li key={group.key} className={styles.day}>
              <span className={styles.fill} aria-hidden />
              <span className={styles.dot} aria-hidden>
                {dayIndex + 1}
              </span>

              <div className={styles.rail}>
                <h3 className={styles.dayNumber}>Day {dayIndex + 1}</h3>
                {dated ? (
                  <time className={styles.slip} dateTime={first.takenOn}>
                    {formatDate(first.takenOn!)}
                  </time>
                ) : (
                  <span className={styles.slip}>{first.periodLabel ?? "Undated"}</span>
                )}
                {place && <p className={styles.place}>{place}</p>}
                <p className={styles.count}>{plural(group.cards.length, "postcard")}</p>
              </div>

              <ul role="list" className={styles.prints}>
                {group.cards.map((card, index) => (
                  <li key={card.slug}>
                    <button
                      type="button"
                      className={styles.print}
                      style={{ "--tilt": `${index % 2 === 0 ? -1.2 : 1}deg` } as CSSProperties}
                      aria-label={`Open ${card.title}${card.video ? ", video" : ""}`}
                      onClick={(event) => lightbox.open(card.slug, event.currentTarget, sorted)}
                    >
                      <span className={styles.photo}>
                        <Photo image={card.image} ratio="4 / 5" sizes={SIZES} decorative />
                        {card.video && <PlayBadge />}
                      </span>
                      <span className={styles.title}>{card.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>

      <Lightbox
        list={lightbox.state?.list ?? null}
        index={lightbox.state?.index ?? 0}
        origin={lightbox.state?.origin ?? null}
        onIndexChange={lightbox.setIndex}
        onClose={lightbox.close}
      />
    </div>
  );
}
