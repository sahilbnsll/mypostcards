/**
 * Domain types for My Postcards.
 *
 * Every entity is keyed by a human-readable `slug`, and relations use slugs
 * (`tripSlug: "alpine-light"`). The journal is authored in `content/` (JSON and Markdown) with
 * photographs in `public/images/`; `scripts/build-content.mjs` turns that into these types.
 */

export type Category = "travel" | "city" | "cafe" | "food" | "getaway" | "art" | "random";

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
  /** Metres above sea level, from the photograph's GPS. */
  altitude?: number;
  /** True when the coordinates are the place's, not the exact spot the photo was taken. */
  approximate?: boolean;
  /** The named area the place belongs to (Delhi NCR), used to label pins on the globe and the map. */
  area?: string;
}

export interface CameraMetadata {
  body?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  iso?: number;
  shutterSpeed?: string;
}

/** A short silent clip. The postcard's `image` is its poster frame, so the frame size is known. */
export interface VideoAsset {
  src: string;
  /** True for the one kind of clip that keeps its audio; every other clip is silent. */
  sound?: boolean;
}

export interface Postcard {
  slug: string;
  title: string;
  /** One line. Every postcard has one; the story lives elsewhere. */
  caption?: string;
  /** The handwritten message on the back of the card. Optional and short. */
  note?: string;
  image: ImageAsset;
  /** A clip for this postcard. Plays muted and only when asked to (no autoplay). */
  video?: VideoAsset;
  category: Category;
  location: LocationInfo;
  /** ISO date (YYYY-MM-DD) when known. */
  takenOn?: string;
  /** Local time of day on `takenOn`, as 24 hour "HH:MM". */
  takenTime?: string;
  /** Free-form period for approximate dates, e.g. "Late autumn 2024". */
  periodLabel?: string;
  tripSlug?: string;
  destinationSlug?: string;
  cafeSlug?: string;
  storySlug?: string;
  tags: string[];
  camera?: CameraMetadata;
  /** Who made the thing in the photograph (a painting, a model, a print), when it is not me. */
  artist?: string;
  /** A link to the artist's page (for example their Instagram), shown beside their name. */
  artistUrl?: string;
  /** Photographer credit, shown for photos that are not mine. */
  credit?: string;
  creditUrl?: string;
  /** My rating of what is in the photo (a dish, a drink, a view): 0.5 to 5, at most one decimal. */
  rating?: number;
  /** True while a photo is stand-in content rather than one of my own. */
  isSample: boolean;
  featured: boolean;
  /** Place on the home page's pinned line (1 is first). Absent when the postcard is not pinned. */
  pinned?: number;
  sortOrder: number;
}

/** One thing to do or see on an itinerary day. Only `place` is required. */
export interface ItineraryStop {
  place: string;
  /** Free text: "Before sunrise", "10:30", "Late afternoon". */
  time?: string;
  note?: string;
  /** A practical tip, shown set apart from the note. */
  tip?: string;
  coordinates?: GeoCoordinates;
  /** A postcard from this stop. */
  postcardSlug?: string;
}

export interface ItineraryDay {
  /** 1-based, taken from the order in the file. */
  day: number;
  title?: string;
  stops: ItineraryStop[];
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
  /** Day-by-day plan or record. Empty when the trip has no itinerary. */
  days: ItineraryDay[];
  isSample: boolean;
  featured: boolean;
  sortOrder: number;
}

export type PlaceStatus = "visited" | "planned";

export interface Destination {
  slug: string;
  name: string;
  country: string;
  region?: string;
  /** A named area that groups places which sit next to each other (Delhi NCR). */
  area?: string;
  description: string;
  /** Optional for planned places that have no photograph yet. */
  coverImage?: ImageAsset;
  coordinates?: GeoCoordinates;
  /** "planned" places are shown under "Dreaming of". */
  status: PlaceStatus;
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
  /** The guide details below are shown only when they are filled in. */
  favoriteOrder?: string;
  price?: string;
  bestSeat?: string;
  wifi?: string;
  mapUrl?: string;
  /** My rating of the place: 0.5 to 5, at most one decimal, with an optional line about it. */
  rating?: number;
  ratingNote?: string;
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
  storyTitle?: string;
  /** Up to four related postcards, best match first. */
  related: Array<{ slug: string; title: string }>;
}
