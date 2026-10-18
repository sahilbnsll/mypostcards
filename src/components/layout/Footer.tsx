import Link from "next/link";
import type { CSSProperties } from "react";
import { siteConfig } from "@/config/site";
import { getJournal, hasSampleContent } from "@/content";
import { balancedSample } from "@/content/selectors";
import { LogoMark } from "@/components/brand/LogoMark";
import { Photo } from "@/components/ui/Photo";
import { PullLamp } from "./PullLamp";
import styles from "./Footer.module.css";

const TILTS = [-2.5, 1.8, -1.2, 2.2, -1.8, 1.5, -2.1, 2.4, -1.4, 1.9, -2.0, 1.6];

export async function Footer() {
  const journal = await getJournal();
  const showSampleNote = hasSampleContent(journal);
  const mosaicCards = balancedSample(journal.postcards, 12);
  // Art and Random clicks sit among the pages, after Cafés
  const explore = [...siteConfig.navLinks.slice(0, 4), ...siteConfig.collections, ...siteConfig.navLinks.slice(4)];

  return (
    <footer className={styles.footer}>
      {/* Postcard mosaic */}
      {mosaicCards.length > 0 && (
        <div className={styles.mosaicSection}>
          <div className={`wrap ${styles.mosaicHeader}`}>
            <p className={styles.mosaicIntro}>A little mosaic of moments kept</p>
          </div>
          <div className={styles.mosaicWrap}>
            <ul role="list" className={styles.mosaicList} aria-label="Postcard thumbnail mosaic">
              {mosaicCards.map((card, i) => {
                const tilt = TILTS[i % TILTS.length];
                return (
                  <li key={card.slug} className={styles.mosaicItem}>
                    <Link
                      href={`/gallery#p=${card.slug}`}
                      className={styles.mosaicThumb}
                      style={{ "--tilt": `${tilt}deg` } as CSSProperties}
                      aria-label={`Open postcard “${card.title}”`}
                    >
                      <Photo
                        image={card.image}
                        ratio="1 / 1"
                        sizes="90px"
                        imageClassName={styles.mosaicImg}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* Airmail stripe visual divider */}
      <div className="airmail-edge" aria-hidden />

      <div className={`wrap ${styles.inner}`}>
        <div className={styles.about}>
          <div className={styles.brand}>
            <LogoMark className={styles.mark} />
            <div>
              <p className={styles.wordmark}>my postcards</p>
              <p className={styles.descriptor}>{siteConfig.descriptor}</p>
            </div>
          </div>
          <p className={styles.tagline}>{siteConfig.tagline}</p>
        </div>

        <nav aria-label="Explore pages" className={styles.links}>
          <p className={styles.colTitle}>Explore</p>
          <ul role="list">
            {explore.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.title}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.socials}>
          <p className={styles.colTitle}>Connect</p>
          <ul role="list" className={styles.socialList}>
            {siteConfig.socials.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.title} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.by}>
          <div className={styles.lampWrap}>
            <PullLamp className={styles.lamp} />
            <p className={styles.lampNote}>Pull the cord for day or night.</p>
          </div>
          <p>
            Made by{" "}
            <a href={siteConfig.author.website} className="text-link" rel="noopener">
              {siteConfig.author.name}
            </a>
            .
          </p>
          {showSampleNote && (
            <p className={styles.sample}>
              Until my own postcards are in, the photographs here are free-to-use samples from Unsplash.
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
