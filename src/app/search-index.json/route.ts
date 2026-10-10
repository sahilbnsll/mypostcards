import { getJournal } from "@/content";
import { CATEGORY_BY_ID } from "@/content/categories";
import { formatLocation } from "@/lib/utils";
import type { SearchEntry } from "@/components/features/search/types";

/**
 * The search index: one small entry per postcard, trip, place, café and story. Built once at
 * deploy time and fetched by the search box the first time it is opened, so it costs nothing until
 * someone searches.
 */
export async function GET() {
  const journal = await getJournal();
  const places = new Map(journal.destinations.map((d) => [d.slug, d.name]));
  const trips = new Map(journal.trips.map((t) => [t.slug, t.title]));

  const entries: SearchEntry[] = [
    ...journal.postcards.map((p): SearchEntry => {
      const where = formatLocation(p.location, ["placeName", "city", "country"]);
      return {
        type: "postcard",
        title: p.title,
        subtitle: where || CATEGORY_BY_ID[p.category].label,
        href: `/postcards/${p.slug}`,
        text: [
          p.title, p.caption, p.note, where, p.location.region, p.tags.join(" "), CATEGORY_BY_ID[p.category].label,
          p.tripSlug ? trips.get(p.tripSlug) : "", p.destinationSlug ? places.get(p.destinationSlug) : "",
        ].filter(Boolean).join(" "),
      };
    }),
    ...journal.trips.map((t): SearchEntry => ({
      type: "trip",
      title: t.title,
      subtitle: t.summary,
      href: `/trips/${t.slug}`,
      text: [t.title, t.summary, t.destinationSlug ? places.get(t.destinationSlug) : "", ...t.days.flatMap((d) => d.stops.map((s) => s.place))].filter(Boolean).join(" "),
    })),
    ...journal.destinations.map((d): SearchEntry => ({
      type: "place",
      title: d.name,
      subtitle: [d.status === "planned" ? "Dreaming of" : undefined, d.country].filter(Boolean).join(", "),
      href: `/destinations/${d.slug}`,
      text: [d.name, d.country, d.region, d.description].filter(Boolean).join(" "),
    })),
    ...journal.cafes.map((c): SearchEntry => ({
      type: "café",
      title: c.name,
      subtitle: [c.neighborhood, c.city].filter(Boolean).join(", ") || "Café",
      href: `/cafes/${c.slug}`,
      text: [c.name, c.neighborhood, c.city, c.country, c.vibeTags.join(" "), c.favoriteOrder, c.notes].filter(Boolean).join(" "),
    })),
    ...journal.stories.map((s): SearchEntry => ({
      type: "story",
      title: s.title,
      subtitle: s.subtitle ?? "Story",
      href: `/stories/${s.slug}`,
      text: [s.title, s.subtitle, s.excerpt].filter(Boolean).join(" "),
    })),
  ];

  return Response.json(entries);
}
