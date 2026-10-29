import { getJournal } from "@/content";
import { featuredFirst } from "@/content/selectors";
import { ogCard, photoDataUri } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "About My Postcards and Sahil Bansal";
export default async function Image() {
  const { postcards } = await getJournal();
  const pick = featuredFirst(postcards)[0];
  const photo = pick ? await photoDataUri(pick.image.src) : null;
  return ogCard({ kind: "About", title: "Sahil Bansal", line: "Postcards from places I have been", photo, ratio: pick ? pick.image.width / pick.image.height : 1 });
}
