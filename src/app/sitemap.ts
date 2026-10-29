import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getJournal } from "@/content";
import { absoluteUrl } from "@/lib/seo";

/**
 * Next writes a video's title and description into the XML as they are, so a plain "&" (as in
 * "Skyhouse Bar & Kitchen") makes the whole sitemap invalid and Google refuses to read it. Escape
 * them here, and keep them within the limits the video sitemap allows (100 and 2048 characters).
 */
const xml = (text: string, max: number): string =>
  text
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/**
 * Every public page, with the photographs and clips on it, so image and video search can find
 * them. Dates come from the content itself (when a photograph was taken, when a story was
 * published), not from the build, so an unchanged page does not look new every deploy.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const journal = await getJournal();
  const at = (path: string) => `${siteConfig.url}${path}`;
  const built = new Date();
  const when = (iso?: string) => (iso ? new Date(`${iso}T00:00:00Z`) : built);

  return [
    { url: at("/"), lastModified: built, changeFrequency: "weekly", priority: 1 },
    ...["/gallery", "/trips", "/destinations", "/cafes", "/art", "/random-clicks", "/stories", "/visitors", "/about"].map((path) => ({
      url: at(path),
      lastModified: built,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...journal.postcards.map((p) => ({
      url: at(`/postcards/${p.slug}`),
      lastModified: when(p.takenOn),
      changeFrequency: "yearly" as const,
      priority: 0.5,
      images: [absoluteUrl(p.image.src)],
      ...(p.video
        ? {
            videos: [
              {
                title: xml(p.title, 100),
                thumbnail_loc: absoluteUrl(p.image.src),
                description: xml(`${p.caption ?? p.image.alt}${p.video.sound ? " (with sound)" : ""}`, 2048),
                content_loc: absoluteUrl(p.video.src),
                family_friendly: "yes" as const,
              },
            ],
          }
        : {}),
    })),
    ...journal.trips.map((t) => ({ url: at(`/trips/${t.slug}`), lastModified: when(t.endDate), changeFrequency: "monthly" as const, priority: 0.7, images: [absoluteUrl(t.coverImage.src)] })),
    ...journal.destinations.map((d) => ({ url: at(`/destinations/${d.slug}`), lastModified: built, changeFrequency: "monthly" as const, priority: 0.6, ...(d.coverImage ? { images: [absoluteUrl(d.coverImage.src)] } : {}) })),
    ...journal.cafes.map((c) => ({ url: at(`/cafes/${c.slug}`), lastModified: built, changeFrequency: "monthly" as const, priority: 0.5, images: [absoluteUrl(c.coverImage.src)] })),
    ...journal.stories.map((s) => ({ url: at(`/stories/${s.slug}`), lastModified: when(s.publishedAt), changeFrequency: "yearly" as const, priority: 0.6, images: [absoluteUrl(s.coverImage.src)] })),
  ];
}
