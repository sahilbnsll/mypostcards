import { getJournal } from "@/content";
import { EMPTY_SLUG, findBySlug, staticSlugs } from "@/content/selectors";
import { ogCard, photoDataUri } from "@/lib/og";
import { formatDate } from "@/lib/utils";

export const alt = "A story from My Postcards";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  return staticSlugs((await getJournal()).stories);
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journal = await getJournal();
  const story = slug === EMPTY_SLUG ? undefined : findBySlug(journal.stories, slug);
  const photo = story ? await photoDataUri(story.coverImage.src) : null;
  return ogCard({
    kind: "Story",
    title: story?.title ?? "Stories",
    line: [story?.publishedAt ? formatDate(story.publishedAt) : undefined, story ? `${story.readingTimeMinutes} min read` : undefined].filter(Boolean).join(" · "),
    photo,
    ratio: story ? story.coverImage.width / story.coverImage.height : 1,
  });
}
