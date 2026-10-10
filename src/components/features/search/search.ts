import type { SearchEntry, SearchKind } from "./types";

/** Lower-case and strip accents, so "cafe" finds "café". */
export function normalize(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

const TYPE_ORDER: SearchKind[] = ["postcard", "place", "trip", "café", "story"];

export interface Prepared extends SearchEntry {
  _title: string;
  _text: string;
}

export const prepare = (entries: SearchEntry[]): Prepared[] =>
  entries.map((entry) => ({ ...entry, _title: normalize(entry.title), _text: normalize(entry.text) }));

/**
 * Every word typed must appear somewhere in an entry. Entries are ranked by where the words
 * match: a title that starts with the word first, then a word-start in the title, then the title,
 * then the rest of the text.
 */
export function search(entries: Prepared[], query: string, limit = 24): Prepared[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const scored: Array<{ entry: Prepared; score: number }> = [];
  for (const entry of entries) {
    let score = 0;
    let all = true;
    for (const word of words) {
      if (entry._title.startsWith(word)) score += 10;
      else if (entry._title.includes(` ${word}`)) score += 7;
      else if (entry._title.includes(word)) score += 5;
      else if (entry._text.includes(` ${word}`) || entry._text.startsWith(word)) score += 3;
      else if (entry._text.includes(word)) score += 1.5;
      else {
        all = false;
        break;
      }
    }
    if (all) scored.push({ entry, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || TYPE_ORDER.indexOf(a.entry.type) - TYPE_ORDER.indexOf(b.entry.type) || a.entry.title.localeCompare(b.entry.title))
    .slice(0, limit)
    .map((s) => s.entry);
}
