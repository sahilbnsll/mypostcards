import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { KindCollection } from "@/components/features/gallery/KindCollection";

export const metadata: Metadata = pageMetadata({
  title: "Random clicks: photos taken just because",
  description: "Photos taken just because: skies, lamps, street corners and small moments with no trip and no plan, kept as postcards.",
  path: "/random-clicks",
});

export default function RandomClicksPage() {
  return (
    <KindCollection
      kind="random"
      title="Random clicks"
      lede="Photos taken just because: no trip, no plan, only a good moment."
      emptyBody="Photos that fit nowhere else will be collected here."
    />
  );
}
