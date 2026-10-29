import { ogCard } from "@/lib/og";

export const alt = "Guest desk: leave a card on My Postcards";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return ogCard({ kind: "Guest desk", title: "Leave a card", line: "A hello, a thought, a place I should go.", photo: null, ratio: 1 });
}
