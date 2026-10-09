import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getJournal } from "@/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const journal = await getJournal();
  const at = (path: string) => `${siteConfig.url}${path}`;

  return [
    { url: at("/"), changeFrequency: "weekly", priority: 1 },
    ...["/gallery", "/trips", "/destinations", "/cafes", "/stories", "/about"].map((path) => ({
      url: at(path),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...journal.trips.map((t) => ({ url: at(`/trips/${t.slug}`), priority: 0.6 })),
    ...journal.destinations.map((d) => ({ url: at(`/destinations/${d.slug}`), priority: 0.6 })),
    ...journal.cafes.map((c) => ({ url: at(`/cafes/${c.slug}`), priority: 0.5 })),
    ...journal.stories.map((s) => ({ url: at(`/stories/${s.slug}`), priority: 0.6 })),
  ];
}
