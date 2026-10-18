import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { siteConfig } from "@/config/site";
import { getJournal, hasSampleContent } from "@/content";
import { featuredFirst } from "@/content/selectors";
import { CATEGORIES } from "@/content/categories";
import { PhotoSpread } from "@/components/features/spread/PhotoSpread";
import { Seal } from "@/components/brand/Seal";
import { Photo } from "@/components/ui/Photo";
import { Prose } from "@/components/ui/Prose";
import { PageHead } from "@/components/ui/PageHead";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { plural } from "@/lib/utils";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About",
  description: "What My Postcards is, how it is organised, and who keeps it.",
  alternates: { canonical: "/about" },
};

const INTRO = `${siteConfig.tagline}

My Postcards is a personal photo journal. It collects photographs from trips, café afternoons, city streets and good meals, and keeps them the way a drawer of postcards keeps a place: a picture on the front, a few words on the back.`;

export default async function AboutPage() {
  const journal = await getJournal();
  const { postcards, trips, destinations, cafes, stories } = journal;
  const spread = featuredFirst(postcards).slice(0, 5);
  const sample = hasSampleContent(journal);
  const visited = destinations.filter((d) => d.status === "visited");

  // How the journal is organised: each part with what it holds right now and where to find it
  const parts = [
    { href: "/gallery", title: "Postcards", line: "Every photograph, with a caption and a note on the back.", count: plural(postcards.length, "postcard"), image: postcards[0]?.image },
    { href: "/trips", title: "Trips", line: "Postcards grouped around a journey, with a day-by-day plan and a map.", count: plural(trips.length, "trip"), image: trips[0]?.coverImage },
    { href: "/destinations", title: "Places", line: "Where the postcards were sent from, on a globe and a map.", count: plural(visited.length, "place"), image: visited[0]?.coverImage },
    { href: "/cafes", title: "Cafés", line: "Quiet corners, good light and the usual order.", count: plural(cafes.length, "café"), image: cafes[0]?.coverImage },
    { href: "/stories", title: "Stories", line: "The longer notes behind the ones that deserve more than a line.", count: plural(stories.length, "story", "stories"), image: stories[0]?.coverImage },
  ].filter((part) => part.image);

  return (
    <>
      <PageHead title="About" />
      <section className={`wrap ${styles.about}`} aria-label="About">
        <Seal className={styles.seal} />
        <div>
          <Prose text={INTRO} />
          <p className={styles.kept}>
            Kept by{" "}
            <a href={siteConfig.author.website} className="text-link" rel="noopener">
              {siteConfig.author.name}
            </a>
            .
          </p>
        </div>
      </section>

      <section className="wrap section--tight" aria-labelledby="organised">
        <SectionHeader id="organised" title="How it is organised" intro="Every photograph is a postcard. Each part below collects them a different way." />
        <ul role="list" className={styles.parts} style={{ "--n": Math.min(parts.length, 5) } as CSSProperties}>
          {parts.map((part) => (
            <li key={part.href}>
              <Link href={part.href} className={styles.part}>
                <span className={styles.thumb}>{part.image && <Photo image={part.image} ratio="4 / 3" sizes="(min-width: 62rem) 20vw, (min-width: 40rem) 30vw, 90vw" decorative />}</span>
                <span className={styles.partTitle}>{part.title}</span>
                <span className={styles.partCount}>{part.count}</span>
                <span className={styles.partLine}>{part.line}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className={styles.kinds}>
          Each postcard also has a kind: {CATEGORIES.map((c) => c.label.toLowerCase()).join(", ")}.
        </p>
      </section>

      <section className="wrap section--tight" aria-labelledby="right-now">
        <SectionHeader id="right-now" title="Right now" />
        <Prose
          text={`The journal holds ${plural(postcards.length, "postcard")} from ${plural(visited.length, "place")}, ${plural(trips.length, "trip")}, ${plural(cafes.length, "café")} and ${plural(stories.length, "story", "stories")}, and it is still growing.${sample ? " Until my own postcards are in, some of the photographs here are free-to-use samples." : " Every photograph here is mine."}`}
        />
      </section>

      {spread.length > 0 && (
        <section className="wrap section--tight" aria-labelledby="spread-title">
          <h2 id="spread-title" className="visually-hidden">
            A few postcards
          </h2>
          <PhotoSpread postcards={spread} id="about-spread" />
          <p className={styles.open}>
            <Link href="/gallery" className="text-link">
              Open the gallery
            </Link>
          </p>
        </section>
      )}
    </>
  );
}
