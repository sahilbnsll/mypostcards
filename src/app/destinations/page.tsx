import type { Metadata } from "next";
import { getJournal } from "@/content";
import { JsonLd } from "@/components/ui/JsonLd";
import { collectionJsonLd, pageMetadata } from "@/lib/seo";
import { plannedPlaces, postcardCount } from "@/content/selectors";
import { PlacesExplorer } from "@/components/features/places/PlacesExplorer";
import { PlacesIndex } from "@/components/features/places/PlacesIndex";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHead } from "@/components/ui/PageHead";
import { SectionHeader } from "@/components/ui/SectionHeader";

export async function generateMetadata(): Promise<Metadata> {
  const { destinations } = await getJournal();
  const visited = destinations.filter((d) => d.status === "visited");
  const countries = [...new Set(visited.map((d) => d.country))];
  return pageMetadata({
    title: "Places I've been, on a globe and a map",
    description: `${visited.length} places in ${countries.length} ${countries.length === 1 ? "country" : "countries"} (${countries.join(", ")}), with the postcards, trips and cafés from each, on an interactive globe, a map and a list.`,
    path: "/destinations",
    image: visited.find((d) => d.coverImage)?.coverImage,
  });
}

export default async function DestinationsPage() {
  const journal = await getJournal();
  const planned = plannedPlaces(journal);
  const counts = Object.fromEntries(
    journal.destinations.map((d) => [d.slug, postcardCount(journal, "destinationSlug", d.slug)]),
  );

  return (
    <>
      <JsonLd data={collectionJsonLd({ name: "Places", description: "The places postcards were sent from.", path: "/destinations", items: journal.destinations.map((d) => ({ name: d.name, path: `/destinations/${d.slug}`, image: d.coverImage?.src })) })} />
      <PageHead title="Places" lede="Where the postcards were sent from, and where I would like to go next. Point at a name to see a print." />
      <section className="wrap" aria-label="Places">
        {journal.destinations.length > 0 ? (
          <>
            <PlacesExplorer journal={journal} />

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
