import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import type { Cafe, Destination, ImageAsset, Postcard, Story, Trip } from "@/content/types";
import { formatLocation } from "@/lib/utils";

/** The author's handle on X, for share cards. */
export const TWITTER_HANDLE = "@sahilbansalll";

export const absoluteUrl = (path: string) =>
  /^https?:\/\//.test(path) ? path : `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;

/** A sentence or two, trimmed at a word and with no line breaks, to fit a search or share snippet. */
export function snippet(text: string | undefined, max = 158): string {
  const flat = (text ?? "").replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  // Prefer to stop at the end of a sentence; only cut a sentence short when there is no earlier end
  const window = flat.slice(0, max);
  const stop = Math.max(window.lastIndexOf(". "), window.lastIndexOf("! "), window.lastIndexOf("? "));
  if (stop >= 60) return window.slice(0, stop + 1);
  const cut = flat.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 80 ? cut.lastIndexOf(" ") : cut.length).replace(/[,;:.\s-]+$/, "")}…`;
}

interface PageMeta {
  title: string;
  description: string;
  /** The page's own path, which is also its canonical address. */
  path: string;
  type?: "website" | "article";
  /** A photograph to share. Leave out where a share image file sits beside the page. */
  image?: ImageAsset;
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  videos?: { url: string; width?: number; height?: number }[];
  /** Keep the page out of search results (a page that is only a tool). */
  noIndex?: boolean;
  /** Legacy geo meta tags, for a page about one place. */
  geo?: { lat: number; lng: number; placeName?: string; region?: string };
}

/** The same title, description, canonical address and share cards on every page. */
export function pageMetadata(meta: PageMeta): Metadata {
  const url = absoluteUrl(meta.path);
  const images = meta.image
    ? [{ url: absoluteUrl(meta.image.src), width: meta.image.width, height: meta.image.height, alt: meta.image.alt }]
    : undefined;
  return {
    title: meta.title,
    description: meta.description,
    ...(meta.keywords?.length ? { keywords: meta.keywords } : {}),
    alternates: { canonical: meta.path, types: { "application/rss+xml": [{ url: "/feed.xml", title: `${siteConfig.name}: new postcards and stories` }] } },
    ...(meta.noIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: meta.type ?? "website",
      url,
      siteName: siteConfig.name,
      locale: "en_GB",
      title: meta.title,
      description: meta.description,
      ...(images ? { images } : {}),
      ...(meta.videos?.length ? { videos: meta.videos.map((v) => ({ url: absoluteUrl(v.url), type: "video/mp4", width: v.width, height: v.height })) } : {}),
      ...(meta.type === "article"
        ? { authors: [siteConfig.author.website], ...(meta.publishedTime ? { publishedTime: meta.publishedTime } : {}), ...(meta.modifiedTime ? { modifiedTime: meta.modifiedTime } : {}), ...(meta.tags?.length ? { tags: meta.tags } : {}) }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title: meta.title,
      description: meta.description,
      ...(images ? { images: images.map((i) => ({ url: i.url, alt: i.alt })) } : {}),
    },
    ...(meta.geo
      ? {
          other: {
            "geo.position": `${meta.geo.lat};${meta.geo.lng}`,
            ICBM: `${meta.geo.lat}, ${meta.geo.lng}`,
            ...(meta.geo.placeName ? { "geo.placename": meta.geo.placeName } : {}),
            ...(meta.geo.region ? { "geo.region": meta.geo.region } : {}),
          },
        }
      : {}),
  };
}

/* ------------------------------------------------------------------------------ structured data */

type Json = Record<string, unknown>;

const person = (): Json => ({
  "@type": "Person",
  "@id": `${siteConfig.url}/#author`,
  name: siteConfig.author.name,
  url: siteConfig.author.website,
  sameAs: siteConfig.socials.map((s) => s.href),
});

/** The site itself and its author, once, on every page (in the root layout). */
export function siteJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.name,
        description: siteConfig.description,
        inLanguage: "en-GB",
        publisher: { "@id": `${siteConfig.url}/#author` },
      },
      person(),
    ],
  };
}

