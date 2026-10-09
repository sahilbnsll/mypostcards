import type { Metadata } from "next";
import { getJournal } from "@/content";
import { postcardCount } from "@/content/selectors";
import { CafeCard } from "@/components/features/cafes/CafeCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHead } from "@/components/ui/PageHead";

export const metadata: Metadata = {
  title: "Cafés",
  description: "Quiet corners, good light and the coffee orders worth repeating.",
  alternates: { canonical: "/cafes" },
};

export default async function CafesPage() {
  const journal = await getJournal();

  return (
    <>
      <PageHead title="Cafés" lede="Quiet corners, good light and the usual order." />
      <section className="wrap" aria-label="Cafés">
        {journal.cafes.length > 0 ? (
          <div className="card-grid">
            {journal.cafes.map((cafe, index) => (
              <CafeCard as="h2" key={cafe.slug} cafe={cafe} count={postcardCount(journal, "cafeSlug", cafe.slug)} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState title="No cafés yet" body="Cafés I come back to will be collected here." />
        )}
      </section>
    </>
  );
}
