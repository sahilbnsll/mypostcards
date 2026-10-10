import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/brand/LogoMark";
import { LostPostcard } from "@/components/features/not-found/LostPostcard";
import { getJournal } from "@/content";
import { featuredFirst } from "@/content/selectors";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default async function NotFound() {
  const { postcards } = await getJournal();
  // A wide photograph suits the print; featured ones come first
  const postcard = featuredFirst(postcards).find((p) => p.image.width > p.image.height);

  return (
    <div className={`wrap ${styles.page}`}>
      {postcard ? <LostPostcard postcard={postcard} /> : <LogoMark label="My Postcards" className={styles.mark} />}

      <div className={styles.text}>
        <h1 className={styles.title}>Lost in the post</h1>
        <p className={styles.lede}>
          <span className={styles.code}>Error 404.</span> That page was not delivered. It may have moved, or it was never
          sent. Here is a postcard that did arrive.
        </p>

        <div className={styles.actions}>
          <Link href="/" className={styles.primary}>
            Back to the start
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden>
              <path d="M1 6h13.5M9.5 1 14.5 6l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link href="/gallery" className="text-link">
            Browse the gallery
          </Link>
        </div>

        <p className={styles.hint}>
          Or press <kbd className={styles.key}>/</kbd> to search for it.
        </p>
      </div>
    </div>
  );
}
