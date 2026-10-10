/**
 * Content layer: the one place pages get journal data from.
 *
 * The journal is authored in `content/` (JSON and Markdown) with photographs in `public/images/`.
 * `scripts/build-content.mjs` validates it and writes `generated/journal.json`, which is imported
 * here, so there is no database, no runtime file access and nothing to cache: the data is part of
 * the build. Edit content, commit, and Vercel redeploys.
 *
 *   getJournal()   Everything.
 *   selectors      Pure helpers that slice a Journal (by trip, place, category, related, ...).
 */
import generated from "./generated/journal.json";
import type { Journal } from "./types";

export * from "./types";
export * from "./selectors";
export { CATEGORIES, CATEGORY_BY_ID } from "./categories";

const journal = generated as unknown as Journal;

/** Async so pages read the same whether the data is bundled (now) or fetched (later). */
export async function getJournal(): Promise<Journal> {
  return journal;
}
