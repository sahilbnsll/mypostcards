import { StoryCard } from "./StoryCard";
import type { Story } from "@/content/types";
import styles from "./StoryFeature.module.css";

/**
 * The home page's stories: the featured one as a wide lead, with up to two more beside it. Each is
 * a cover card (see StoryCard); with one story the lead simply takes the whole row.
 */
export function StoryFeature({ stories }: { stories: Story[] }) {
  const [lead, ...rest] = stories;
  if (!lead) return null;
  const side = rest.slice(0, 2);
  return (
    <div className={styles.shelf} data-side={side.length}>
      <div className={styles.lead}>
        <StoryCard story={lead} variant="lead" />
      </div>
      {side.length > 0 && (
        <div className={styles.side}>
          {side.map((story, index) => (
            <StoryCard key={story.slug} story={story} index={index + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
