/**
 * Domain types for My Postcards.
 *
 * Every entity is keyed by a human-readable `slug`. The same slug is the primary
 * key in Supabase (see supabase/schema.sql), so rows are easy to create by hand
 * and relations read naturally (`tripSlug: "alpine-light"`).
 */

export type Category = "travel" | "city" | "cafe" | "food" | "getaway";

export interface CategoryMeta {
  id: Category;
  label: string;
  /** Plural, used in status copy: "6 photos in Cafés". */
  plural: string;
  blurb: string;
}

export interface ImageAsset {
  src: string;
  alt: string;
  /** Intrinsic pixel size. Used to reserve space and avoid layout shift. */
  width: number;
  height: number;
  /** Average colour of the photo, shown while the image loads. */
  color?: string;
}

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface LocationInfo {
  placeName?: string;
  city?: string;
  region?: string;
  country?: string;
  coordinates?: GeoCoordinates;
}

export interface CameraMetadata {
  body?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  iso?: number;
  shutterSpeed?: string;
}

export interface Postcard {
  slug: string;
  title: string;
  /** One line. Every postcard has one; the story lives elsewhere. */
  caption?: string;
  /** The handwritten message on the back of the card. Optional and short. */
  note?: string;
  image: ImageAsset;
  category: Category;
  location: LocationInfo;
  /** ISO date (YYYY-MM-DD) when known. */
  takenOn?: string;
  /** Free-form period for approximate dates, e.g. "Late autumn 2024". */
  periodLabel?: string;
  tripSlug?: string;
  destinationSlug?: string;
  cafeSlug?: string;
  storySlug?: string;
  tags: string[];
  camera?: CameraMetadata;
  /** Photographer credit, shown for photos that are not mine. */
  credit?: string;
  creditUrl?: string;
  /** True while a photo is stand-in content rather than one of my own. */
  isSample: boolean;
  featured: boolean;
  sortOrder: number;
}

export interface Trip {
  slug: string;
  title: string;
  summary: string;
  /** Long-form text. Paragraphs are separated by a blank line. */
  story?: string;
  coverImage: ImageAsset;
  destinationSlug?: string;
  startDate?: string;
  endDate?: string;
  periodLabel?: string;
  isSample: boolean;
  featured: boolean;
  sortOrder: number;
}

export interface Destination {
  slug: string;
  name: string;
  country: string;
  region?: string;
  description: string;
  coverImage: ImageAsset;
  coordinates?: GeoCoordinates;
  isSample: boolean;
  sortOrder: number;
}

export interface Cafe {
  slug: string;
  name: string;
  city?: string;
  country?: string;
  neighborhood?: string;
  destinationSlug?: string;
  coverImage: ImageAsset;
  vibeTags: string[];
  notes?: string;
  favoriteOrder?: string;
  isSample: boolean;
  sortOrder: number;
}

export interface Story {
  slug: string;
  title: string;
  subtitle?: string;
  publishedAt?: string;
  readingTimeMinutes: number;
  excerpt: string;
  /** Paragraphs separated by a blank line. A line starting with "## " is a subheading. */
  body: string;
  coverImage: ImageAsset;
  tripSlug?: string;
  destinationSlug?: string;
  isSample: boolean;
  featured: boolean;
  sortOrder: number;
}

/** The whole journal, as the pages consume it. */
export interface Journal {
  postcards: Postcard[];
  trips: Trip[];
  destinations: Destination[];
  cafes: Cafe[];
  stories: Story[];
}

/** A postcard plus the display names of what it belongs to, resolved server-side for the lightbox. */
export interface PostcardView extends Postcard {
  tripTitle?: string;
  destinationName?: string;
  cafeName?: string;
}
