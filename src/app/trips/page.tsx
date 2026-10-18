import type { Metadata } from "next";
import { getJournal } from "@/content";
import { postcardCount, tripPrints } from "@/content/selectors";
import { TripCards } from "@/components/features/trips/TripCards";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHead } from "@/components/ui/PageHead";

export const metadata: Metadata = {
  title: "Trips",
  description: "Photographs grouped around a journey, a place or a weekend away.",
  alternates: { canonical: "/trips" },
};

export default async function TripsPage() {
  const journal = await getJournal();
  const counts = Object.fromEntries(journal.trips.map((t) => [t.slug, postcardCount(journal, "tripSlug", t.slug)]));

  return (
    <>
      <PageHead title="Trips" lede="Postcards grouped around a journey, with the longer story where there is one." />
      <section className="wrap" aria-label="Trips">
        {journal.trips.length > 0 ? (
          <TripCards trips={journal.trips} counts={counts} prints={tripPrints(journal, journal.trips)} />
        ) : (
          <EmptyState title="No trips yet" body="Trips group postcards from the same journey. The first one will show up here." />
        )}
      </section>
    </>
  );
}
