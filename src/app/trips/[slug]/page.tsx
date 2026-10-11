import type { Metadata } from "next";
import { reveal } from "@/lib/reveal";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getJournal } from "@/content";
import {
  EMPTY_SLUG,
  findBySlug,
  postcardsForTrip,
  staticSlugs,
  storiesForTrip,
  toViews,
} from "@/content/selectors";
import { BloomGallery } from "@/components/features/gallery/BloomGallery";
import { Itinerary } from "@/components/features/trips/Itinerary";
import { TripTimeline } from "@/components/features/trips/TripTimeline";
import { StoryCard } from "@/components/features/stories/StoryCard";
import { DetailSkeleton } from "@/components/ui/DetailSkeleton";
import { CollectionHero } from "@/components/ui/CollectionHero";
import { Prose } from "@/components/ui/Prose";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatRange, plural } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

// The page shell (with its skeleton) is prerendered; the content streams in per slug. That is what
// lets a trip, place, café or story added in Supabase appear without a rebuild.

export async function generateStaticParams() {
  return staticSlugs((await getJournal()).trips);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const trip = findBySlug((await getJournal()).trips, slug);
  if (!trip) return {};
  return {
    title: trip.title,
    description: trip.summary,
    alternates: { canonical: `/trips/${trip.slug}` },
    openGraph: { title: trip.title, description: trip.summary, images: [{ url: trip.coverImage.src, alt: trip.coverImage.alt }] },
  };
}

async function TripContent({ params }: { params: Params }) {
  const { slug } = await params;
  const journal = await getJournal();
  const trip = slug === EMPTY_SLUG ? undefined : findBySlug(journal.trips, slug);
  if (!trip) notFound();

  const postcards = toViews(journal, postcardsForTrip(journal, trip.slug));
  const stories = storiesForTrip(journal, trip.slug);
  const place = trip.destinationSlug ? findBySlug(journal.destinations, trip.destinationSlug) : undefined;
  const when = formatRange(trip.startDate, trip.endDate, trip.periodLabel);

  return (
    <article>
      <CollectionHero
        title={trip.title}
        lede={trip.summary}
        back={{ href: "/trips", label: "All trips" }}
        cover={trip.coverImage}
        meta={
          <>
            <span>{plural(postcards.length, "postcard")}</span>
            {when && <span>{when}</span>}
            {place && (
              <span>
                <Link href={`/destinations/${place.slug}`} className="text-link">
                  {place.name}
                </Link>
              </span>
            )}
          </>
        }
      />

      {trip.story && (
        <section className="wrap section--tight" aria-label="About this trip" {...reveal("text")}>
          <Prose text={trip.story} />
        </section>
      )}

      {trip.days.length > 0 && (
        <section className="wrap section--tight" aria-labelledby="trip-itinerary">
          <SectionHeader id="trip-itinerary" title="Itinerary" intro="Day by day, with the tips worth knowing." />
          <Itinerary tripTitle={trip.title} days={trip.days} postcards={journal.postcards} />
        </section>
      )}

      {postcards.length > 1 && (
        <section className="wrap section--tight" aria-labelledby="trip-timeline">
          <SectionHeader
            id="trip-timeline"
            title="Travel diary timeline"
            intro="Flipping through the journey in chronological order."
            badge={`${postcards.length} entries`}
          />
          <TripTimeline postcards={postcards} tripTitle={trip.title} />
        </section>
      )}

      <section className="wrap section--tight" aria-labelledby="trip-postcards">
        <SectionHeader id="trip-postcards" title="Postcards from this trip" />
        <BloomGallery items={postcards} filterable={false} />
      </section>

      {stories.length > 0 && (
        <section className="wrap section--tight" aria-labelledby="trip-stories">
          <SectionHeader id="trip-stories" title="Stories" />
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

export default function TripPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <TripContent params={params} />
    </Suspense>
  );
}
