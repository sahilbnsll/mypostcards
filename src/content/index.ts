/**
 * Content layer: the one place pages get journal data from.
 *
 *   getJournal()   Everything, cached. Reads Supabase when SUPABASE_URL + SUPABASE_ANON_KEY are
 *                  set, otherwise the built-in sample journal. CONTENT_SOURCE=local forces samples.
 *   selectors      Pure helpers that slice a Journal (by trip, destination, category, ...).
 *
 * The whole journal is loaded as one cached value. That is the right trade for a single-creator
 * journal with up to a few hundred postcards: one round trip of five small queries, then every
 * page filters in memory. If it ever grows past ~1,000 postcards, switch the heavy pages to
 * paginated queries; the selectors' signatures can stay.
 */
import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { sampleJournal } from "./data/sample";
import { mapJournal } from "./mappers";
import type { Journal } from "./types";

export * from "./types";
export * from "./selectors";
export { CATEGORIES, CATEGORY_BY_ID } from "./categories";

export const JOURNAL_TAG = "journal";

function supabaseConfig() {
  if (process.env.CONTENT_SOURCE === "local") return null;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

async function readFromSupabase(url: string, key: string): Promise<Journal> {
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const order = { ascending: true } as const;

  const [postcards, trips, destinations, cafes, stories] = await Promise.all([
    supabase.from("postcards").select("*").order("sort_order", order).order("created_at", { ascending: false }),
    supabase.from("trips").select("*").order("sort_order", order).order("created_at", { ascending: false }),
    supabase.from("destinations").select("*").order("sort_order", order).order("name", order),
    supabase.from("cafes").select("*").order("sort_order", order).order("name", order),
    supabase.from("stories").select("*").order("sort_order", order).order("created_at", { ascending: false }),
  ]);

  for (const [name, result] of Object.entries({ postcards, trips, destinations, cafes, stories })) {
    if (result.error) {
      throw new Error(
        `Supabase query for "${name}" failed: ${result.error.message}` +
          (result.error.code === "42P01" ? " (run supabase/schema.sql first)" : ""),
      );
    }
  }

  return mapJournal({
    postcards: postcards.data ?? [],
    trips: trips.data ?? [],
    destinations: destinations.data ?? [],
    cafes: cafes.data ?? [],
    stories: stories.data ?? [],
  });
}

export async function getJournal(): Promise<Journal> {
  "use cache";
  cacheLife("hours");
  cacheTag(JOURNAL_TAG);

  const config = supabaseConfig();
  return config ? readFromSupabase(config.url, config.key) : sampleJournal;
}
