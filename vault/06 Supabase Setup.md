---
title: Supabase Setup (visitor cards)
tags: [supabase, runbook]
updated: 2026-10-10
---

# Supabase: the guest desk only

Supabase is used for **one thing**: the visitor cards on `/visitors` (the "guest desk"). Photographs, trips, places, cafés and stories are authored in the repository (`content/` and `public/images/`, see [[05 Content Model]]) and never touch the database. The site works with no Supabase at all: the desk shows "still being set up" and the pen still works, but cards can not be sent ([[09 Decisions]] D19, D20).

## What exists

- Table `visitor_cards`: `kind`, `name`, `message`, `drawing` (stroke JSON), `color`, `hidden`, `pinned`, `ip_hash`, timestamps. Constraints on lengths, kinds and colours.
- **Row level security.** Anonymous visitors can read only rows where `hidden = false`, and only the public columns (`ip_hash` is unreadable). They can not insert, update or delete.
- **Writes go through one function**, `submit_visitor_card()` (`security definer`): validates input, rate-limits (3 per hour and 8 per day per IP hash, 40 per hour overall), and stores the card visible and unpinned.
- **There is no approval step.** A valid card is on the wall as soon as it is sent. You only open the dashboard to take one down ([[09 Decisions]] D26).

The SQL is in `supabase/schema.sql` and is safe to run twice (it also upgrades an earlier approval-based table: approved rows stay visible, the rest become hidden). Tested in an embedded Postgres (PGlite): anon can not write directly, can not read `ip_hash` or `select *`; cards are public at once; a hidden card disappears and a pinned one sorts first; the rate limit works; bad input is rejected; the upgrade path works.

## One-time setup

1. In the Supabase dashboard open **SQL Editor**, paste `supabase/schema.sql`, run it.
2. The old setup created tables `postcards`, `trips`, `destinations`, `cafes`, `stories` and a storage bucket. They are unused now. The commented block at the end of `schema.sql` drops the tables; delete the storage bucket in the dashboard (**Storage**) by hand.
3. In Vercel, **Settings, Environment Variables**: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (the project's anon/public key) and, optionally, `VISITOR_SALT` (any long random string; used to hash visitor IP addresses, which rotate daily). **Do not add the service-role key anywhere.** The site never needs it.
4. Redeploy. Locally, put the same two values in `.env.local` (copy `.env.example`; the file is git-ignored) and **stop and restart `npm run dev`**: environment files are read only when the server starts. The Visitors page says "Local setup: put SUPABASE_URL and SUPABASE_ANON_KEY in .env.local…" while they are missing.

## Taking a card down

Cards are live immediately, so you never need to check for new ones. If something should not be there: **Table Editor, `visitor_cards`**, tick `hidden` on the row (it leaves the wall within about five minutes), or delete the row. Tick `pinned` to keep a card first. Because nothing is reviewed first, the protections below matter: they are the only gate.

## How the form is protected

Honeypot field, a minimum time on the form, links rejected (cards are plain text and drawings), drawing data re-validated on the server and again on read, rendered only as SVG paths (never HTML), per-IP and global rate limits in the database, daily-rotating hashed IP (never stored raw), RLS as the last layer. The worst a bypass can do is add spam cards, at most 40 an hour for the whole site, which you can hide or delete.

## Free plan notes

Supabase Free pauses a project after a week of inactivity (the wall then shows as unavailable until you resume it in the dashboard) and has 500 MB database, 5 GB egress. A card is a few kilobytes. If pausing bothers you, [[10 Backlog]] has a daily keep-alive cron (Vercel Hobby allows one cron per day).

## Troubleshooting

| Symptom | Cause |
|---|---|
| Cards can not be sent while testing locally | `.env.local` is missing, has empty values, or `npm run dev` was not restarted after editing it. The terminal also prints a warning when you press Send |
| `/visitors` says the desk is being set up | `SUPABASE_URL` or `SUPABASE_ANON_KEY` missing on this deploy |
| Build log: "visitor_cards table does not exist" | Step 1 not done; the site still builds, with an empty wall |
| "Your card could not be sent" | The function is missing or the project is paused; check Logs, Postgres |
| A card was sent but is not shown | Its row is `hidden`, or the wall cache has not refreshed yet (a new card refreshes it at once; hiding one takes up to five minutes) |
