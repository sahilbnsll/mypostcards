import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getJournal } from "@/content";
import {
  EMPTY_SLUG,
  cafePrints,
  cafesForDestination,
  findBySlug,
  postcardCount,
  postcardsForDestination,
  samplePostcards,
  staticSlugs,
  storiesForDestination,
  toViews,
  tripPrints,
  tripsForDestination,
} from "@/content/selectors";
import { CafeCard } from "@/components/features/cafes/CafeCard";
import { BloomGallery } from "@/components/features/gallery/BloomGallery";
import { PostcardHand } from "@/components/features/hand/PostcardHand";
import { StoryCard } from "@/components/features/stories/StoryCard";
import { TripCards } from "@/components/features/trips/TripCards";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd, pageMetadata, placeJsonLd, snippet } from "@/lib/seo";
import { DetailSkeleton } from "@/components/ui/DetailSkeleton";
import { CollectionHero } from "@/components/ui/CollectionHero";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatLocation, plural } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

// The page shell (with its skeleton) is prerendered; the content streams in per slug. That is what
// lets a trip, place, café or story added in Supabase appear without a rebuild.

export async function generateStaticParams() {
  return staticSlugs((await getJournal()).destinations);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const journal = await getJournal();
  const place = findBySlug(journal.destinations, slug);
  if (!place) return {};
  const count = postcardsForDestination(journal, place.slug).length;
  const where = [place.region, place.country].filter(Boolean).join(", ");
  return pageMetadata({
    title: place.status === "planned" ? `${place.name}: on my list` : `${place.name}: ${count} ${count === 1 ? "postcard" : "postcards"} from ${place.country ?? (where || place.name)}`,
    description: snippet(
      place.description && !/^Postcards kept in/.test(place.description)
        ? `${place.description}${place.description.length < 90 ? ` ${count} ${count === 1 ? "postcard" : "postcards"}, with the trips, cafés and stories from ${place.name}.` : ""}`
        : `${count} ${count === 1 ? "postcard" : "postcards"} from ${place.name}${where ? `, ${where}` : ""}: photographs, trips, cafés and stories from there.`,
    ),
    path: `/destinations/${place.slug}`,
    keywords: [place.name, place.country, ...(place.region ? [place.region] : []), "travel photos"],
    ...(place.coordinates ? { geo: { lat: place.coordinates.lat, lng: place.coordinates.lng, placeName: place.name, region: place.country } } : {}),
  });
}

async function DestinationContent({ params }: { params: Params }) {
  const { slug } = await params;
  const journal = await getJournal();
  const place = slug === EMPTY_SLUG ? undefined : findBySlug(journal.destinations, slug);
  if (!place) notFound();

  const postcards = toViews(journal, postcardsForDestination(journal, place.slug));
  const hand = samplePostcards(postcards, undefined, 7);
  const trips = tripsForDestination(journal, place.slug);
  const cafes = cafesForDestination(journal, place.slug);
  const stories = storiesForDestination(journal, place.slug);
  const tripCounts = Object.fromEntries(trips.map((t) => [t.slug, postcardCount(journal, "tripSlug", t.slug)]));
  const cafePrintsBySlug = cafePrints(journal, cafes);
  const cafeCounts = Object.fromEntries(cafes.map((c) => [c.slug, postcardCount(journal, "cafeSlug", c.slug)]));

  return (
    <article>
      <JsonLd
        data={[
          placeJsonLd(place, postcards.length),
          breadcrumbJsonLd([{ name: "Places", path: "/destinations" }, { name: place.name, path: `/destinations/${place.slug}` }]),
        ]}
      />
      <CollectionHero
        title={place.name}
        lede={place.description}
        back={{ href: "/destinations", label: "All places" }}
        cover={place.coverImage}
        meta={
          <>
            <span>{[place.region, place.country].filter(Boolean).join(", ")}</span>
            <span>{place.status === "planned" ? "Dreaming of" : plural(postcards.length, "postcard")}</span>
          </>
        }
      />

      {hand.length >= 4 && (
        <section className="wrap section--tight" aria-labelledby="place-hand">
          <SectionHeader id="place-hand" title="A few favourites" intro="Pick one from the hand." />
          <PostcardHand
            label={`Favourite postcards from ${place.name}`}
            cards={hand.map((card) => ({
              slug: card.slug,
              title: card.title,
              image: card.image,
              meta: formatLocation(card.location, ["placeName", "city"]),
              caption: card.caption,
            }))}
          />
        </section>
      )}

      {postcards.length > 0 && (
        <section className="wrap section--tight" aria-labelledby="place-postcards">
          <SectionHeader id="place-postcards" title="Postcards" />
          <BloomGallery items={postcards} filterable={false} />
        </section>
      )}

      {trips.length > 0 && (
        <section className="wrap section--tight" aria-labelledby="place-trips">
          <SectionHeader id="place-trips" title="Trips here" />
          <TripCards trips={trips} counts={tripCounts} prints={tripPrints(journal, trips)} />
        </section>
      )}

      {cafes.length > 0 && (
        <section className="wrap section--tight" aria-labelledby="place-cafes">
          <SectionHeader id="place-cafes" title="Cafés" />
          <div className="card-grid">
            {cafes.map((cafe, index) => (
              <CafeCard key={cafe.slug} cafe={cafe} count={cafeCounts[cafe.slug] ?? 0} index={index} prints={cafePrintsBySlug[cafe.slug]} />
            ))}
          </div>
        </section>
      )}

      {stories.length > 0 && (
        <section className="wrap section--tight" aria-labelledby="place-stories">
          <SectionHeader id="place-stories" title="Stories" />
          <div className="card-grid">
            {stories.map((story, index) => (
              <StoryCard key={story.slug} story={story} index={index} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

export default function DestinationPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <DestinationContent params={params} />
    </Suspense>
  );
}
