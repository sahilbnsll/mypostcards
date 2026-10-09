import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getJournal } from "@/content";
import {
  EMPTY_SLUG,
  cafesForDestination,
  findBySlug,
  postcardCount,
  postcardsForDestination,
  staticSlugs,
  storiesForDestination,
  toViews,
  tripsForDestination,
} from "@/content/selectors";
import { CafeCard } from "@/components/features/cafes/CafeCard";
import { BloomGallery } from "@/components/features/gallery/BloomGallery";
import { StoryCard } from "@/components/features/stories/StoryCard";
import { TripCards } from "@/components/features/trips/TripCards";
import { DetailSkeleton } from "@/components/ui/DetailSkeleton";
import { CollectionHero } from "@/components/ui/CollectionHero";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { plural } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

// The page shell (with its skeleton) is prerendered; the content streams in per slug. That is what
// lets a trip, place, café or story added in Supabase appear without a rebuild.

export async function generateStaticParams() {
  return staticSlugs((await getJournal()).destinations);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const place = findBySlug((await getJournal()).destinations, slug);
  if (!place) return {};
  return {
    title: place.name,
    description: place.description,
    alternates: { canonical: `/destinations/${place.slug}` },
    openGraph: { title: place.name, description: place.description, images: [{ url: place.coverImage.src, alt: place.coverImage.alt }] },
  };
}

async function DestinationContent({ params }: { params: Params }) {
  const { slug } = await params;
  const journal = await getJournal();
  const place = slug === EMPTY_SLUG ? undefined : findBySlug(journal.destinations, slug);
  if (!place) notFound();

  const postcards = toViews(journal, postcardsForDestination(journal, place.slug));
  const trips = tripsForDestination(journal, place.slug);
  const cafes = cafesForDestination(journal, place.slug);
  const stories = storiesForDestination(journal, place.slug);
  const tripCounts = Object.fromEntries(trips.map((t) => [t.slug, postcardCount(journal, "tripSlug", t.slug)]));
  const cafeCounts = Object.fromEntries(cafes.map((c) => [c.slug, postcardCount(journal, "cafeSlug", c.slug)]));

  return (
    <article>
      <CollectionHero
        title={place.name}
        lede={place.description}
        back={{ href: "/destinations", label: "All places" }}
        cover={place.coverImage}
        meta={
          <>
            <span>{[place.region, place.country].filter(Boolean).join(", ")}</span>
            <span>{plural(postcards.length, "postcard")}</span>
          </>
        }
      />

      {postcards.length > 0 && (
        <section className="wrap section--tight" aria-labelledby="place-postcards">
          <SectionHeader id="place-postcards" title="Postcards" />
          <BloomGallery items={postcards} filterable={false} />
        </section>
      )}

      {trips.length > 0 && (
        <section className="wrap section--tight" aria-labelledby="place-trips">
          <SectionHeader id="place-trips" title="Trips here" />
          <TripCards trips={trips} counts={tripCounts} />
        </section>
      )}

      {cafes.length > 0 && (
        <section className="wrap section--tight" aria-labelledby="place-cafes">
          <SectionHeader id="place-cafes" title="Cafés" />
          <div className="card-grid">
            {cafes.map((cafe, index) => (
              <CafeCard key={cafe.slug} cafe={cafe} count={cafeCounts[cafe.slug] ?? 0} index={index} />
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
