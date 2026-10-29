import { Suspense } from "react";
import { getJournal } from "@/content";
import { getVisitorWall } from "@/content/visitors";
import {
  balancedSample,
  featuredFirst,
  postcardCount,
  toViews,
  tripPrints,
} from "@/content/selectors";
import { Hero } from "@/components/features/hero/Hero";
import { StatsBar } from "@/components/features/hero/StatsBar";
import { PrintCarousel } from "@/components/features/carousel/PrintCarousel";
import { BloomGallery } from "@/components/features/gallery/BloomGallery";
import { TripCards } from "@/components/features/trips/TripCards";
import { ChapterRail } from "@/components/features/hero/ChapterRail";
import { ZoomGallery } from "@/components/features/zoom/ZoomGallery";
import { PlacesExplorer } from "@/components/features/places/PlacesExplorer";
import { StoryFeature } from "@/components/features/stories/StoryFeature";
import { VisitorWall, VisitorWallSkeleton } from "@/components/features/visitors/VisitorWall";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ViewAllButton } from "@/components/ui/ViewAllButton";

const GALLERY_PREVIEW = 8;
const CAROUSEL_COUNT = 10;
const VISITOR_PREVIEW = 6;

/** The home page's sections, in order, for the index down the edge of the screen. */
const CHAPTERS = [
  { id: "lately", label: "Pinned" },
  { id: "look-closer", label: "Look closer" },
  { id: "collection", label: "Collection" },
  { id: "trips", label: "Trips" },
  { id: "stories", label: "Stories" },
  { id: "visitors", label: "Visitors" },
  { id: "places", label: "Places" },
];

async function HomeVisitorSection() {
  const wall = await getVisitorWall(VISITOR_PREVIEW + 1);
  const hasMoreVisitors = wall.cards.length > VISITOR_PREVIEW;
  const previewCards = wall.cards.slice(0, VISITOR_PREVIEW);

  return (
    <section id="visitors" className="section" aria-labelledby="visitors-title">
      <div className="wrap">
        <SectionHeader
          id="visitors-title"
          title="From visitors"
          intro={previewCards.length > 0 ? "Cards left on the guest desk." : "A hello, a thought, a place I should go. Write it or draw it."}
          badge={wall.cards.length > 0 ? `${wall.cards.length} cards on the wall` : undefined}
          action={hasMoreVisitors
            ? { href: "/visitors", label: "See all cards" }
            : { href: "/visitors", label: "Leave a card" }
          }
        />
        {previewCards.length > 0 && (
          <VisitorWall cards={previewCards} scattered />
        )}
      </div>
    </section>
  );
}

function HomeVisitorFallback() {
  return (
    <section id="visitors" className="section" aria-labelledby="visitors-title">
      <div className="wrap">
        <SectionHeader
          id="visitors-title"
          title="From visitors"
          intro="Cards left on the guest desk."
          badge="Gathering cards..."
          action={{ href: "/visitors", label: "Leave a card" }}
        />
        <VisitorWallSkeleton count={VISITOR_PREVIEW} scattered />
      </div>
    </section>
  );
}

