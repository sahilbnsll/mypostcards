import type { Metadata } from "next";
import { getJournal } from "@/content";
import { JsonLd } from "@/components/ui/JsonLd";
import { collectionJsonLd, pageMetadata } from "@/lib/seo";
import { postcardCount, tripPrints } from "@/content/selectors";
import { TripCards } from "@/components/features/trips/TripCards";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHead } from "@/components/ui/PageHead";

export async function generateMetadata(): Promise<Metadata> {
  const { trips, postcards } = await getJournal();
  const names = trips.map((t) => t.title);
  const list = names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names[0] ?? "trips";
  return pageMetadata({
    title: "Trips: photo journeys, day by day",
    description: `${trips.length} trips in photographs: ${list}. ${postcards.filter((p) => p.tripSlug).length} postcards with day-by-day itineraries, maps and travel diaries.`,
    path: "/trips",
    image: trips[0]?.coverImage,
  });
}

export default async function TripsPage() {
  const journal = await getJournal();
  const counts = Object.fromEntries(journal.trips.map((t) => [t.slug, postcardCount(journal, "tripSlug", t.slug)]));

  return (
    <>
      <JsonLd data={collectionJsonLd({ name: "Trips", description: "Photographs grouped around a journey.", path: "/trips", items: journal.trips.map((t) => ({ name: t.title, path: `/trips/${t.slug}`, image: t.coverImage.src })) })} />
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
