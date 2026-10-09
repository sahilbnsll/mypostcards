---
title: Supabase Setup
tags: [runbook, supabase]
updated: 2026-10-09
---

# Supabase setup runbook

Status: schema and seed are **written and tested locally, not yet applied** to the live project (no credentials were available to the assistant). The database is empty, so start at step 1.

## 1. Create the tables

1. Supabase dashboard → **SQL Editor** → New query.
2. Paste all of `supabase/schema.sql` → **Run**. It creates five tables, constraints, indexes, RLS policies (public read of published rows only) and the `postcards` storage bucket.
3. Safe to run again: it never drops data.

## 2. Load the sample content (optional but recommended first)

Pick one:

- **No keys needed:** paste `supabase/seed.sql` into the SQL editor → Run. (Regenerate with `npm run seed:sql` after editing `src/content/data/sample.ts`.)
- **Script:** put `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`, then `npm run seed`. Upserts by slug; never deletes.

Result: 5 destinations, 5 trips, 4 cafés, 3 stories, 48 postcards, all `is_sample = true`.

## 3. Point the site at Supabase

Create `.env.local` (copy `.env.example`):

```bash
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<anon / publishable key>
```

Dashboard → Project Settings → **API**. Restart `npm run dev`. The anon key is read-only by design (RLS), and is only used on the server.

> **Never** put the service-role key in client code, a `NEXT_PUBLIC_` variable, or a hosting dashboard's public settings. It bypasses RLS. If it ever leaks, rotate it in Supabase.

## 4. Add your own postcards

Table Editor, in this order (foreign keys point earlier): `destinations` → `trips` → `cafes` → `stories` → `postcards`.

Minimum for a postcard: `slug`, `title`, `image_src`, `image_alt`, `image_width`, `image_height`, `category`. Add `caption`, location, `trip_slug`, etc. as you like. Leave `is_sample` false. See [[05 Content Model]].

Tips:
- Slugs: lowercase words with hyphens (`kyoto-evening-lane`).
- Width and height: the file's pixel size (any consistent pair with the right ratio works; it only reserves space).
- `image_color`: optional hex of the photo's average colour for a nicer loading tint.
- Hide something without deleting: set `published = false`.
- Put a photo first: set `featured = true`, or give it a low `sort_order`.

### Uploading photos

Storage → bucket `postcards` → upload → open the object → copy the **public URL** → paste into `image_src`. Aim for about 2000px on the long edge, JPEG, quality 80-85. The site resizes and converts to AVIF/WebP.

## 5. Remove the sample content when ready

```sql
delete from public.postcards where is_sample;
delete from public.stories   where is_sample;
delete from public.cafes     where is_sample;
delete from public.trips     where is_sample;
delete from public.destinations where is_sample;
```

The footer notice and lightbox "sample" labels disappear on their own once no sample rows remain.

## 6. Make edits appear quickly

By default the site refreshes content hourly. For instant updates, create a **Database Webhook** (Database → Webhooks) on insert/update/delete for each table: `POST https://mypostcards.sahilbansal.net/api/revalidate` with header `x-revalidate-secret: <REVALIDATE_SECRET>`. Set `REVALIDATE_SECRET` in `.env.local` and in the host's environment. Without it the route answers 503 and is inert.

## 7. Deployment environment

Set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `REVALIDATE_SECRET`. Not the service-role key. Build needs network access to Supabase and Google Fonts.

## Troubleshooting

| Symptom | Cause |
|---|---|
| Site shows sample content | `SUPABASE_URL` or `SUPABASE_ANON_KEY` missing, or `CONTENT_SOURCE=local` |
| Error page: `Supabase query for "postcards" failed ... (run supabase/schema.sql first)` | Tables not created yet |
| Home says "No postcards yet" | Connected and empty: add rows or seed |
| Row exists but not on site | `published = false`, or cache not refreshed yet (wait or call the revalidate route) |
| Image blank or 400 from `/_next/image` | Host not allow-listed (Storage host is derived from `SUPABASE_URL` at build/dev start: restart), or bad URL |
| Insert fails on `slug` | Must match `^[a-z0-9]+(-[a-z0-9]+)*$` |
