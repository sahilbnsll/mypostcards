---
title: My Postcards, project vault
tags: [index]
updated: 2026-10-09
---

# My Postcards

> A little collection of places I've been and moments I've kept.

Personal photo journal for **mypostcards.sahilbansal.net**, kept by Sahil Bansal. This vault is the project's working memory: decisions, design system, runbooks and status. **Keep it current.** See [[#How to maintain this vault]].

## Start here

| I want to... | Read |
|---|---|
| Understand what this is and what is out of scope | [[01 Product and Scope]] |
| See colours, type, shapes, how the references were used | [[02 Design System]] |
| Understand every animation and its rules | [[03 Motion System]] |
| Know how the app is built and cached | [[04 Architecture]] |
| Know the data model | [[05 Content Model]] |
| Connect Supabase, add rows, upload photos | [[06 Supabase Setup]] |
| Find a component and what it does | [[07 Components]] |
| See what was verified and how to re-run it | [[08 Quality and Verification]] |
| Find out why something is the way it is | [[09 Decisions]] |
| See what is deferred or known to be imperfect | [[10 Backlog]] |
| See what changed and when | [[11 Changelog]] |
| Check where the sample photographs came from | [[12 Sample Content and Credits]] |

## Status (2026-10-09)

- Site is built and verified locally: 35 prerendered routes, typecheck, lint and production build pass. Pushed to GitHub earlier; the work since (globe, drag cards, trip stack, zoom, Vercel fix) is **not committed yet**.
- Content comes from `src/content/data/sample.ts` (48 sample postcards) until Supabase is connected. Supabase schema and seed are written and tested in an embedded Postgres, **not yet applied to the live project**. Vercel has the Supabase env vars, so until `schema.sql` is run the deployed site is empty (it builds, with a warning).
- Lighthouse and real-device testing have **not** been run. See [[08 Quality and Verification]].

## Commands

```bash
npm run dev        # http://localhost:3000
npm run build      # production build (also type-checks)
npm run lint
npm run typecheck
npm run seed:sql   # regenerate supabase/seed.sql from the sample data
npm run seed       # push sample rows to Supabase (needs .env.local, see 06)
```

## How to maintain this vault

1. Change code or design → update the matching note in the same change.
2. Make a decision with a trade-off → add an entry to [[09 Decisions]].
3. Ship something → add a line to [[11 Changelog]] (newest first).
4. Defer or discover a limitation → [[10 Backlog]].
5. Bump `updated:` in the note's frontmatter and the status block above.
6. Open `vault/` as a vault in Obsidian (Open folder as vault). Links use `[[wikilinks]]`.
