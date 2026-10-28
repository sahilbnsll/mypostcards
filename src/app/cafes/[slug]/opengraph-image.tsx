import { getJournal } from "@/content";
import { EMPTY_SLUG, findBySlug, staticSlugs, postcardCount } from "@/content/selectors";
import { ogCard, photoDataUri } from "@/lib/og";
import { plural } from "@/lib/utils";

export const alt = "A café from My Postcards";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  return staticSlugs((await getJournal()).cafes);
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journal = await getJournal();
  const cafe = slug === EMPTY_SLUG ? undefined : findBySlug(journal.cafes, slug);
  const photo = cafe ? await photoDataUri(cafe.coverImage.src) : null;
  const count = cafe ? postcardCount(journal, "cafeSlug", cafe.slug) : 0;
  return ogCard({
    kind: "Café",
    title: cafe?.name ?? "Cafés",
    line: [cafe?.rating ? `${cafe.rating}/5` : undefined, [cafe?.neighborhood, cafe?.city].filter(Boolean).join(", "), count ? plural(count, "postcard") : undefined].filter(Boolean).join(" · "),
    photo,
    ratio: cafe ? cafe.coverImage.width / cafe.coverImage.height : 1,
  });
}
