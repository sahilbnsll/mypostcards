import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getJournal } from "@/content";
import { EMPTY_SLUG, findBySlug, postcardsForCafe, staticSlugs, toViews } from "@/content/selectors";
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

async function CafeContent({ params }: { params: Params }) {
  const { slug } = await params;
  const journal = await getJournal();
  const cafe = slug === EMPTY_SLUG ? undefined : findBySlug(journal.cafes, slug);
  if (!cafe) notFound();

  const postcards = toViews(journal, postcardsForCafe(journal, cafe.slug));
  const place = cafe.destinationSlug ? findBySlug(journal.destinations, cafe.destinationSlug) : undefined;
  const where = [cafe.neighborhood, cafe.city, cafe.country].filter(Boolean).join(", ");

  return (
    <article>
      <CollectionHero
        title={cafe.name}
        lede={cafe.notes}
        back={{ href: "/cafes", label: "All cafés" }}
        cover={cafe.coverImage}
        meta={
          <>
            {where && <span>{where}</span>}
            {cafe.favoriteOrder && <span>Usual order: {cafe.favoriteOrder}</span>}
            <span>{plural(postcards.length, "postcard")}</span>
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

      {postcards.length > 0 && (
        <section className="wrap section--tight" aria-labelledby="cafe-postcards">
          <SectionHeader id="cafe-postcards" title="Postcards" />
          <BloomGallery items={postcards} filterable={false} />
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
