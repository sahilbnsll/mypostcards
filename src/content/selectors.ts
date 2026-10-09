import type { Category, Journal, Postcard, PostcardView } from "./types";

type WithSlug = { slug: string };

export function findBySlug<T extends WithSlug>(items: readonly T[], slug: string): T | undefined {
  return items.find((item) => item.slug === slug);
}

export const postcardsForTrip = (journal: Journal, tripSlug: string) =>
  journal.postcards.filter((p) => p.tripSlug === tripSlug);

export const postcardsForDestination = (journal: Journal, destinationSlug: string) =>
  journal.postcards.filter((p) => p.destinationSlug === destinationSlug);

export const postcardsForCafe = (journal: Journal, cafeSlug: string) =>
  journal.postcards.filter((p) => p.cafeSlug === cafeSlug);

export const tripsForDestination = (journal: Journal, destinationSlug: string) =>
  journal.trips.filter((t) => t.destinationSlug === destinationSlug);

export const storiesForTrip = (journal: Journal, tripSlug: string) =>
  journal.stories.filter((s) => s.tripSlug === tripSlug);

export const storiesForDestination = (journal: Journal, destinationSlug: string) =>
  journal.stories.filter((s) => s.destinationSlug === destinationSlug);

export const cafesForDestination = (journal: Journal, destinationSlug: string) =>
  journal.cafes.filter((c) => c.destinationSlug === destinationSlug);

export function postcardCount(journal: Journal, key: "tripSlug" | "destinationSlug" | "cafeSlug", slug: string) {
  return journal.postcards.reduce((n, p) => (p[key] === slug ? n + 1 : n), 0);
}

export function categoryCounts(postcards: readonly Postcard[]): Partial<Record<Category, number>> {
  const counts: Partial<Record<Category, number>> = {};
  for (const card of postcards) counts[card.category] = (counts[card.category] ?? 0) + 1;
  return counts;
}

/** Featured first, then the rest in their saved order. */
export function featuredFirst<T extends { featured: boolean }>(items: readonly T[]): T[] {
  return [...items.filter((i) => i.featured), ...items.filter((i) => !i.featured)];
}

/** True when any visible content is stand-in sample content. */
export function hasSampleContent(journal: Journal): boolean {
  return (
    journal.postcards.some((p) => p.isSample) ||
    journal.trips.some((t) => t.isSample) ||
    journal.stories.some((s) => s.isSample)
  );
}

/**
 * `generateStaticParams` must return at least one entry under Cache Components, even when a
 * collection is empty (a fresh Supabase project). The placeholder resolves to a 404 in the page.
 */
export const EMPTY_SLUG = "__none__";
export function staticSlugs<T extends WithSlug>(items: readonly T[]): Array<{ slug: string }> {
  return items.length > 0 ? items.map(({ slug }) => ({ slug })) : [{ slug: EMPTY_SLUG }];
}

/** Attach the names of each postcard's trip, place and café so client components need no lookups. */
export function toViews(journal: Journal, postcards: readonly Postcard[]): PostcardView[] {
  const trips = new Map(journal.trips.map((t) => [t.slug, t.title]));
  const places = new Map(journal.destinations.map((d) => [d.slug, d.name]));
  const cafes = new Map(journal.cafes.map((c) => [c.slug, c.name]));
  return postcards.map((card) => ({
    ...card,
    tripTitle: card.tripSlug ? trips.get(card.tripSlug) : undefined,
    destinationName: card.destinationSlug ? places.get(card.destinationSlug) : undefined,
    cafeName: card.cafeSlug ? cafes.get(card.cafeSlug) : undefined,
  }));
}

/**
 * Up to `n` postcards, taking turns across categories so every kind shows up. Order within a
 * category is preserved (featured first). Used for the home page preview of the gallery.
 */
export function balancedSample(postcards: readonly Postcard[], n: number): Postcard[] {
  const lanes = new Map<Category, Postcard[]>();
  for (const card of featuredFirst(postcards)) {
    const lane = lanes.get(card.category) ?? [];
    lane.push(card);
    lanes.set(card.category, lane);
  }
  const out: Postcard[] = [];
  while (out.length < n && [...lanes.values()].some((lane) => lane.length > 0)) {
    for (const lane of lanes.values()) {
      const next = lane.shift();
      if (next && out.length < n) out.push(next);
    }
  }
  return out;
}
