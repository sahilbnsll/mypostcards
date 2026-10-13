import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getJournal } from "@/content";
import { EMPTY_SLUG, findBySlug, postcardCount, postcardsForCafe, staticSlugs, toViews } from "@/content/selectors";
import { CafeCard } from "@/components/features/cafes/CafeCard";
import { CafeGuide } from "@/components/features/cafes/CafeGuide";
import { MapLink } from "@/components/features/cafes/MapLink";
import { BloomGallery } from "@/components/features/gallery/BloomGallery";
import { DetailSkeleton } from "@/components/ui/DetailSkeleton";
import { CollectionHero } from "@/components/ui/CollectionHero";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { plural } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

// The page shell (with its skeleton) is prerendered; the content streams in per slug. That is what
// lets a trip, place, café or story added in Supabase appear without a rebuild.

export async function generateStaticParams() {
  return staticSlugs((await getJournal()).cafes);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const cafe = findBySlug((await getJournal()).cafes, slug);
  if (!cafe) return {};
  const description = cafe.notes ?? `Postcards from ${cafe.name}.`;
  return {
    title: cafe.name,
    description,
    alternates: { canonical: `/cafes/${cafe.slug}` },
    openGraph: { title: cafe.name, description, images: [{ url: cafe.coverImage.src, alt: cafe.coverImage.alt }] },
  };
}

/** "6 October 2026" from an ISO date, the same on the server and in every time zone. */
const day = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

async function CafeContent({ params }: { params: Params }) {
  const { slug } = await params;
  const journal = await getJournal();
  const cafe = slug === EMPTY_SLUG ? undefined : findBySlug(journal.cafes, slug);
  if (!cafe) notFound();

  const postcards = toViews(journal, postcardsForCafe(journal, cafe.slug));
  const place = cafe.destinationSlug ? findBySlug(journal.destinations, cafe.destinationSlug) : undefined;
  const where = [cafe.city, cafe.country].filter(Boolean).join(", ");

  // When I went, worked out from the postcards (nothing is shown if none of them has a date)
  const dates = [...new Set(postcards.map((p) => p.takenOn).filter((d): d is string => Boolean(d)))].sort();
  const visited = dates.length === 0 ? undefined : dates.length === 1 ? `Visited ${day(dates[0])}` : `First visited ${day(dates[0])}`;

  // Where to go next: cafés in the same place first, then the rest
  const others = journal.cafes
    .filter((c) => c.slug !== cafe.slug)
    .sort((a, b) => Number(b.destinationSlug === cafe.destinationSlug) - Number(a.destinationSlug === cafe.destinationSlug))
    .slice(0, 3);

  return (
    <article>
      <CollectionHero
        title={cafe.name}
        lede={cafe.notes}
        back={{ href: "/cafes", label: "All cafés" }}
        cover={cafe.coverImage}
        variant="split"
        coverNote={cafe.neighborhood}
        aside={<CafeGuide cafe={cafe} />}
        meta={
          <>
            {where && <span>{where}</span>}
            {visited && <span>{visited}</span>}
            <span>{plural(postcards.length, "postcard")}</span>
            {place && place.name !== cafe.city && (
              <span>
                <Link href={`/destinations/${place.slug}`} className="text-link">
                  {place.name}
                </Link>
              </span>
            )}
            {cafe.mapUrl && <MapLink href={cafe.mapUrl} name={cafe.name} />}
          </>
        }
      />

      {postcards.length > 0 && (
        <section className="wrap section--tight" aria-labelledby="cafe-postcards">
          <SectionHeader id="cafe-postcards" title="Postcards" />
          <BloomGallery items={postcards} filterable={false} />
        </section>
      )}

      {others.length > 0 && (
        <section className="wrap section--tight" aria-labelledby="more-cafes">
          <SectionHeader id="more-cafes" title="More cafés" action={{ href: "/cafes", label: "All cafés" }} />
          <div className="card-grid">
            {others.map((other, index) => (
              <CafeCard key={other.slug} cafe={other} count={postcardCount(journal, "cafeSlug", other.slug)} index={index} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

export default function CafePage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <CafeContent params={params} />
    </Suspense>
  );
}
