import { Suspense } from "react";
import { getJournal } from "@/content";
import { getVisitorWall } from "@/content/visitors";
import {
  balancedSample,
  featuredFirst,
  globePins,
  postcardCount,
  toViews,
  visitedPlaces,
} from "@/content/selectors";
import { Hero } from "@/components/features/hero/Hero";
import { StatsBar } from "@/components/features/hero/StatsBar";
import { PrintCarousel } from "@/components/features/carousel/PrintCarousel";
import { BloomGallery } from "@/components/features/gallery/BloomGallery";
import { TripStack } from "@/components/features/trips/TripStack";
import { ZoomGallery } from "@/components/features/zoom/ZoomGallery";
import { PlacesGlobe } from "@/components/features/globe/PlacesGlobe";
import { StoryFeature } from "@/components/features/stories/StoryFeature";
import { PlacesIndex } from "@/components/features/places/PlacesIndex";
import { VisitorWall, VisitorWallSkeleton } from "@/components/features/visitors/VisitorWall";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ViewAllButton } from "@/components/ui/ViewAllButton";

const GALLERY_PREVIEW = 8;
const CAROUSEL_COUNT = 10;

async function HomeVisitorSection() {
  const wall = await getVisitorWall(11);
  const hasMoreVisitors = wall.cards.length > 10;
  const previewCards = wall.cards.slice(0, 10);

  return (
    <section className="section" aria-labelledby="visitors-title">
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
    <section className="section" aria-labelledby="visitors-title">
      <div className="wrap">
        <SectionHeader
          id="visitors-title"
          title="From visitors"
          intro="Cards left on the guest desk."
          badge="Gathering cards..."
          action={{ href: "/visitors", label: "Leave a card" }}
        />
        <VisitorWallSkeleton count={10} scattered />
      </div>
    </section>
  );
}

export default async function HomePage() {
  const journal = await getJournal();
  const { postcards, trips, destinations, stories } = journal;

  const heroCards = featuredFirst(postcards).slice(0, 5);
  const recent = toViews(journal, postcards.slice(0, CAROUSEL_COUNT));
  const preview = toViews(journal, balancedSample(postcards, GALLERY_PREVIEW));
  const zoomCards = featuredFirst(postcards).slice(5, 12);
  const pins = globePins(postcards);
  const featuredTrips = featuredFirst(trips).slice(0, 3);
  const featuredStory = featuredFirst(stories)[0];

  const tripCounts = Object.fromEntries(trips.map((t) => [t.slug, postcardCount(journal, "tripSlug", t.slug)]));
  const placeCounts = Object.fromEntries(
    destinations.map((d) => [d.slug, postcardCount(journal, "destinationSlug", d.slug)]),
  );

  return (
    <>
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
            <section className="section" aria-labelledby="lately-title">
              <div className="wrap">
                <SectionHeader
                  id="lately-title"
                  title="Pinned up lately"
                  intro="The newest prints on the line. Drag, scroll or use the arrows."
                />
              </div>
              <PrintCarousel items={recent} label="Recent postcards" />
            </section>
          )}

          {zoomCards.length === 7 && (
            <section aria-labelledby="zoom-title">
              <div className="wrap section-top">
                <SectionHeader id="zoom-title" title="Look closer" intro="Seven photographs from the collection." />
              </div>
              <ZoomGallery postcards={zoomCards} />
            </section>
          )}

          <section id="collection" className="section" aria-labelledby="collection-title">
            <div className="wrap">
              <SectionHeader
                id="collection-title"
                title="The collection"
                intro="A few favourites from every kind of postcard and every place I have been."
              />
              <BloomGallery items={preview} filterable={false} />
              {postcards.length > preview.length && (
                <ViewAllButton href="/gallery">View all {postcards.length} postcards</ViewAllButton>
              )}
            </div>
          </section>

          {featuredTrips.length > 0 && (
            <section className="section" aria-labelledby="trips-title">
              <div className="wrap">
                <SectionHeader
                  id="trips-title"
                  title="Trips and collections"
                  intro="Photographs grouped around a journey, a place or a weekend."
                  action={{ href: "/trips", label: "All trips" }}
                />
                <TripStack trips={featuredTrips} counts={tripCounts} />
              </div>
            </section>
          )}

          {featuredStory && (
            <section className="section" aria-labelledby="story-title">
              <div className="wrap">
                <SectionHeader id="story-title" title="From the stories" action={{ href: "/stories", label: "All stories" }} />
                <StoryFeature story={featuredStory} />
              </div>
            </section>
          )}

          <Suspense fallback={<HomeVisitorFallback />}>
            <HomeVisitorSection />
          </Suspense>

          {destinations.length > 0 && (
            <section className="section" aria-labelledby="places-title">
              <div className="wrap">
                <SectionHeader
                  id="places-title"
                  title="Places"
                  intro="Where the postcards were sent from."
                  action={{ href: "/destinations", label: "All places" }}
                />
                <PlacesGlobe pins={pins} />
                <PlacesIndex places={visitedPlaces(journal).slice(0, 6)} counts={placeCounts} />
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
