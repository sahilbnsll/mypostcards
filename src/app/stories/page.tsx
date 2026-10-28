import type { Metadata } from "next";
import { getJournal } from "@/content";
import { JsonLd } from "@/components/ui/JsonLd";
import { collectionJsonLd, pageMetadata } from "@/lib/seo";
import { StoryGrid } from "@/components/features/stories/StoryGrid";
import { StoryCard } from "@/components/features/stories/StoryCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHead } from "@/components/ui/PageHead";

export async function generateMetadata(): Promise<Metadata> {
  const { stories } = await getJournal();
  return pageMetadata({
    title: "Stories: the notes behind the photographs",
    description: `${stories.length} short stories behind the photographs: ${stories.slice(0, 3).map((s) => s.title).join(", ")}${stories.length > 3 ? " and more" : ""}.`,
    path: "/stories",
    image: stories[0]?.coverImage,
  });
}

export default async function StoriesPage() {
  const { stories } = await getJournal();

  return (
    <>
      <JsonLd data={collectionJsonLd({ name: "Stories", description: "The longer notes behind the photographs.", path: "/stories", items: stories.map((s) => ({ name: s.title, path: `/stories/${s.slug}`, image: s.coverImage.src })) })} />
      <PageHead title="Stories" lede="The longer notes behind the photographs. Not every postcard needs one." />
      <section className="wrap" aria-label="Stories">
        {stories.length > 0 ? (
          <StoryGrid>
            {stories.map((story, index) => (
              <StoryCard as="h2" key={story.slug} story={story} index={index} variant={index === 0 ? "lead" : "card"} />
            ))}
          </StoryGrid>
        ) : (
          <EmptyState title="No stories yet" body="When a postcard deserves more than a caption, the story will be here." />
        )}
      </section>
    </>
  );
}
