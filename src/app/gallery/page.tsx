import type { Metadata } from "next";
import { getJournal } from "@/content";
import { toViews } from "@/content/selectors";
import { BloomGallery } from "@/components/features/gallery/BloomGallery";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHead } from "@/components/ui/PageHead";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Every postcard in one place. Filter by travel, city, café, food or getaway.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const journal = await getJournal();
  const items = toViews(journal, journal.postcards);

  return (
    <>
      <PageHead title="Gallery" lede="Every postcard, in the order they were kept. Choose a kind to bring its photographs back into colour." />
      <section className="wrap" aria-label="Postcards">
        {items.length > 0 ? (
          <BloomGallery items={items} stickyFilters />
        ) : (
          <EmptyState title="Nothing here yet" body="Postcards will appear here as soon as the first one is added." action={{ href: "/", label: "Back to the start" }} />
        )}
      </section>
    </>
  );
}
