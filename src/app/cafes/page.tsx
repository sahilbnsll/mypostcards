import type { Metadata } from "next";
import { getJournal } from "@/content";
import { cafePrints, postcardCount } from "@/content/selectors";
import { CafeBrowser } from "@/components/features/cafes/CafeBrowser";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHead } from "@/components/ui/PageHead";

export const metadata: Metadata = {
  title: "Cafés",
  description: "Quiet corners, good light and the coffee orders worth repeating.",
  alternates: { canonical: "/cafes" },
};

export default async function CafesPage() {
  const journal = await getJournal();
  const prints = cafePrints(journal, journal.cafes);

  return (
    <>
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
