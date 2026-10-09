/**
 * Maps Supabase rows (snake_case, nullable) to the domain types the pages use.
 * The inverse lives in scripts/seed.mjs.
 */
import type {
  Cafe,
  CameraMetadata,
  Category,
  Destination,
  ImageAsset,
  Journal,
  LocationInfo,
  Postcard,
  Story,
  Trip,
} from "./types";

type Nullable<T> = T | null;

interface ImageColumns {
  src: string;
  alt: string;
  width: number;
  height: number;
  color: Nullable<string>;
}

const orUndefined = <T>(value: Nullable<T> | undefined): T | undefined => value ?? undefined;

function image(row: Record<string, unknown>, prefix: "cover" | "image"): ImageAsset {
  const cols: ImageColumns = {
    src: row[`${prefix}_src`] as string,
    alt: row[`${prefix}_alt`] as string,
    width: row[`${prefix}_width`] as number,
    height: row[`${prefix}_height`] as number,
    color: (row[`${prefix}_color`] as Nullable<string>) ?? null,
  };
  return { ...cols, color: orUndefined(cols.color) };
}

function coordinates(lat: Nullable<number>, lng: Nullable<number>) {
  return lat === null || lng === null || lat === undefined || lng === undefined ? undefined : { lat, lng };
}

type Row = Record<string, unknown>;
const str = (row: Row, key: string) => orUndefined(row[key] as Nullable<string>);
const num = (row: Row, key: string) => row[key] as number;
const bool = (row: Row, key: string) => Boolean(row[key]);

export function mapDestination(row: Row): Destination {
  return {
    slug: row.slug as string,
    name: row.name as string,
    country: row.country as string,
    region: str(row, "region"),
    description: (row.description as string) ?? "",
    coverImage: image(row, "cover"),
    coordinates: coordinates(row.lat as Nullable<number>, row.lng as Nullable<number>),
    isSample: bool(row, "is_sample"),
    sortOrder: num(row, "sort_order"),
  };
}

export function mapTrip(row: Row): Trip {
  return {
    slug: row.slug as string,
    title: row.title as string,
    summary: row.summary as string,
    story: str(row, "story"),
    coverImage: image(row, "cover"),
    destinationSlug: str(row, "destination_slug"),
    startDate: str(row, "start_date"),
    endDate: str(row, "end_date"),
    periodLabel: str(row, "period_label"),
    isSample: bool(row, "is_sample"),
    featured: bool(row, "featured"),
    sortOrder: num(row, "sort_order"),
  };
}

export function mapCafe(row: Row): Cafe {
  return {
    slug: row.slug as string,
    name: row.name as string,
    city: str(row, "city"),
    country: str(row, "country"),
    neighborhood: str(row, "neighborhood"),
    destinationSlug: str(row, "destination_slug"),
    coverImage: image(row, "cover"),
    vibeTags: (row.vibe_tags as string[]) ?? [],
    notes: str(row, "notes"),
    favoriteOrder: str(row, "favorite_order"),
    isSample: bool(row, "is_sample"),
    sortOrder: num(row, "sort_order"),
  };
}

export function mapStory(row: Row): Story {
  return {
    slug: row.slug as string,
    title: row.title as string,
    subtitle: str(row, "subtitle"),
    publishedAt: str(row, "published_at"),
    readingTimeMinutes: num(row, "reading_time_minutes"),
    excerpt: row.excerpt as string,
    body: row.body as string,
    coverImage: image(row, "cover"),
    tripSlug: str(row, "trip_slug"),
    destinationSlug: str(row, "destination_slug"),
    isSample: bool(row, "is_sample"),
    featured: bool(row, "featured"),
    sortOrder: num(row, "sort_order"),
  };
}

export function mapPostcard(row: Row): Postcard {
  const location: LocationInfo = {
    placeName: str(row, "place_name"),
    city: str(row, "city"),
    region: str(row, "region"),
    country: str(row, "country"),
    coordinates: coordinates(row.lat as Nullable<number>, row.lng as Nullable<number>),
  };
  return {
    slug: row.slug as string,
    title: row.title as string,
    caption: str(row, "caption"),
    note: str(row, "note"),
    image: image(row, "image"),
    category: row.category as Category,
    location,
    takenOn: str(row, "taken_on"),
    periodLabel: str(row, "period_label"),
    tripSlug: str(row, "trip_slug"),
    destinationSlug: str(row, "destination_slug"),
    cafeSlug: str(row, "cafe_slug"),
    storySlug: str(row, "story_slug"),
    tags: (row.tags as string[]) ?? [],
    camera: orUndefined(row.camera as Nullable<CameraMetadata>),
    credit: str(row, "credit"),
    creditUrl: str(row, "credit_url"),
    isSample: bool(row, "is_sample"),
    featured: bool(row, "featured"),
    sortOrder: num(row, "sort_order"),
  };
}

export function mapJournal(rows: {
  postcards: Row[];
  trips: Row[];
  destinations: Row[];
  cafes: Row[];
  stories: Row[];
}): Journal {
  return {
    postcards: rows.postcards.map(mapPostcard),
    trips: rows.trips.map(mapTrip),
    destinations: rows.destinations.map(mapDestination),
    cafes: rows.cafes.map(mapCafe),
    stories: rows.stories.map(mapStory),
  };
}
