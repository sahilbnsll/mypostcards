import Link from "next/link";
import { SvgMap } from "@/components/features/map/SvgMap";
import { Photo } from "@/components/ui/Photo";
import type { MapPin } from "@/content/selectors";
import type { ItineraryDay, Postcard } from "@/content/types";
import styles from "./Itinerary.module.css";

interface ItineraryProps {
  tripTitle: string;
  days: ItineraryDay[];
  /** Every postcard, so a stop can show the one linked to it. */
  postcards: readonly Postcard[];
}

const osmLink = (lat: number, lng: number) =>
  `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`;

/**
 * A day-by-day plan: each stop has a place, an optional time, a note, a tip, a map link and the
 * postcard taken there. Stops with coordinates are also drawn on a route map beside the timeline.
 * Everything optional is shown only when it was filled in.
 */
export function Itinerary({ tripTitle, days, postcards }: ItineraryProps) {
  const bySlug = new Map(postcards.map((p) => [p.slug, p]));

  // Number every stop across the whole trip, so the map and the timeline agree.
  let counter = 0;
  const numbered = days.map((day) => ({
    ...day,
    stops: day.stops.map((stop) => ({ ...stop, number: ++counter })),
  }));

  const pins: MapPin[] = numbered.flatMap((day) =>
    day.stops
      .filter((stop) => stop.coordinates)
      .map((stop) => ({
        id: `stop-${stop.number}`,
        number: stop.number,
        ...stop.coordinates!,
        label: `${stop.number}. ${stop.place}`,
        href: `#day-${day.day}-stop-${stop.number}`,
        image: stop.postcardSlug ? bySlug.get(stop.postcardSlug)?.image : undefined,
      })),
  );

  return (
    <div className={styles.layout}>
      {pins.length > 0 && (
        <div className={styles.map}>
          <SvgMap pins={pins} mode="fit" route label={`Route map for ${tripTitle}`} />
        </div>
      )}

      <ol className={styles.days} aria-label={`Itinerary for ${tripTitle}`}>
        {numbered.map((day) => (
          <li key={day.day} className={styles.day}>
            <h3 className={styles.dayTitle}>
              <span className={styles.dayNumber}>Day {day.day}</span>
              {day.title && <span className={styles.dayName}>{day.title}</span>}
            </h3>

            <ol className={styles.stops}>
              {day.stops.map((stop) => {
                const card = stop.postcardSlug ? bySlug.get(stop.postcardSlug) : undefined;
                return (
                  <li key={stop.number} id={`day-${day.day}-stop-${stop.number}`} className={styles.stop}>
                    <span className={styles.marker} aria-hidden>
                      {stop.number}
                    </span>
                    <div className={styles.body}>
                      <p className={styles.place}>
                        {stop.place}
                        {stop.time && <span className={styles.time}>{stop.time}</span>}
                      </p>
                      {stop.note && <p className={styles.note}>{stop.note}</p>}
                      {stop.tip && (
                        <p className={styles.tip}>
                          <span className={styles.tipLabel}>Tip</span> {stop.tip}
                        </p>
                      )}
                      <div className={styles.extras}>
                        {stop.coordinates && (
                          <a
                            href={osmLink(stop.coordinates.lat, stop.coordinates.lng)}
                            className="text-link"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open on a map<span className="visually-hidden"> (new tab)</span>
                          </a>
                        )}
                        {card && (
                          <Link href={`/postcards/${card.slug}`} className={styles.postcard}>
                            <Photo image={card.image} ratio="1 / 1" sizes="64px" className={styles.thumb} />
                            <span>{card.title}</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </li>
        ))}
      </ol>
    </div>
  );
}
