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

/** PostgREST and Postgres codes for "this table does not exist (yet)". */
const MISSING_TABLE_CODES = new Set(["PGRST205", "42P01"]);

interface Loaded {
  journal: Journal;
  /** True when the tables have not been created in Supabase yet (schema.sql not run). */
  setupMissing: boolean;
}

const EMPTY_JOURNAL: Journal = { postcards: [], trips: [], destinations: [], cafes: [], stories: [] };

async function readFromSupabase(url: string, key: string): Promise<Loaded> {
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const order = { ascending: true } as const;

  const [postcards, trips, destinations, cafes, stories] = await Promise.all([
    supabase.from("postcards").select("*").order("sort_order", order).order("created_at", { ascending: false }),
    supabase.from("trips").select("*").order("sort_order", order).order("created_at", { ascending: false }),
    supabase.from("destinations").select("*").order("sort_order", order).order("name", order),
    supabase.from("cafes").select("*").order("sort_order", order).order("name", order),
    supabase.from("stories").select("*").order("sort_order", order).order("created_at", { ascending: false }),
  ]);

  const results = { postcards, trips, destinations, cafes, stories };

  // A fresh project has no tables yet. That is a setup step, not an outage: build and serve an
  // empty journal (with a loud warning) instead of failing the deploy.
  const missing = Object.entries(results).filter(([, r]) => r.error && MISSING_TABLE_CODES.has(r.error.code));
  if (missing.length > 0) {
    console.warn(
      `[my-postcards] Supabase tables not found (${missing.map(([n]) => n).join(", ")}). Run supabase/schema.sql in the SQL editor. Serving an empty journal.`,
    );
    return { journal: EMPTY_JOURNAL, setupMissing: true };
  }

  // Anything else (bad key, permissions, network) is a real problem: fail loudly.
  for (const [name, result] of Object.entries(results)) {
    if (result.error) throw new Error(`Supabase query for "${name}" failed: ${result.error.message}`);
  }

  return {
    journal: mapJournal({
      postcards: postcards.data ?? [],
      trips: trips.data ?? [],
      destinations: destinations.data ?? [],
      cafes: cafes.data ?? [],
      stories: stories.data ?? [],
    }),
    setupMissing: false,
  };
}

export async function getJournal(): Promise<Journal> {
  "use cache";
  cacheTag(JOURNAL_TAG);

  const config = supabaseConfig();
  const { journal, setupMissing } = config
    ? await readFromSupabase(config.url, config.key)
    : { journal: sampleJournal, setupMissing: false };

  // Normal content refreshes hourly. While the tables are missing, look again every minute so the
  // site fills in shortly after schema.sql is run. (Kept above 5 minutes of expiry so it still
  // prerenders rather than becoming a request-time hole.)
  if (setupMissing) cacheLife({ stale: 60, revalidate: 60, expire: 900 });
  else cacheLife("hours");
  return journal;
}
