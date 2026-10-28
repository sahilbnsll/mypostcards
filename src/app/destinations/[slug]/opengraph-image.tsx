import { getJournal } from "@/content";
import { EMPTY_SLUG, findBySlug, staticSlugs, postcardCount } from "@/content/selectors";
import { ogCard, photoDataUri } from "@/lib/og";
import { plural } from "@/lib/utils";

export const alt = "A place from My Postcards";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  return staticSlugs((await getJournal()).destinations);
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journal = await getJournal();
  const place = slug === EMPTY_SLUG ? undefined : findBySlug(journal.destinations, slug);
  const photo = place?.coverImage ? await photoDataUri(place.coverImage.src) : null;
  const count = place ? postcardCount(journal, "destinationSlug", place.slug) : 0;
  return ogCard({
    kind: place?.status === "planned" ? "On the list" : "Place",
    title: place?.name ?? "Places",
    line: [[place?.region, place?.country].filter(Boolean).join(", "), count ? plural(count, "postcard") : undefined].filter(Boolean).join(" · "),
    photo,
    ratio: place?.coverImage ? place.coverImage.width / place.coverImage.height : 1,
  });
}
