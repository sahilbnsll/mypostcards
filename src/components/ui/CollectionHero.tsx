import type { ReactNode } from "react";
import { reveal } from "@/lib/reveal";
import type { ImageAsset } from "@/content/types";
import { PageHead } from "./PageHead";
import { Photo } from "./Photo";
import { Stamp } from "./Stamp";
import styles from "./CollectionHero.module.css";

interface CollectionHeroProps {
  title: string;
  lede?: string;
  back: { href: string; label: string };
  cover?: ImageAsset;
  meta?: ReactNode;
  /** Something that belongs with the heading and the facts (a café's guide card). */
  aside?: ReactNode;
  /**
   * "wide": the photograph runs full width under the heading (trips, places, stories).
   * "split": the photograph is a postcard print beside the text on wide screens and under it on
   * narrow ones (cafés), so the page uses its width instead of leaving the right side empty.
   */
  variant?: "wide" | "split";
  /** A few handwritten words on the border of the print (split variant only). */
  coverNote?: string;
}

/** Header for a single trip, place, café or story: the title, a line of facts and one photograph. */
export function CollectionHero({ title, lede, back, cover, meta, aside, variant = "wide", coverNote }: CollectionHeroProps) {
  const facts = (
    <>
      {meta && <div className={styles.meta}>{meta}</div>}
      {aside && <div className={styles.aside}>{aside}</div>}
    </>
  );

  if (variant === "split" && cover) {
    return (
      <PageHead
        title={title}
        lede={lede}
        back={back}
        side={
          <figure className={styles.print} {...reveal("photo")}>
            <Photo image={cover} ratio="4 / 3" sizes="(min-width: 62rem) 42vw, 92vw" priority className={styles.printPhoto} />
            {coverNote && <figcaption className={styles.printNote}>{coverNote}</figcaption>}
            <Stamp className={styles.printStamp} tone="red" />
          </figure>
        }
      >
        {facts}
      </PageHead>
    );
  }

  return (
    <>
      <PageHead title={title} lede={lede} back={back}>
        {facts}
      </PageHead>
      {cover && (
        <div className="wrap">
          <div className={styles.cover} {...reveal("photo")}>
            <span className={styles.drift} data-drift>
              <Photo image={cover} ratio="21 / 9" sizes="(min-width: 90rem) 1400px, 100vw" priority className={styles.photo} />
            </span>
          </div>
        </div>
      )}
    </>
  );
}
