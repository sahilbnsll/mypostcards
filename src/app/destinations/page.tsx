import type { Metadata } from "next";
import { getJournal } from "@/content";
import { globePins, globeGroups, globePlaces, mapPins, placePins, plannedPlaces, postcardCount, visitedPlaces } from "@/content/selectors";
import { PlacesGlobe } from "@/components/features/globe/PlacesGlobe";
import { LivePlacesMap } from "@/components/features/map/LivePlacesMap";
import { SvgMap } from "@/components/features/map/SvgMap";
import { PlacesIndex } from "@/components/features/places/PlacesIndex";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHead } from "@/components/ui/PageHead";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "Places",
  description: "The places postcards were sent from, the places still on the list, and the trips, cafés and stories attached to each.",
  alternates: { canonical: "/destinations" },
};

export default async function DestinationsPage() {
  const journal = await getJournal();
  const visited = visitedPlaces(journal);
  const planned = plannedPlaces(journal);
  const counts = Object.fromEntries(
    journal.destinations.map((d) => [d.slug, postcardCount(journal, "destinationSlug", d.slug)]),
  );
  const pins = mapPins(journal);

  return (
    <>
      <PageHead title="Places" lede="Where the postcards were sent from, and where I would like to go next. Point at a name to see a print." />
      <section className="wrap" aria-label="Places">
        {journal.destinations.length > 0 ? (
          <>
            <PlacesGlobe
              pins={globePins(journal.postcards, 7, 20, new Map(journal.destinations.map((d) => [d.slug, d.name])))}
              places={globePlaces(journal)}
              groups={globeGroups(journal)}
            />

            {pins.length > 0 && (
              <div style={{ marginBottom: "var(--s-8)" }}>
                <SectionHeader id="flat-map" title="On the map" intro="Every place with a postcard, on a real map. Towns close together share a marker: click it to zoom in. Dashed rings are still on the list." />
                <LivePlacesMap places={placePins(journal)} label="Map of every place with a postcard, and the places still planned">
                  <SvgMap pins={pins} label="Map of every place with a postcard, and the places still planned" />
                </LivePlacesMap>
              </div>
            )}

            {visited.length > 0 && <PlacesIndex places={visited} counts={counts} />}

            {planned.length > 0 && (
              <div style={{ marginTop: "var(--s-8)" }}>
                <SectionHeader id="dreaming-of" title="Dreaming of" intro="Places on the list. No postcards yet." />
                <PlacesIndex places={planned} counts={counts} />
              </div>
            )}
          </>
        ) : (
          <EmptyState title="No places yet" body="Places collect postcards by destination. The first will appear here." />
        )}
      </section>
    </>
  );
}
