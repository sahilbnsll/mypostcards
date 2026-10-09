import Link from "next/link";
import { reveal } from "@/lib/reveal";
import { Photo } from "@/components/ui/Photo";
import type { Story } from "@/content/types";
import { formatDate, plural } from "@/lib/utils";
import styles from "./StoryCard.module.css";

export function StoryCard({ story, index = 0, as: Heading = "h3" }: { story: Story; index?: number; as?: "h2" | "h3" }) {
  return (
    <article className={styles.card} {...reveal("text", index)}>
      <Link href={`/stories/${story.slug}`} className={styles.media} tabIndex={-1} aria-hidden>
        <Photo image={story.coverImage} ratio="3 / 2" sizes="(min-width: 62rem) 30vw, (min-width: 40rem) 45vw, 100vw" imageClassName={styles.img} />
      </Link>
      <Heading className={styles.title}>
        <Link href={`/stories/${story.slug}`}>{story.title}</Link>
      </Heading>
      <p className={styles.excerpt}>{story.excerpt}</p>
      <p className={styles.meta}>
        {[story.publishedAt ? formatDate(story.publishedAt) : undefined, `${plural(story.readingTimeMinutes, "minute")} to read`]
          .filter(Boolean)
          .join(", ")}
      </p>
    </article>
  );
}
