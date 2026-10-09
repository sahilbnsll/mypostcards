import type { Metadata } from "next";
import { getJournal } from "@/content";
import { globePins, postcardCount } from "@/content/selectors";
import { PlacesGlobe } from "@/components/features/globe/PlacesGlobe";
import { PlacesIndex } from "@/components/features/places/PlacesIndex";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHead } from "@/components/ui/PageHead";

export const metadata: Metadata = {
  title: "Places",
  description: "The places postcards were sent from, with the trips, cafés and stories attached to each.",
  alternates: { canonical: "/destinations" },
};

export default async function DestinationsPage() {
  const journal = await getJournal();
  const counts = Object.fromEntries(
    journal.destinations.map((d) => [d.slug, postcardCount(journal, "destinationSlug", d.slug)]),
  );

  return (
    <>
      <PageHead title="Places" lede="Where the postcards were sent from. Point at a name to see a print." />
      <section className="wrap" aria-label="Places">
        {journal.destinations.length > 0 ? (
          <>
            <PlacesGlobe pins={globePins(journal.postcards)} />
            <PlacesIndex places={journal.destinations} counts={counts} />
          </>
        ) : (
          <EmptyState title="No places yet" body="Places collect postcards by destination. The first will appear here." />
        )}
      </section>
    </>
  );
}
