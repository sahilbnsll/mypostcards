import { cacheLife, cacheTag } from "next/cache";
import { getSupabase } from "@/lib/supabase";
import { isCardColor, isKind, sanitizeDrawing, type VisitorCard } from "./visitors-shared";

export const VISITOR_CARDS_TAG = "visitor-cards";

export interface VisitorWall {
  /** "closed": Supabase is not configured. "unavailable": it is, but could not be read. */
  status: "ok" | "closed" | "unavailable";
  cards: VisitorCard[];
}

/**
 * Visitor cards that are not hidden, pinned first, newest next. A failure here must never break the page or
 * a deploy, so every problem becomes an empty wall with a warning in the log. The result is
 * cached briefly; a new card expires the cache at once, and hiding one in the dashboard shows within minutes.
 */
export async function getVisitorWall(limit = 60): Promise<VisitorWall> {
  "use cache";
  cacheTag(VISITOR_CARDS_TAG);

  const supabase = getSupabase();
  if (!supabase) {
    cacheLife("hours");
    return { status: "closed", cards: [] };
  }

  const { data, error } = await supabase
    .from("visitor_cards")
    .select("id, created_at, kind, name, message, drawing, color, pinned")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    const missing = error.code === "PGRST205" || error.code === "42P01";
    console.warn(
      missing
        ? "[my-postcards] The visitor_cards table does not exist yet. Run supabase/schema.sql in the SQL editor."
        : `[my-postcards] Could not read visitor cards: ${error.message}`,
    );
    cacheLife({ stale: 60, revalidate: 60, expire: 900 });
    return { status: missing ? "ok" : "unavailable", cards: [] };
  }

  cacheLife({ stale: 60, revalidate: 300, expire: 3600 });
  const cards: VisitorCard[] = (data ?? []).map((row) => ({
    id: String(row.id),
    createdAt: String(row.created_at),
    kind: isKind(row.kind) ? row.kind : "other",
    name: typeof row.name === "string" && row.name ? row.name : undefined,
    message: typeof row.message === "string" && row.message ? row.message : undefined,
    drawing: sanitizeDrawing(row.drawing),
    color: isCardColor(row.color) ? row.color : "paper",
    pinned: row.pinned === true,
  }));
  return { status: "ok", cards };
}
