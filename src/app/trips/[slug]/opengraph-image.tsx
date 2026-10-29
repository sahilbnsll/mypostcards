import { getJournal } from "@/content";
import { EMPTY_SLUG, findBySlug, staticSlugs, postcardCount } from "@/content/selectors";
import { ogCard, photoDataUri } from "@/lib/og";
import { formatRange, plural } from "@/lib/utils";

export const alt = "A trip from My Postcards";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  return staticSlugs((await getJournal()).trips);
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journal = await getJournal();
  const trip = slug === EMPTY_SLUG ? undefined : findBySlug(journal.trips, slug);
  const photo = trip ? await photoDataUri(trip.coverImage.src) : null;
  const count = trip ? postcardCount(journal, "tripSlug", trip.slug) : 0;
  const when = trip ? formatRange(trip.startDate, trip.endDate, trip.periodLabel) : undefined;
  return ogCard({
    kind: "Trip",
    title: trip?.title ?? "Trips",
    line: [when, count ? plural(count, "postcard") : undefined].filter(Boolean).join(", "),
    photo,
    ratio: trip ? trip.coverImage.width / trip.coverImage.height : 1,
  });
}
