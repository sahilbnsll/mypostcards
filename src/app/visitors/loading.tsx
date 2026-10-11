import { PageHead } from "@/components/ui/PageHead";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { VisitorWallSkeleton } from "@/components/features/visitors/VisitorWall";

export default function VisitorsLoading() {
  return (
    <>
      <PageHead
        title="Visitors"
        lede="Leave a card: a hello, a thought, a place I should go. Write it, draw it, or both. It goes up on the wall right away."
      />

      <section className="wrap section--tight" aria-labelledby="loading-wall">
        <SectionHeader
          id="loading-wall"
          title="On the wall"
          intro="Gathering cards from the guest desk..."
        />
        <VisitorWallSkeleton count={6} />
      </section>
    </>
  );
}
