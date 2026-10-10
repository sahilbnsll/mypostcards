---
title: Supabase Setup (visitor cards)
tags: [supabase, runbook]
updated: 2026-10-10
---

# Supabase: the guest desk only

Supabase is used for **one thing**: the visitor cards on `/visitors` (the "guest desk"). Photographs, trips, places, cafés and stories are authored in the repository (`content/` and `public/images/`, see [[05 Content Model]]) and never touch the database. The site works with no Supabase at all: the desk shows "still being set up" and the pen still works, but cards can not be sent ([[09 Decisions]] D19, D20).

## What exists

- Table `visitor_cards`: `kind`, `name`, `message`, `drawing` (stroke JSON), `color`, `approved`, `pinned`, `ip_hash`, timestamps. Constraints on lengths, kinds and colours.
- **Row level security.** Anonymous visitors can read only rows where `approved = true`, and only the public columns (`ip_hash` is unreadable). They can not insert, update or delete.
- **Writes go through one function**, `submit_visitor_card()` (`security definer`): validates input, rate-limits (3 per hour and 8 per day per IP hash, 40 per hour overall), and always stores the card unapproved.
- Nothing appears on the site until you approve it.

The SQL is in `supabase/schema.sql` and is safe to run twice. It was tested in an embedded Postgres (PGlite): anon can not write directly, can not read `ip_hash` or `select *`, nothing public before approval, rate limit works, bad input is rejected.

## One-time setup

1. In the Supabase dashboard open **SQL Editor**, paste `supabase/schema.sql`, run it.
2. The old setup created tables `postcards`, `trips`, `destinations`, `cafes`, `stories` and a storage bucket. They are unused now. The commented block at the end of `schema.sql` drops the tables; delete the storage bucket in the dashboard (**Storage**) by hand.
3. In Vercel, **Settings, Environment Variables**: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (the project's anon/public key) and, optionally, `VISITOR_SALT` (any long random string; used to hash visitor IP addresses, which rotate daily). **Do not add the service-role key anywhere.** The site never needs it.
4. Redeploy. Locally, copy `.env.example` to `.env.local` with the same values.

## Moderating cards

Open **Table Editor, `visitor_cards`**. New cards have `approved = false`. Tick `approved` to publish a card (it shows within about five minutes, the wall is cached briefly); tick `pinned` to keep it first; delete rows you do not want. Nothing else is needed.

## How the form is protected

Honeypot field, a minimum time on the form, links rejected (cards are plain text and drawings), drawing data re-validated on the server and again on read, rendered only as SVG paths (never HTML), per-IP and global rate limits in the database, daily-rotating hashed IP (never stored raw), RLS as the last layer. The worst a bypass can do is add unapproved rows you never publish.

## Free plan notes

Supabase Free pauses a project after a week of inactivity (the wall then shows as unavailable until you resume it in the dashboard) and has 500 MB database, 5 GB egress. A card is a few kilobytes. If pausing bothers you, [[10 Backlog]] has a daily keep-alive cron (Vercel Hobby allows one cron per day).

## Troubleshooting

| Symptom | Cause |
|---|---|
| `/visitors` says the desk is being set up | `SUPABASE_URL` or `SUPABASE_ANON_KEY` missing on this deploy |
| Build log: "visitor_cards table does not exist" | Step 1 not done; the site still builds, with an empty wall |
| "Your card could not be sent" | The function is missing or the project is paused; check Logs, Postgres |
| A card was sent but is not shown | It is waiting for approval, or the wall cache has not refreshed yet (up to five minutes) |
