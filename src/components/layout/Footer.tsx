import Link from "next/link";
import { siteConfig } from "@/config/site";
import { getJournal, hasSampleContent } from "@/content";
import styles from "./Footer.module.css";

export async function Footer() {
  const journal = await getJournal();
  const showSampleNote = hasSampleContent(journal);

  return (
    <footer className={styles.footer}>
      <div className="airmail-edge" aria-hidden />
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.about}>
          <p className={styles.wordmark}>my postcards</p>
          <p className={styles.tagline}>{siteConfig.tagline}</p>
        </div>

        <nav aria-label="Footer" className={styles.links}>
          <ul role="list">
            {siteConfig.navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.title}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.by}>
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
