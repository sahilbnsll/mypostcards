import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { getJournal } from "@/content";
import { featuredFirst } from "@/content/selectors";
import { PhotoSpread } from "@/components/features/spread/PhotoSpread";
import { Prose } from "@/components/ui/Prose";
import { PageHead } from "@/components/ui/PageHead";

export const metadata: Metadata = {
  title: "About",
  description: "What My Postcards is, how it is organised, and who keeps it.",
  alternates: { canonical: "/about" },
};

const ABOUT = `${siteConfig.tagline}

My Postcards is a personal photo journal. It collects photographs from trips, café afternoons, city streets and good meals, and keeps them the way a drawer of postcards keeps a place: a picture on the front, a few words on the back.

## How it is organised

Every photograph is a postcard with a short caption, a place and a kind: travel, city, café, food or getaway. Postcards are grouped into trips, filed under places, and the ones that deserve more than a line get a story.

## Right now

The collection is being built. Until my own postcards are in, the photographs on the site are free-to-use samples from Unsplash, marked as samples wherever they appear.`;

export default async function AboutPage() {
  const { postcards } = await getJournal();
  const spread = featuredFirst(postcards).slice(0, 5);

  return (
    <>
      <PageHead title="About" />
      <section className="wrap" aria-label="About">
        <Prose text={ABOUT} />
        <p style={{ marginTop: "var(--s-6)" }}>
          Kept by{" "}
          <a href={siteConfig.author.website} className="text-link" rel="noopener">
            {siteConfig.author.name}
          </a>
          . Start with the{" "}
          <Link href="/gallery" className="text-link">
            gallery
          </Link>
          .
        </p>
      </section>

      {spread.length > 0 && (
        <section className="wrap section--tight" aria-labelledby="spread-title">
          <h2 id="spread-title" className="visually-hidden">
            A few postcards
          </h2>
          <PhotoSpread postcards={spread} id="about-spread" />
          <p style={{ marginTop: "var(--s-5)", textAlign: "center" }}>
            <Link href="/gallery" className="text-link">
              Open the gallery
            </Link>
          </p>
        </section>
      )}
    </>
  );
}
