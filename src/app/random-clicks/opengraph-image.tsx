import { getJournal } from "@/content";
import { ogCard, photoDataUri } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Random clicks: photos taken just because";
export default async function Image() {
  const { postcards } = await getJournal();
  const pick = postcards.find((p) => p.category === "random");
  const photo = pick ? await photoDataUri(pick.image.src) : null;
  return ogCard({ kind: "Random clicks", title: "Photos taken just because", line: `${postcards.filter((p) => p.category === "random").length} postcards`, photo, ratio: pick ? pick.image.width / pick.image.height : 1 });
}
