import type { Metadata } from "next";
import { getJournal } from "@/content";
import { JsonLd } from "@/components/ui/JsonLd";
import { collectionJsonLd, pageMetadata } from "@/lib/seo";
import { featuredFirst, toViews } from "@/content/selectors";
import { FeaturedBento } from "@/components/features/gallery/FeaturedBento";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BloomGallery } from "@/components/features/gallery/BloomGallery";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHead } from "@/components/ui/PageHead";

export async function generateMetadata(): Promise<Metadata> {
  const { postcards, destinations } = await getJournal();
  const places = destinations.filter((d) => d.status === "visited").length;
  return pageMetadata({
    title: "Photo gallery: every postcard",
    description: `${postcards.length} photographs and short clips from ${places} places: trips, cafés, city streets and food, kept as digital postcards. Filter by kind, mood or place.`,
    path: "/gallery",
    image: postcards.find((p) => p.featured)?.image ?? postcards[0]?.image,
  });
}

export default async function GalleryPage() {
  const journal = await getJournal();
  const items = toViews(journal, journal.postcards);
  const selected = toViews(journal, featuredFirst(journal.postcards).slice(0, 5));

  return (
    <>
      <JsonLd data={collectionJsonLd({ name: "Gallery", description: "Every postcard in one place.", path: "/gallery", items: journal.postcards.slice(0, 30).map((p) => ({ name: p.title, path: `/postcards/${p.slug}`, image: p.image.src })) })} />
      <PageHead title="Gallery" lede="Every postcard, in the order they were kept. Choose a kind to bring its photographs back into colour." />
      {selected.length === 5 && (
        <section className="wrap section--tight" aria-labelledby="selected-title" style={{ paddingTop: 0 }}>
          <SectionHeader id="selected-title" title="Selected" intro="Five favourites, in black and white until you point at one." />
          <FeaturedBento items={selected} />
        </section>
      )}
      <section className="wrap" aria-labelledby="all-title">
        <h2 id="all-title" className="visually-hidden">
          All postcards
        </h2>
        {items.length > 0 ? (
          <BloomGallery items={items} stickyFilters pageSize={24} />
        ) : (
          <EmptyState title="Nothing here yet" body="Postcards will appear here as soon as the first one is added." action={{ href: "/", label: "Back to the start" }} />
        )}
      </section>
    </>
  );
}
