import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getJournal } from "@/content";
import { EMPTY_SLUG, findBySlug, relatedPostcards, staticSlugs, toViews } from "@/content/selectors";
import { PostcardBack } from "@/components/features/postcard/PostcardBack";
import { RelatedPostcards } from "@/components/features/postcard/RelatedPostcards";
import { DetailSkeleton } from "@/components/ui/DetailSkeleton";
import { PostcardMedia } from "@/components/ui/PostcardMedia";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { siteConfig } from "@/config/site";
import { formatLocation } from "@/lib/utils";
import styles from "./page.module.css";

type Params = Promise<{ slug: string }>;

// The page shell (with its skeleton) is prerendered; the content is filled in per slug.

export async function generateStaticParams() {
  return staticSlugs((await getJournal()).postcards);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const card = findBySlug((await getJournal()).postcards, slug);
  if (!card) return {};
  const where = formatLocation(card.location, ["city", "country"]);
  const description = card.caption ?? (where ? `A postcard from ${where}.` : `${card.title}, a postcard.`);
  return {
    title: card.title,
    description,
    alternates: { canonical: `/postcards/${card.slug}` },
    // The share image comes from ./opengraph-image.tsx.
    openGraph: { type: "article", title: card.title, description },
    twitter: { card: "summary_large_image", title: card.title, description },
  };
}

async function PostcardContent({ params }: { params: Params }) {
  const { slug } = await params;
  const journal = await getJournal();
  const card = slug === EMPTY_SLUG ? undefined : findBySlug(journal.postcards, slug);
  if (!card) notFound();

  const [view] = toViews(journal, [card]);
  const related = relatedPostcards(journal.postcards, card, 4);

  // Previous and next in the order the postcards are kept, wrapping around.
  const all = journal.postcards;
  const at = all.findIndex((p) => p.slug === card.slug);
  const previous = all.length > 1 ? all[(at - 1 + all.length) % all.length] : undefined;
  const next = all.length > 1 ? all[(at + 1) % all.length] : undefined;

  const where = formatLocation(card.location, ["city", "country"]);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    name: card.title,
    description: card.caption ?? card.image.alt,
    contentUrl: card.image.src.startsWith("http") ? card.image.src : `${siteConfig.url}${card.image.src}`,
    url: `${siteConfig.url}/postcards/${card.slug}`,
    width: card.image.width,
    height: card.image.height,
    ...(where ? { contentLocation: where } : {}),
    ...(card.takenOn ? { dateCreated: card.takenOn } : {}),
    creator: { "@type": "Person", name: siteConfig.author.name, url: siteConfig.author.website },
  };

  return (
    <article>
      <header className="wrap page-head">
        <Link href="/gallery" className="back-link">
          <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden>
            <path d="M13 6H1.5M6 1 1 6l5 5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          Gallery
        </Link>
      </header>

      <div className={`wrap ${styles.layout}`}>
        <div className={styles.photo}>
          <PostcardMedia card={card} sizes="(min-width: 62rem) 58vw, 100vw" priority />
        </div>

        <div className={styles.back}>
          <div className={styles.backInner}>
            <PostcardBack item={view} as="h1" variant="page" />
          </div>
          <nav className={styles.pager} aria-label="More postcards">
            {previous && (
              <Link href={`/postcards/${previous.slug}`} rel="prev">
                <span className={styles.pagerLabel}>Previous</span>
                <span>{previous.title}</span>
              </Link>
            )}
            {next && (
              <Link href={`/postcards/${next.slug}`} rel="next" className={styles.pagerNext}>
                <span className={styles.pagerLabel}>Next</span>
                <span>{next.title}</span>
              </Link>
            )}
          </nav>
          <div className="airmail-edge" aria-hidden />
        </div>
      </div>

      {related.length > 0 && (
        <section className="wrap section--tight" aria-labelledby="related-title">
          <SectionHeader id="related-title" title="More like this" />
          <RelatedPostcards postcards={related} />
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </article>
  );
}

export default function PostcardPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <PostcardContent params={params} />
    </Suspense>
  );
}
