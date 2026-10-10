export type SearchKind = "postcard" | "trip" | "place" | "café" | "story";

export interface SearchEntry {
  type: SearchKind;
  title: string;
  subtitle: string;
  href: string;
  /** Everything worth matching, joined into one string. */
  text: string;
}
