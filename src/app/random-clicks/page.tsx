import type { Metadata } from "next";
import { KindCollection } from "@/components/features/gallery/KindCollection";

export const metadata: Metadata = {
  title: "Random clicks",
  description: "Photos taken just because: no trip, no plan, only a good moment.",
  alternates: { canonical: "/random-clicks" },
};

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
