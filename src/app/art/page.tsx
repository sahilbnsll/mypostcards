import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { KindCollection } from "@/components/features/gallery/KindCollection";

export const metadata: Metadata = pageMetadata({
  title: "Art: things people make",
  description: "Paintings, drawings and made things I came across, and the light they sit in, photographed and kept as postcards.",
  path: "/art",
});

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
