import type { Metadata } from "next";
import { getVisitorWall } from "@/content/visitors";
import { CardComposer } from "@/components/features/visitors/CardComposer";
import { VisitorWall } from "@/components/features/visitors/VisitorWall";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHead } from "@/components/ui/PageHead";
import { SectionHeader } from "@/components/ui/SectionHeader";

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
        lede="Leave a card: a hello, a thought, a place I should go. Write it, draw it, or both. It joins the wall once I have had a look."
      />

      <section className="wrap" aria-labelledby="leave-a-card">
        <h2 id="leave-a-card" className="visually-hidden">
          Leave a card
        </h2>
        {wall.status === "closed" && (
          <p className="visitors-note" role="note">
            The guest desk is still being set up, so cards can not be sent just yet. You can already try the pen.
          </p>
        )}
        <CardComposer />
      </section>

      <section className="wrap section--tight" aria-labelledby="on-the-wall">
        <SectionHeader id="on-the-wall" title="On the wall" intro="Cards from people who stopped by." />
        {wall.cards.length > 0 ? (
          <VisitorWall cards={wall.cards} />
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
