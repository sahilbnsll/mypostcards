import type { ReactNode } from "react";
import { reveal } from "@/lib/reveal";
import type { ImageAsset } from "@/content/types";
import { PageHead } from "./PageHead";
import { Photo } from "./Photo";
import styles from "./CollectionHero.module.css";

interface CollectionHeroProps {
  title: string;
  lede?: string;
  back: { href: string; label: string };
  cover: ImageAsset;
  meta?: ReactNode;
}

/** Header for a single trip, place, café or story: the title, a line of facts and one wide photograph. */
export function CollectionHero({ title, lede, back, cover, meta }: CollectionHeroProps) {
  return (
    <>
      <PageHead title={title} lede={lede} back={back}>
        {meta && <div className={styles.meta}>{meta}</div>}
      </PageHead>
      <div className="wrap">
        <div className={styles.cover} {...reveal("photo")}>
          <span className={styles.drift} data-drift>
            <Photo image={cover} ratio="21 / 9" sizes="(min-width: 90rem) 1400px, 100vw" priority className={styles.photo} />
          </span>
        </div>
      </div>
    </>
  );
}
