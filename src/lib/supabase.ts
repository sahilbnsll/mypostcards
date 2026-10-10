import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * The Supabase client for the guest desk, or null when it is not configured (local development
 * without keys, or a deployment that has not been given them yet).
 *
 * It uses the public anon key only. That key can read visible visitor cards and call
 * submit_visitor_card(); nothing else (see supabase/schema.sql). The service-role key is never
 * used here and must not be added to this project's environment.
 *
 * Server-only: the variables are deliberately not NEXT_PUBLIC_, so they are never sent to browsers.
 */
export function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
