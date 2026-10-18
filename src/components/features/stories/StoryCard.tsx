import Link from "next/link";
import { reveal } from "@/lib/reveal";
import { Photo } from "@/components/ui/Photo";
import type { Story } from "@/content/types";
import { formatDate } from "@/lib/utils";
import styles from "./StoryCard.module.css";

interface StoryCardProps {
  story: Story;
  index?: number;
  as?: "h2" | "h3";
  /** "lead" is the wide one: its excerpt is always showing. */
  variant?: "card" | "lead";
}

/**
 * A story as a cover: the photograph fills the card, a navy scrim carries the title, and a small
 * read-time postmark sits in the corner (the hover-reveal travel card from the design reference,
 * rewritten for paper and ink). On a mouse the excerpt slides up when you point at the card or tab
 * to it; on touch screens, and on the lead card, it is simply there.
 */
export function StoryCard({ story, index = 0, as: Heading = "h3", variant = "card" }: StoryCardProps) {
  const readTime = story.readingTimeMinutes ?? 3;
  return (
    <article className={styles.card} data-variant={variant} {...reveal("text", index)}>
      <Photo
        image={story.coverImage}
        sizes={variant === "lead" ? "(min-width: 62rem) 60vw, 100vw" : "(min-width: 62rem) 30vw, (min-width: 40rem) 45vw, 100vw"}
        className={styles.photo}
        imageClassName={styles.img}
        decorative
      />
      <span className={styles.scrim} aria-hidden />
      <span className={styles.postmark} aria-hidden>
        <span className={styles.minutes}>{readTime}</span>
        <span className={styles.min}>min</span>
      </span>

      <div className={styles.body}>
        {story.publishedAt && <p className={styles.when}>{formatDate(story.publishedAt)}</p>}
        <Heading className={styles.title}>
          <Link href={`/stories/${story.slug}`} className={styles.link}>
            {story.title}
          </Link>
        </Heading>
        <div className={styles.more}>
          <div className={styles.moreInner}>
            {story.subtitle && <p className={styles.subtitle}>{story.subtitle}</p>}
            <p className={styles.excerpt}>{story.excerpt}</p>
            <p className={styles.read} aria-hidden>
              Read the story
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
