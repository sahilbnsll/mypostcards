import { getJournal } from "@/content";
import { ogCard, photoDataUri } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Art: things people make";
export default async function Image() {
  const { postcards } = await getJournal();
  const pick = postcards.find((p) => p.category === "art");
  const photo = pick ? await photoDataUri(pick.image.src) : null;
  return ogCard({ kind: "Art", title: "Things people make", line: `${postcards.filter((p) => p.category === "art").length} postcards`, photo, ratio: pick ? pick.image.width / pick.image.height : 1 });
}
