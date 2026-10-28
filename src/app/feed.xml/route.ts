import { statSync } from "node:fs";
import { join } from "node:path";
import { siteConfig } from "@/config/site";
import { getJournal } from "@/content";
import { absoluteUrl } from "@/lib/seo";
import { formatLocation } from "@/lib/utils";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const rfc822 = (d: Date) => d.toUTCString();
const when = (iso?: string) => (iso ? new Date(`${iso}T12:00:00Z`) : new Date(0));

function fileSize(src: string): number {
  try {
    return statSync(join(process.cwd(), "public", src)).size;
  } catch {
    return 0;
  }
}

/**
 * An RSS feed of the newest stories and postcards, so people (and tools) who follow feeds hear
 * about new things: each item carries its photograph and the words from its back.
 */
export async function GET() {
  const journal = await getJournal();
  const built = new Date();

  const stories = journal.stories.map((s) => ({
    title: s.title,
    link: absoluteUrl(`/stories/${s.slug}`),
    date: when(s.publishedAt),
    text: s.excerpt,
    image: s.coverImage,
    alt: s.coverImage.alt,
    category: "Story",
  }));
  const postcards = [...journal.postcards]
    .sort((a, b) => (b.takenOn ?? "").localeCompare(a.takenOn ?? "") || b.sortOrder - a.sortOrder)
    .slice(0, 40)
    .map((p) => ({
      title: p.title,
      link: absoluteUrl(`/postcards/${p.slug}`),
      date: when(p.takenOn),
      text: [p.caption, p.note, formatLocation(p.location, ["city", "country"])].filter(Boolean).join(" "),
      image: p.image,
      alt: p.image.alt,
      category: "Postcard",
    }));
  const items = [...stories, ...postcards].sort((a, b) => b.date.getTime() - a.date.getTime());

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
<title>${esc(siteConfig.name)}</title>
<link>${siteConfig.url}</link>
<description>${esc(siteConfig.description)}</description>
<language>en-gb</language>
<managingEditor>${esc(siteConfig.author.name)}</managingEditor>
<lastBuildDate>${rfc822(built)}</lastBuildDate>
<atom:link href="${siteConfig.url}/feed.xml" rel="self" type="application/rss+xml"/>
${items
  .map(
    (item) => `<item>
<title>${esc(item.title)}</title>
<link>${item.link}</link>
<guid isPermaLink="true">${item.link}</guid>
<pubDate>${rfc822(item.date)}</pubDate>
<category>${item.category}</category>
<description>${esc(item.text)}</description>
<content:encoded><![CDATA[<p><img src="${absoluteUrl(item.image.src)}" alt="${esc(item.alt)}" width="${item.image.width}" height="${item.image.height}"></p><p>${esc(item.text)}</p>]]></content:encoded>
<enclosure url="${absoluteUrl(item.image.src)}" length="${fileSize(item.image.src)}" type="image/jpeg"/>
</item>`,
  )
  .join("\n")}
</channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600" } });
}