export default async function HomePage() {
  const journal = await getJournal();
  const { postcards, trips, destinations, stories } = journal;

  const heroCards = featuredFirst(postcards).slice(0, 5);
  // The line of prints: the ones I pinned, in the order I gave them; the newest ones until some are pinned
  const pinnedCards = postcards
    .filter((p) => p.pinned !== undefined)
    .sort((a, b) => (a.pinned ?? 0) - (b.pinned ?? 0))
    .slice(0, CAROUSEL_COUNT);
  const hasPinned = pinnedCards.length >= 3;
  const recent = toViews(journal, hasPinned ? pinnedCards : postcards.slice(0, CAROUSEL_COUNT));
  const zoomCards = featuredFirst(postcards).slice(5, 12);
  // The collection preview skips anything already shown higher up, so each part of the page has its own photographs
  const shownAbove = new Set([...heroCards, ...recent, ...zoomCards].map((p) => p.slug));
  const preview = toViews(journal, balancedSample(postcards.filter((p) => !shownAbove.has(p.slug)), GALLERY_PREVIEW));
  const featuredTrips = featuredFirst(trips).slice(0, 3);
  const featuredStories = featuredFirst(stories).slice(0, 3);

  const tripCounts = Object.fromEntries(trips.map((t) => [t.slug, postcardCount(journal, "tripSlug", t.slug)]));

  return (
    <>
      {postcards.length > 0 && <ChapterRail chapters={CHAPTERS} />}
      <Hero cards={heroCards} totalPostcards={postcards.length} totalPlaces={destinations.length} />
      <StatsBar
        totalPostcards={postcards.length}
        totalPlaces={destinations.length}
        totalTrips={trips.length}
        totalStories={stories.length}
      />

      {postcards.length === 0 ? (
        <section className="wrap section" aria-labelledby="empty-title">
          <EmptyState
            title="No postcards yet"
            body="The first postcards are on their way. Add one in content/postcards.json (the guide is in content/README.md) and it will appear here."
          />
        </section>
      ) : (
        <>
          {recent.length >= 3 && (
            <section id="lately" className="section" aria-labelledby="lately-title">
              <div className="wrap">
                <SectionHeader
                  id="lately-title"
                  title={hasPinned ? "Pinned up" : "Pinned up lately"}
                  intro={hasPinned ? "My favourites, hung on the line. Drag, scroll or use the arrows." : "The newest prints on the line. Drag, scroll or use the arrows."}
                />
              </div>
              <Suspense fallback={null}>
                <PrintCarousel items={recent} label={hasPinned ? "Pinned postcards" : "Recent postcards"} />
              </Suspense>
            </section>
          )}

          {zoomCards.length === 7 && (
            <section id="look-closer" aria-labelledby="zoom-title">
              <div className="wrap section-top">
                <SectionHeader id="zoom-title" title="Look closer" intro="Seven photographs from the collection." />
              </div>
              <Suspense fallback={null}>
                <ZoomGallery postcards={zoomCards} />
              </Suspense>
            </section>
          )}

          <section id="collection" className="section defer" aria-labelledby="collection-title">
            <div className="wrap">
              <SectionHeader
                id="collection-title"
                title="The collection"
                intro="A few favourites from every kind of postcard and every place I have been."
              />
              {/* Interactive islands below the first screen hydrate as their own low-priority tasks */}
              <Suspense fallback={null}>
                <BloomGallery items={preview} filterable={false} />
              </Suspense>
              {postcards.length > preview.length && (
                <ViewAllButton href="/gallery">View all {postcards.length} postcards</ViewAllButton>
              )}
            </div>
          </section>

          {featuredTrips.length > 0 && (
            <section id="trips" className="section defer" aria-labelledby="trips-title">
              <div className="wrap">
                <SectionHeader
                  id="trips-title"
                  title="Trips and collections"
                  intro="Photographs grouped around a journey, a place or a weekend."
                  action={{ href: "/trips", label: "All trips" }}
                />
                <TripCards trips={featuredTrips} counts={tripCounts} prints={tripPrints(journal, featuredTrips)} />
              </div>
            </section>
          )}

          {featuredStories.length > 0 && (
            <section id="stories" className="section defer" aria-labelledby="story-title">
              <div className="wrap">
                <SectionHeader id="story-title" title="From the stories" action={{ href: "/stories", label: "All stories" }} />
                <StoryFeature stories={featuredStories} />
              </div>
            </section>
          )}

          <Suspense fallback={<HomeVisitorFallback />}>
            <HomeVisitorSection />
          </Suspense>

          {destinations.length > 0 && (
            <section id="places" className="section defer" aria-labelledby="places-title">
              <div className="wrap">
                <SectionHeader
                  id="places-title"
                  title="Places"
                  intro="Where the postcards were sent from."
                  action={{ href: "/destinations", label: "All places" }}
                />
                <Suspense fallback={null}>
                  <PlacesExplorer journal={journal} listLimit={6} />
                </Suspense>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
