import type { Journal } from "@/content/types";
import { globeGroups, globePins, globePlaces, mapPins, placePins, postcardCount, visitedPlaces } from "@/content/selectors";
import { PlacesGlobe } from "@/components/features/globe/PlacesGlobe";
import { LivePlacesMap } from "@/components/features/map/LivePlacesMap";
import { SvgMap } from "@/components/features/map/SvgMap";
import { Tabs } from "@/components/ui/Tabs";
import { PlacesIndex } from "./PlacesIndex";

/**
 * Every place, three ways, in one section: the globe, a real map, and the list. They used to be
 * stacked (a long scroll); now they are tabs, and only the one you open is drawn.
 * `listLimit` caps the list (the home page shows a few and links to the rest).
 */
export function PlacesExplorer({ journal, listLimit }: { journal: Journal; listLimit?: number }) {
  const visited = visitedPlaces(journal);
  const counts = Object.fromEntries(journal.destinations.map((d) => [d.slug, postcardCount(journal, "destinationSlug", d.slug)]));
  const pins = mapPins(journal);
  const mapLabel = "Map of every place with a postcard, and the places still planned";

  return (
    <Tabs
      label="Ways to see the places"
      tabs={[
        {
          id: "globe",
          label: "Globe",
          panel: (
            <PlacesGlobe
              pins={globePins(journal.postcards, 7, 20, new Map(journal.destinations.map((d) => [d.slug, d.name])))}
              places={globePlaces(journal)}
              groups={globeGroups(journal)}
            />
          ),
        },
        ...(pins.length > 0
          ? [
              {
                id: "map",
                label: "Map",
                panel: (
                  <LivePlacesMap places={placePins(journal)} label={mapLabel}>
                    <SvgMap pins={pins} label={mapLabel} />
                  </LivePlacesMap>
                ),
              },
            ]
          : []),
        {
          id: "list",
          label: "List",
          hint: String(visited.length),
          panel: <PlacesIndex places={listLimit ? visited.slice(0, listLimit) : visited} counts={counts} />,
        },
      ]}
    />
  );
}
