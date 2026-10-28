import type { Metadata } from "next";
import { getJournal } from "@/content";
import { JsonLd } from "@/components/ui/JsonLd";
import { collectionJsonLd, pageMetadata } from "@/lib/seo";
import { cafePrints, postcardCount } from "@/content/selectors";
import { CafeBrowser } from "@/components/features/cafes/CafeBrowser";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHead } from "@/components/ui/PageHead";

export async function generateMetadata(): Promise<Metadata> {
  const { cafes } = await getJournal();
  const rated = cafes.filter((c) => c.rating);
  const cities = [...new Set(cafes.map((c) => c.city).filter(Boolean))];
  return pageMetadata({
    title: "Cafés and restaurants, with my ratings",
    description: `${cafes.length} cafés and restaurants${cities.length ? ` in ${cities.join(", ")}` : ""}, ${rated.length} with my own rating out of 5, what I ordered and photographs of each.`,
    path: "/cafes",
    image: cafes[0]?.coverImage,
  });
}

export default async function CafesPage() {
  const journal = await getJournal();
  const prints = cafePrints(journal, journal.cafes);

  return (
    <>
      <JsonLd data={collectionJsonLd({ name: "Cafés", description: "Cafés and restaurants I have visited.", path: "/cafes", items: journal.cafes.map((c) => ({ name: c.name, path: `/cafes/${c.slug}`, image: c.coverImage.src })) })} />
      <PageHead title="Cafés" lede="Quiet corners, good light and the usual order." />
      <section className="wrap" aria-label="Cafés">
        {journal.cafes.length > 0 ? (
          <CafeBrowser
            entries={journal.cafes.map((cafe) => ({
              cafe,
              count: postcardCount(journal, "cafeSlug", cafe.slug),
              prints: prints[cafe.slug] ?? [],
            }))}
          />
        ) : (
          <EmptyState title="No cafés yet" body="Cafés I come back to will be collected here." />
        )}
      </section>
    </>
  );
}
