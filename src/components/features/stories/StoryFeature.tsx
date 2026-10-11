import Link from "next/link";
import { reveal } from "@/lib/reveal";
import { Photo } from "@/components/ui/Photo";
import type { Story } from "@/content/types";
import { formatDate } from "@/lib/utils";
import styles from "./StoryFeature.module.css";

/** One story, given room: a tall photograph that drifts slightly as it scrolls, and the start of the text. */
export function StoryFeature({ story }: { story: Story }) {
  return (
    <article className={styles.feature}>
      <Link href={`/stories/${story.slug}`} className={styles.media} aria-hidden tabIndex={-1} {...reveal("photo")}>
        <span className={styles.drift} data-drift>
          <Photo image={story.coverImage} ratio="4 / 5" sizes="(min-width: 62rem) 42vw, 100vw" />
        </span>
      </Link>
      <div className={styles.text} {...reveal("text")}>
        <h3 className={styles.title}>
          <Link href={`/stories/${story.slug}`}>{story.title}</Link>
        </h3>
        {story.subtitle && <p className={styles.subtitle}>{story.subtitle}</p>}
        <p className={styles.excerpt}>{story.excerpt}</p>
        <p className={styles.meta}>
          {[story.publishedAt ? formatDate(story.publishedAt) : undefined, `${story.readingTimeMinutes ?? 3} min read`]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <Link href={`/stories/${story.slug}`} className={`text-link ${styles.more}`}>
          Read the story
        </Link>
      </div>
    </article>
  );
}
