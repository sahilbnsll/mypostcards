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
  const stories = new Map(journal.stories.map((s) => [s.slug, s.title]));
  return postcards.map((card) => ({
    ...card,
    tripTitle: card.tripSlug ? trips.get(card.tripSlug) : undefined,
    destinationName: card.destinationSlug ? places.get(card.destinationSlug) : undefined,
    cafeName: card.cafeSlug ? cafes.get(card.cafeSlug) : undefined,
    storyTitle: card.storySlug ? stories.get(card.storySlug) : undefined,
    related: relatedPostcards(journal.postcards, card).map((r) => ({ slug: r.slug, title: r.title })),
  }));
}

export const visitedPlaces = (journal: Journal) => journal.destinations.filter((d) => d.status === "visited");
export const plannedPlaces = (journal: Journal) => journal.destinations.filter((d) => d.status === "planned");

/** Where a postcard was taken: its café, trip or place, so a sample can spread across them. */
const contextOf = (card: Postcard) => card.cafeSlug ?? card.tripSlug ?? card.destinationSlug ?? "none";

/** Interleave groups: first of each, then second of each, so neighbours rarely share a context. */
function interleave<T>(groups: T[][]): T[] {
  const out: T[] = [];
  for (let i = 0; groups.some((g) => i < g.length); i++) for (const g of groups) if (i < g.length) out.push(g[i]);
  return out;
}

/**
 * Up to `n` postcards, taking turns across categories so every kind shows up, and within a kind
 * across cafés, trips and places so one spot does not fill it. Featured first. Used for the home
 * page preview of the gallery and the footer mosaic.
 */
export function balancedSample(postcards: readonly Postcard[], n: number): Postcard[] {
  const lanes = new Map<Category, Postcard[]>();
  const byKind = new Map<Category, Map<string, Postcard[]>>();
  for (const card of featuredFirst(postcards)) {
    const contexts = byKind.get(card.category) ?? new Map<string, Postcard[]>();
    const group = contexts.get(contextOf(card)) ?? [];
    group.push(card);
    contexts.set(contextOf(card), group);
    byKind.set(card.category, contexts);
  }
  for (const [category, contexts] of byKind) lanes.set(category, interleave([...contexts.values()]));
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
  /** Every place that shares this pin (Delhi and Gurugram are one dot at globe scale). */
  places: GlobePlace[];
  title: string;
  image: Postcard["image"];
  /** Small fixed tilt so the polaroids do not look machine-set. */
  rotate: number;
}

export interface GlobePlace {
  /** The area (Delhi NCR) when the place belongs to one, otherwise the city. */
  name: string;
  /** Where the row leads: the place page when there is one place, otherwise the places list. */
  href: string;
  count: number;
  /** The cities inside an area, each with its own page. Empty when the name is a single city. */
  places: Array<{ name: string; href: string; count: number }>;
}

/** What a postcard is filed under on the globe and map: its named area, else its city. */
const unitOf = (card: Postcard) => card.location.area ?? card.location.city ?? card.location.placeName;

/** The distinct areas or cities among some postcards, most postcards first. */
function placesOf(cards: readonly Postcard[]): GlobePlace[] {
  const found = new Map<string, GlobePlace>();
  for (const card of cards) {
    const name = unitOf(card);
    if (!name) continue;
    const city = card.location.city ?? card.location.placeName ?? name;
    const href = card.destinationSlug ? `/destinations/${card.destinationSlug}` : "/destinations";
    const entry = found.get(name) ?? { name, href, count: 0, places: [] };
    entry.count += 1;
    const sub = entry.places.find((p) => p.name === city);
    if (sub) sub.count += 1;
    else entry.places.push({ name: city, href, count: 1 });
    found.set(name, entry);
  }
  for (const entry of found.values()) {
    entry.places.sort((x, y) => y.count - x.count);
    if (entry.places.length <= 1 && entry.places[0]?.name === entry.name) entry.places = [];
    else if (entry.places.length > 1) entry.href = "/destinations";
  }
  return [...found.values()].sort((x, y) => y.count - x.count);
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
 * A pin's label from the postcards it stands for: every city or place they come from, so a pin
 * that covers Delhi and Gurugram says "Delhi NCR, India" (their named area), and a new city shows up by name
 * as soon as a postcard from it is added.
 */
function pinLabel(cards: readonly Postcard[], withCountry = true): string {
  const names: string[] = [];
  for (const card of cards) {
    const name = unitOf(card);
    if (name && !names.includes(name)) names.push(name);
  }
  const countries = new Set(cards.map((c) => c.location.country).filter(Boolean));
  const shown = names.slice(0, 3).join(", ") + (names.length > 3 ? ` +${names.length - 3}` : "");
  return [shown, withCountry && countries.size === 1 ? [...countries][0] : undefined].filter(Boolean).join(", ");
}

/**
 * Up to `max` postcards with coordinates, spread around the world so pins and polaroids do not
 * pile on top of each other (each at least `minSeparationDeg` from the others). Featured first.
 * A pin is named after every place close enough to share it.
 */
export function globePins(postcards: readonly Postcard[], max = 7, minSeparationDeg = 20): GlobePin[] {
  const tilts = [-5, 4, -3, 6, -4, 3, -6, 5];
  const limit = (minSeparationDeg * Math.PI) / 180;
  const ordered = featuredFirst(postcards);
  const chosen: GlobePin[] = [];
  for (const card of ordered) {
    const point = card.location.coordinates;
    if (!point || chosen.length >= max) continue;
    const tooClose = chosen.some((pin) => angularDistance(pin, point) < limit);
    if (tooClose) continue;
    const sharing = ordered.filter((c) => c.location.coordinates && angularDistance(c.location.coordinates, point) < limit);
    chosen.push({
      id: card.slug,
      lat: point.lat,
      lng: point.lng,
      label: pinLabel(sharing),
      places: placesOf(sharing),
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
  const spotOf = (point: { lat: number; lng: number }) => `${Math.round(point.lat / 7)},${Math.round(point.lng / 7)}`;
  const ordered = featuredFirst(journal.postcards);
  const spots = new Set<string>();
  for (const card of ordered) {
    const point = card.location.coordinates;
    if (!point) continue;
    const spot = spotOf(point);
    if (spots.has(spot)) continue;
    spots.add(spot);
    const sharing = ordered.filter((c) => c.location.coordinates && spotOf(c.location.coordinates) === spot);
    pins.push({
      id: card.slug,
      lat: point.lat,
      lng: point.lng,
      label: pinLabel(sharing, false) || card.title,
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
