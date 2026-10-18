import Link from "next/link";
import type { CSSProperties } from "react";
import { Photo } from "@/components/ui/Photo";
import type { ImageAsset } from "@/content/types";
import { cn } from "@/lib/utils";
import styles from "./PostcardFolder.module.css";

interface PostcardFolderProps {
  href: string;
  title: string;
  summary?: string;
  /** The folder's back panel. */
  cover: ImageAsset;
  /** Up to three photographs tucked inside; they rise and fan out when the folder is touched. */
  prints?: ImageAsset[];
  /** "27 postcards" and the like, printed on the tab. */
  tab?: string;
  /** One quiet line under the title (dates, place). */
  meta?: string;
  className?: string;
}

/** Resting and open pose of each print slot: rotation (deg), sideways shift (%) and rise (%). */
const POSES = [
  { rest: [-2, 0, 16], open: [-1.5, 0, -44] },
  { rest: [-9, -26, 24], open: [-12, -34, -30] },
  { rest: [8, 26, 24], open: [11, 34, -30] },
] as const;

/**
 * A trip as a card folder, adapted from the glass-folder reference. Three layers: the cover as the
 * back panel, a few of the trip's prints tucked inside, and a frosted-glass front that carries the
 * title. Point at it (or tab to it) and the front tips forward while the prints rise and fan. It is
 * one link and pure CSS: no scripts, and with reduced motion the folder simply stays put.
 */
export function PostcardFolder({ href, title, summary, cover, prints = [], tab, meta, className }: PostcardFolderProps) {
  const inside = prints.slice(0, 3);
  // One print goes in the middle; two take the outer slots; three fill all of them
  const slots = inside.length === 2 ? [1, 2] : inside.map((_, i) => i);
  return (
    <Link href={href} className={cn(styles.folder, className)}>
      <span className={styles.stage}>
        {tab && <span className={styles.tab}>{tab}</span>}
        <span className={styles.back}>
          <Photo
            image={cover}
            ratio="4 / 5"
            sizes="(min-width: 62rem) 30vw, (min-width: 40rem) 50vw, 100vw"
            className={styles.cover}
            imageClassName={styles.coverImg}
            decorative
          />
        </span>

        <span className={styles.prints} aria-hidden>
          {inside.map((image, i) => {
            const pose = POSES[slots[i]];
            return (
              <span
                key={image.src}
                className={styles.print}
                style={
                  {
                    "--r0": `${pose.rest[0]}deg`,
                    "--x0": `${pose.rest[1]}%`,
                    "--y0": `${pose.rest[2]}%`,
                    "--r1": `${pose.open[0]}deg`,
                    "--x1": `${pose.open[1]}%`,
                    "--y1": `${pose.open[2]}%`,
                    "--z": slots[i] === 0 ? 3 : 2,
                  } as CSSProperties
                }
              >
                <Photo image={image} ratio="4 / 5" sizes="(min-width: 62rem) 14vw, 24vw" decorative />
              </span>
            );
          })}
        </span>

        <span className={styles.front}>
          <span className={styles.lip} aria-hidden />
          <span className={styles.title}>{title}</span>
          {summary && <span className={styles.summary}>{summary}</span>}
          {meta && <span className={styles.meta}>{meta}</span>}
        </span>
      </span>
    </Link>
  );
}
