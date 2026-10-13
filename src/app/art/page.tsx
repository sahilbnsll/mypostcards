import type { Metadata } from "next";
import { KindCollection } from "@/components/features/gallery/KindCollection";

export const metadata: Metadata = {
  title: "Art",
  description: "Things people make, and the light they sit in.",
  alternates: { canonical: "/art" },
};

export default function ArtPage() {
  return (
    <KindCollection
      kind="art"
      title="Art"
      lede="Things people make, and the light they sit in."
      emptyBody="Pieces I come across and want to remember will be collected here."
    />
  );
}
