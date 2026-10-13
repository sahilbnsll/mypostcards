import { getJournal } from "@/content";
import { toViews } from "@/content/selectors";
import { CATEGORY_BY_ID } from "@/content/categories";
import type { Category } from "@/content/types";
import { BloomGallery } from "@/components/features/gallery/BloomGallery";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHead } from "@/components/ui/PageHead";

interface KindCollectionProps {
  kind: Category;
  title: string;
  lede: string;
  emptyBody: string;
}

/** A page for one kind of postcard (Art, Random clicks): the same gallery, already narrowed down. */
export async function KindCollection({ kind, title, lede, emptyBody }: KindCollectionProps) {
  const journal = await getJournal();
  const items = toViews(journal, journal.postcards.filter((p) => p.category === kind));

  return (
    <>
      <PageHead title={title} lede={lede} />
      <section className="wrap" aria-label={title}>
        {items.length > 0 ? (
          <BloomGallery items={items} filterable={false} />
        ) : (
          <EmptyState title={`No ${CATEGORY_BY_ID[kind].plural} yet`} body={emptyBody} action={{ href: "/gallery", label: "See the whole gallery" }} />
        )}
      </section>
    </>
  );
}
