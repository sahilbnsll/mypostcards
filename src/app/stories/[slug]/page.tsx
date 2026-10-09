import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getJournal } from "@/content";
import {
  EMPTY_SLUG,
  findBySlug,
  postcardsForDestination,
  postcardsForTrip,
  staticSlugs,
  toViews,
} from "@/content/selectors";
import { BloomGallery } from "@/components/features/gallery/BloomGallery";
import { DetailSkeleton } from "@/components/ui/DetailSkeleton";
import { CollectionHero } from "@/components/ui/CollectionHero";
import { Prose } from "@/components/ui/Prose";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatDate, plural } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

// The page shell (with its skeleton) is prerendered; the content streams in per slug. That is what
// lets a trip, place, café or story added in Supabase appear without a rebuild.

export async function generateStaticParams() {
  return staticSlugs((await getJournal()).stories);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const story = findBySlug((await getJournal()).stories, slug);
  if (!story) return {};
  return {
    title: story.title,
    description: story.excerpt,
    alternates: { canonical: `/stories/${story.slug}` },
    openGraph: {
      type: "article",
      title: story.title,
      description: story.excerpt,
      images: [{ url: story.coverImage.src, alt: story.coverImage.alt }],
    },
  };
}

async function StoryContent({ params }: { params: Params }) {
  const { slug } = await params;
  const journal = await getJournal();
  const story = slug === EMPTY_SLUG ? undefined : findBySlug(journal.stories, slug);
  if (!story) notFound();

  const trip = story.tripSlug ? findBySlug(journal.trips, story.tripSlug) : undefined;
  const place = story.destinationSlug ? findBySlug(journal.destinations, story.destinationSlug) : undefined;
  const related = toViews(
    journal,
    story.tripSlug
      ? postcardsForTrip(journal, story.tripSlug)
      : story.destinationSlug
        ? postcardsForDestination(journal, story.destinationSlug)
        : [],
  ).slice(0, 8);

  return (
    <article>
      <CollectionHero
        title={story.title}
        lede={story.subtitle}
        back={{ href: "/stories", label: "All stories" }}
        cover={story.coverImage}
        meta={
          <>
            {story.publishedAt && <span>{formatDate(story.publishedAt)}</span>}
            <span>{plural(story.readingTimeMinutes, "minute")} to read</span>
            {trip && (
              <span>
                <Link href={`/trips/${trip.slug}`} className="text-link">
                  {trip.title}
                </Link>
              </span>
            )}
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

      <section className="wrap section--tight" aria-label="Story">
        {story.isSample && (
          <p className="sample-note" role="note">
            Sample story. It shows how a longer piece reads beside its photographs.
          </p>
        )}
        <Prose text={story.body} />
      </section>

      {related.length > 0 && (
        <section className="wrap section--tight" aria-labelledby="story-postcards">
          <SectionHeader id="story-postcards" title="Photographs from this story" />
          <BloomGallery items={related} filterable={false} />
        </section>
      )}
    </article>
  );
}

export default function StoryPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <StoryContent params={params} />
    </Suspense>
  );
}
