import type { Metadata } from "next";
import { getJournal } from "@/content";
import { StoryCard } from "@/components/features/stories/StoryCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHead } from "@/components/ui/PageHead";

export const metadata: Metadata = {
  title: "Stories",
  description: "The longer notes behind the photographs.",
  alternates: { canonical: "/stories" },
};

export default async function StoriesPage() {
  const { stories } = await getJournal();

  return (
    <>
      <PageHead title="Stories" lede="The longer notes behind the photographs. Not every postcard needs one." />
      <section className="wrap" aria-label="Stories">
        {stories.length > 0 ? (
          <div className="card-grid">
            {stories.map((story, index) => (
              <StoryCard as="h2" key={story.slug} story={story} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState title="No stories yet" body="When a postcard deserves more than a caption, the story will be here." />
        )}
      </section>
    </>
  );
}
