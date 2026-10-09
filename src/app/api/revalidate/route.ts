import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { JOURNAL_TAG } from "@/content";

/**
 * POST /api/revalidate
 *
 * Tells the site to refresh the journal after rows change in Supabase (wire it to a Database
 * Webhook, or call it by hand). Authenticated with the `x-revalidate-secret` header, compared in
 * constant time. Disabled (503) unless REVALIDATE_SECRET is set. The secret is never read from
 * the URL, so it cannot leak into logs.
 */
export async function POST(request: Request) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) {
    return Response.json({ ok: false, error: "Revalidation is not configured." }, { status: 503 });
  }

  const provided = request.headers.get("x-revalidate-secret") ?? "";
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  revalidateTag(JOURNAL_TAG, "max");
  return Response.json({ ok: true, revalidated: JOURNAL_TAG });
}
