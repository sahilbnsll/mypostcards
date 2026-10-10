import type { Category, ImageAsset, Journal, Postcard, PostcardView } from "./types";

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

/**
 * Postcards most like this one, best first. Scores shared context (same trip, place or café) above
 * shared tags and kind, and ignores anything with no overlap at all.
 */
export function relatedPostcards(postcards: readonly Postcard[], card: Postcard, max = 4): Postcard[] {
  const tags = new Set(card.tags);
  return postcards
    .filter((other) => other.slug !== card.slug)
    .map((other) => {
      let score = 0;
      if (card.tripSlug && other.tripSlug === card.tripSlug) score += 4;
      if (card.cafeSlug && other.cafeSlug === card.cafeSlug) score += 4;
      if (card.destinationSlug && other.destinationSlug === card.destinationSlug) score += 3;
      else if (card.location.city && other.location.city === card.location.city) score += 3;
      else if (card.location.country && other.location.country === card.location.country) score += 1;
      for (const tag of other.tags) if (tags.has(tag)) score += 1.5;
      if (other.category === card.category) score += 1;
      return { other, score };
    })
    .filter((entry) => entry.score >= 2)
    .sort((a, b) => b.score - a.score || a.other.sortOrder - b.other.sortOrder)
    .slice(0, max)
    .map((entry) => entry.other);
}

/** Attach the names of each postcard's trip, place and café, plus its related postcards. */
export function toViews(journal: Journal, postcards: readonly Postcard[]): PostcardView[] {
  const trips = new Map(journal.trips.map((t) => [t.slug, t.title]));
  const places = new Map(journal.destinations.map((d) => [d.slug, d.name]));
  const cafes = new Map(journal.cafes.map((c) => [c.slug, c.name]));
  return postcards.map((card) => ({
    ...card,
    tripTitle: card.tripSlug ? trips.get(card.tripSlug) : undefined,
    destinationName: card.destinationSlug ? places.get(card.destinationSlug) : undefined,
    cafeName: card.cafeSlug ? cafes.get(card.cafeSlug) : undefined,
    related: relatedPostcards(journal.postcards, card).map((r) => ({ slug: r.slug, title: r.title })),
  }));
}

export const visitedPlaces = (journal: Journal) => journal.destinations.filter((d) => d.status === "visited");
export const plannedPlaces = (journal: Journal) => journal.destinations.filter((d) => d.status === "planned");

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

export interface GlobePin {
  /** The postcard's slug, also the anchor id on the globe. */
  id: string;
  lat: number;
  lng: number;
  label: string;
  title: string;
  image: Postcard["image"];
  /** Small fixed tilt so the polaroids do not look machine-set. */
  rotate: number;
}

/** Great-circle distance in radians between two lat/lng points. */
function angularDistance(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = Math.PI / 180;
  const h =
    Math.sin(((b.lat - a.lat) * rad) / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(((b.lng - a.lng) * rad) / 2) ** 2;
  return 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Up to `max` postcards with coordinates, spread around the world so pins and polaroids do not
 * pile on top of each other (each at least `minSeparationDeg` from the others). Featured first.
 */
export function globePins(postcards: readonly Postcard[], max = 7, minSeparationDeg = 20): GlobePin[] {
  const tilts = [-5, 4, -3, 6, -4, 3, -6, 5];
  const chosen: GlobePin[] = [];
  for (const card of featuredFirst(postcards)) {
    const point = card.location.coordinates;
    if (!point || chosen.length >= max) continue;
    const tooClose = chosen.some((pin) => angularDistance(pin, point) < (minSeparationDeg * Math.PI) / 180);
    if (tooClose) continue;
    chosen.push({
      id: card.slug,
      lat: point.lat,
      lng: point.lng,
      label: [card.location.city ?? card.location.placeName, card.location.country].filter(Boolean).join(", "),
      title: card.title,
      image: card.image,
      rotate: tilts[chosen.length % tilts.length],
    });
  }
  return chosen;
}

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  label: string;
  /** Where the pin leads. Without it the pin is just a mark. */
  href?: string;
  /** Hollow and dashed: somewhere still to visit. */
  planned?: boolean;
  /** The number shown on a route map. Defaults to the pin's position in the list. */
  number?: number;
  /** A photograph for the pin: it is drawn as a small postcard. */
  image?: ImageAsset;
}

/**
 * Pins for the flat map: one per distinct spot that has postcards with coordinates (featured
 * first, one per ~7° square so postcards on the map do not pile up), plus every planned place that has coordinates.
 */
export function mapPins(journal: Journal): MapPin[] {
  const pins: MapPin[] = [];
  const spots = new Set<string>();
  for (const card of featuredFirst(journal.postcards)) {
    const point = card.location.coordinates;
    if (!point) continue;
    const spot = `${Math.round(point.lat / 7)},${Math.round(point.lng / 7)}`;
    if (spots.has(spot)) continue;
    spots.add(spot);
    pins.push({
      id: card.slug,
      lat: point.lat,
      lng: point.lng,
      label: card.location.city ?? card.location.placeName ?? card.title,
      href: `/postcards/${card.slug}`,
      image: card.image,
    });
  }
  for (const place of plannedPlaces(journal)) {
    if (!place.coordinates) continue;
    pins.push({ id: `planned-${place.slug}`, ...place.coordinates, label: place.name, href: `/destinations/${place.slug}`, planned: true });
  }
  return pins;
}
