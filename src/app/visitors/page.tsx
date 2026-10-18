import type { Metadata } from "next";
import { getVisitorWall } from "@/content/visitors";
import { CardComposer } from "@/components/features/visitors/CardComposer";
import { VisitorBoard } from "@/components/features/visitors/VisitorBoard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHead } from "@/components/ui/PageHead";
import { SectionHeader } from "@/components/ui/SectionHeader";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Visitors",
  description: "Leave a card: a thought, a suggestion, a place worth visiting. Write it or draw it.",
  alternates: { canonical: "/visitors" },
};

export default async function VisitorsPage() {
  const wall = await getVisitorWall();

  return (
    <>
      <PageHead
        title="Visitors"
        lede="Leave a card: a hello, a thought, a place I should go. Write it, draw it, or both. It goes up on the wall right away."
      />

      <section className="wrap" aria-labelledby="leave-a-card">
        <h2 id="leave-a-card" className="visually-hidden">
          Leave a card
        </h2>
        {wall.status === "closed" && (
          <p className="visitors-note" role="note">
            {process.env.NODE_ENV === "development"
              ? "Local setup: put SUPABASE_URL and SUPABASE_ANON_KEY in .env.local (the file is already in the project folder), then stop and restart npm run dev. Until then cards can not be sent."
              : "The guest desk is still being set up, so cards can not be sent just yet. You can already try the pen."}
          </p>
        )}
        <div className={styles.desk}>
          <CardComposer />
          <aside className={styles.aside} aria-label="How the guest desk works">
            <h2 className={styles.asideTitle}>How the desk works</h2>
            <ul role="list" className={styles.points}>
              <li>Write it, draw it, or do both on the same card.</li>
              <li>A name is optional. Leave it out and the card says a visitor.</li>
              <li>It goes up on the wall right away.</li>
            </ul>
            <a href="#on-the-wall" className={`text-link ${styles.jump}`}>
              {wall.cards.length > 0 ? `See the ${wall.cards.length} cards on the wall` : "Jump to the wall"}
            </a>
          </aside>
        </div>
      </section>

      <section className="wrap section--tight" aria-labelledby="on-the-wall">
        <SectionHeader
          id="on-the-wall"
          title="On the wall"
          intro="Cards from people who stopped by."
          badge={wall.cards.length > 0 ? `${wall.cards.length} cards on the wall` : undefined}
        />
        {wall.cards.length > 0 ? (
          <VisitorBoard cards={wall.cards} />
        ) : (
          <EmptyState
            title={wall.status === "unavailable" ? "The wall could not be loaded" : "The wall is empty"}
            body={wall.status === "unavailable" ? "Please try again in a little while." : "Be the first to leave a card."}
          />
        )}
      </section>
    </>
  );
}