export function breadcrumbJsonLd(trail: { name: string; path: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...trail].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** A listing page: what it is, and the first few things on it. */
export function collectionJsonLd(args: { name: string; description: string; path: string; items: { name: string; path: string; image?: string }[] }): Json {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: args.name,
    description: args.description,
    url: absoluteUrl(args.path),
    inLanguage: "en-GB",
    isPartOf: { "@id": `${siteConfig.url}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: args.items.length,
      itemListElement: args.items.slice(0, 30).map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(item.path),
        name: item.name,
        ...(item.image ? { image: absoluteUrl(item.image) } : {}),
      })),
    },
  };
}

/** The offset the phone's clock showed, by country, so a time of day can become a full timestamp. */
const OFFSET: Record<string, string> = { Nepal: "+05:45", India: "+05:30" };

export function postcardJsonLd(card: Postcard, ctx: { tripName?: string; tripPath?: string; cafeName?: string }): Json {
  const where = formatLocation(card.location, ["city", "country"]);
  const url = absoluteUrl(`/postcards/${card.slug}`);
  const offset = card.location.country ? OFFSET[card.location.country] : undefined;
  const created = card.takenOn ? (card.takenTime && offset ? `${card.takenOn}T${card.takenTime}:00${offset}` : card.takenOn) : undefined;
  const coords = card.location.coordinates;
  const place: Json | undefined = where || coords
    ? {
        "@type": "Place",
        name: card.location.placeName ?? where,
        ...(card.location.city || card.location.country
          ? { address: { "@type": "PostalAddress", ...(card.location.city ? { addressLocality: card.location.city } : {}), ...(card.location.region ? { addressRegion: card.location.region } : {}), ...(card.location.country ? { addressCountry: card.location.country } : {}) } }
          : {}),
        ...(coords && !card.location.approximate
          ? { geo: { "@type": "GeoCoordinates", latitude: coords.lat, longitude: coords.lng, ...(card.location.altitude !== undefined ? { elevation: card.location.altitude } : {}) } }
          : {}),
      }
    : undefined;
  const credit = { "@type": "Person", "@id": `${siteConfig.url}/#author` };
  const common = {
    name: card.title,
    description: [card.caption, card.note].filter(Boolean).join(" ") || card.image.alt,
    url,
    mainEntityOfPage: url,
    inLanguage: "en-GB",
    keywords: card.tags.join(", ") || undefined,
    ...(created ? { dateCreated: created, uploadDate: created } : {}),
    ...(place ? { contentLocation: place } : {}),
    creator: credit,
    creditText: `${siteConfig.author.name}, ${siteConfig.name}`,
    copyrightHolder: credit,
    ...(card.isSample ? {} : { copyrightYear: card.takenOn ? Number(card.takenOn.slice(0, 4)) : undefined }),
    ...(ctx.tripName ? { isPartOf: { "@type": "CollectionPage", name: ctx.tripName, url: absoluteUrl(ctx.tripPath ?? "/trips") } } : {}),
  };
  const image: Json = {
    "@type": "ImageObject",
    ...common,
    caption: card.caption ?? card.image.alt,
    contentUrl: absoluteUrl(card.image.src),
    thumbnailUrl: absoluteUrl(card.image.src),
    width: card.image.width,
    height: card.image.height,
    encodingFormat: "image/jpeg",
    representativeOfPage: true,
    ...(card.camera?.body ? { exifData: Object.entries({ Camera: card.camera.body, Lens: card.camera.lens, Aperture: card.camera.aperture, ISO: card.camera.iso, Shutter: card.camera.shutterSpeed }).filter(([, v]) => v !== undefined).map(([name, value]) => ({ "@type": "PropertyValue", name, value })) } : {}),
  };
  const graph: Json[] = [image];
  if (card.video) {
    graph.push({
      "@type": "VideoObject",
      ...common,
      "@id": `${url}#video`,
      name: card.title,
      description: `${card.caption ?? card.image.alt}${card.video.sound ? " (with sound)" : " (silent)"}`,
      contentUrl: absoluteUrl(card.video.src),
      thumbnailUrl: absoluteUrl(card.image.src),
      encodingFormat: "video/mp4",
      uploadDate: created ?? new Date(0).toISOString().slice(0, 10),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

export function tripJsonLd(trip: Trip, stops: { name: string; lat?: number; lng?: number }[], cards: number): Json {
  const url = absoluteUrl(`/trips/${trip.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: trip.title,
    description: trip.summary,
    url,
    image: absoluteUrl(trip.coverImage.src),
    inLanguage: "en-GB",
    ...(trip.startDate ? { departureTime: trip.startDate } : {}),
    ...(trip.endDate ? { arrivalTime: trip.endDate } : {}),
    provider: { "@id": `${siteConfig.url}/#author` },
    ...(stops.length
      ? {
          itinerary: {
            "@type": "ItemList",
            numberOfItems: stops.length,
            itemListElement: stops.map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: { "@type": "Place", name: s.name, ...(s.lat !== undefined && s.lng !== undefined ? { geo: { "@type": "GeoCoordinates", latitude: s.lat, longitude: s.lng } } : {}) },
            })),
          },
        }
      : {}),
    ...(cards ? { subjectOf: { "@type": "CollectionPage", name: `${trip.title}: ${cards} postcards`, url } } : {}),
  };
}

export function placeJsonLd(place: Destination, cards: number): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    name: place.name,
    description: place.description || `Postcards kept in ${place.name}.`,
    url: absoluteUrl(`/destinations/${place.slug}`),
    ...(place.coverImage ? { image: absoluteUrl(place.coverImage.src) } : {}),
    ...(place.coordinates ? { geo: { "@type": "GeoCoordinates", latitude: place.coordinates.lat, longitude: place.coordinates.lng } } : {}),
    address: { "@type": "PostalAddress", ...(place.region ? { addressRegion: place.region } : {}), addressCountry: place.country },
    ...(cards ? { photo: { "@type": "CollectionPage", name: `${cards} postcards from ${place.name}` } } : {}),
  };
}

/** A review by the author of a café: editorial, not the café's own rating. */
export function cafeJsonLd(cafe: Cafe, cards: number): Json {
  const url = absoluteUrl(`/cafes/${cafe.slug}`);
  const subject: Json = {
    "@type": "FoodEstablishment",
    name: cafe.name,
    image: absoluteUrl(cafe.coverImage.src),
    address: { "@type": "PostalAddress", ...(cafe.neighborhood ? { streetAddress: cafe.neighborhood } : {}), ...(cafe.city ? { addressLocality: cafe.city } : {}), ...(cafe.country ? { addressCountry: cafe.country } : {}) },
    ...(cafe.mapUrl ? { hasMap: cafe.mapUrl } : {}),
  };
  if (!cafe.rating) {
    return { "@context": "https://schema.org", "@type": "WebPage", name: cafe.name, url, about: subject, description: cafe.notes ?? `Postcards from ${cafe.name}.` };
  }
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    url,
    name: `${cafe.name}: my rating`,
    itemReviewed: subject,
    author: { "@id": `${siteConfig.url}/#author` },
    reviewRating: { "@type": "Rating", ratingValue: cafe.rating, bestRating: 5, worstRating: 0.5 },
    reviewBody: [cafe.ratingNote, cafe.notes].filter(Boolean).join(" "),
    ...(cards ? { associatedMedia: { "@type": "CollectionPage", name: `${cards} postcards from ${cafe.name}` } } : {}),
  };
}

export function storyJsonLd(story: Story): Json {
  const url = absoluteUrl(`/stories/${story.slug}`);
  const words = story.body.split(/\s+/).filter(Boolean).length;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: story.title,
    ...(story.subtitle ? { alternativeHeadline: story.subtitle } : {}),
    description: story.excerpt,
    url,
    mainEntityOfPage: url,
    image: absoluteUrl(story.coverImage.src),
    inLanguage: "en-GB",
    wordCount: words,
    timeRequired: `PT${story.readingTimeMinutes}M`,
    ...(story.publishedAt ? { datePublished: story.publishedAt, dateModified: story.publishedAt } : {}),
    author: { "@id": `${siteConfig.url}/#author` },
    publisher: { "@id": `${siteConfig.url}/#author` },
  };
}
