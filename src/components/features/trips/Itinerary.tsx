import { SvgMap } from "@/components/features/map/SvgMap";
import type { MapPin } from "@/content/selectors";
import type { ItineraryDay, Postcard } from "@/content/types";
import { ItineraryExplorer } from "./ItineraryExplorer";
import type { ExplorerDay } from "./ItineraryExplorer";

interface ItineraryProps {
  tripTitle: string;
  days: ItineraryDay[];
  /** Every postcard, so a stop can show the one linked to it. */
  postcards: readonly Postcard[];
}

/**
 * A day-by-day plan: each stop has a place, an optional time, a note, a tip and the postcard taken
 * there. Stops with coordinates are also drawn on a route map beside the list, and the two follow
 * each other (see `ItineraryExplorer`). Everything optional is shown only when it was filled in.
 */
export function Itinerary({ tripTitle, days, postcards }: ItineraryProps) {
  const bySlug = new Map(postcards.map((p) => [p.slug, p]));

  // Number every stop across the whole trip, so the map and the list agree.
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
        day: day.day,
        ...stop.coordinates!,
        label: `${stop.number}. ${stop.place}`,
        href: `#day-${day.day}-stop-${stop.number}`,
        image: stop.postcardSlug ? bySlug.get(stop.postcardSlug)?.image : undefined,
      })),
  );

  const explorerDays: ExplorerDay[] = numbered.map((day) => ({
    day: day.day,
    title: day.title,
    stops: day.stops.map((stop) => {
      const card = stop.postcardSlug ? bySlug.get(stop.postcardSlug) : undefined;
      return {
        number: stop.number,
        place: stop.place,
        time: stop.time,
        note: stop.note,
        tip: stop.tip,
        card: card ? { slug: card.slug, title: card.title, image: card.image } : undefined,
      };
    }),
  }));

  const mapLabel = `Route map for ${tripTitle}`;
  return (
    <ItineraryExplorer tripTitle={tripTitle} days={explorerDays} pins={pins} mapLabel={mapLabel}>
      <SvgMap pins={pins} mode="fit" route label={mapLabel} />
    </ItineraryExplorer>
  );
}
