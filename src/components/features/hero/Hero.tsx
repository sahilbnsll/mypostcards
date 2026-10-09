import Link from "next/link";
import type { CSSProperties } from "react";
import { siteConfig } from "@/config/site";
import type { Postcard } from "@/content/types";
import { Photo } from "@/components/ui/Photo";
import { Postmark, Stamp } from "@/components/ui/Stamp";
import { plural } from "@/lib/utils";
import styles from "./Hero.module.css";

/**
 * Where each postcard lands on the table. Every slot crops its photo to a fixed ratio, so the
 * composition is art-directed whatever the photographs are. Values are percentages of the table.
 */
const SLOTS = [
  { left: 4, top: 12, width: 41, ratio: "4 / 5", rotate: -5, sizes: "(min-width: 62rem) 26vw, 44vw", mark: false },
  { left: 40, top: 0, width: 46, ratio: "4 / 3", rotate: 3, sizes: "(min-width: 62rem) 30vw, 48vw", mark: "stamp" },
  { left: 55, top: 38, width: 33, ratio: "1 / 1", rotate: -2, sizes: "(min-width: 62rem) 22vw, 36vw", mark: false },
  { left: 22, top: 52, width: 31, ratio: "3 / 4", rotate: 6, sizes: "(min-width: 62rem) 20vw, 34vw", mark: "postmark" },
  { left: 71, top: 66, width: 26, ratio: "4 / 3", rotate: -7, sizes: "(min-width: 62rem) 18vw, 30vw", mark: false },
] as const;

interface HeroProps {
  cards: Postcard[];
  totalPostcards: number;
  totalPlaces: number;
}

export function Hero({ cards, totalPostcards, totalPlaces }: HeroProps) {
  const dealt = cards.slice(0, SLOTS.length);

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={`wrap ${styles.grid}`}>
        <div className={styles.intro}>
          <p className={styles.lede}>{siteConfig.tagline}</p>
          <p className={styles.counts}>
            {plural(totalPostcards, "postcard")} from {plural(totalPlaces, "place")}, and counting.
          </p>
          <a href="#collection" className={styles.cue}>
            <span>See the collection</span>
            <svg width="14" height="18" viewBox="0 0 14 18" fill="none" aria-hidden>
              <path d="M7 1v15M1.5 10.5 7 16l5.5-5.5" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </a>
        </div>

        {dealt.length > 0 ? (
          <div className={styles.table}>
            <ul role="list" className={styles.deck}>
              {dealt.map((card, index) => {
                const slot = SLOTS[index];
                return (
                  <li
                    key={card.slug}
                    className={styles.slot}
                    style={
                      {
                        "--l": `${slot.left}%`,
                        "--t": `${slot.top}%`,
                        "--w": `${slot.width}%`,
                        "--r": `${slot.rotate}deg`,
                        "--k": index,
                      } as CSSProperties
                    }
                  >
                    <Link href={`/gallery#p=${card.slug}`} className={styles.card} aria-label={`Open “${card.title}”`}>
                      <Photo image={card.image} ratio={slot.ratio} sizes={slot.sizes} priority={index === 0} />
                      {slot.mark === "stamp" && <Stamp className={styles.stamp} tone="red" />}
                      {slot.mark === "postmark" && <Postmark className={styles.postmark} top="my postcards" date="kept" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <p className={styles.empty}>The first postcards are on their way.</p>
        )}

        <h1 id="hero-title" className={styles.title}>
          <span className={styles.titleLine}>my</span> <span className={styles.titleLine}>postcards</span>
        </h1>
      </div>
      <div className={`airmail-edge ${styles.edge}`} aria-hidden />
    </section>
  );
}
