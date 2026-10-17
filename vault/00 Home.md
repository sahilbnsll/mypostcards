---
title: My Postcards, project vault
tags: [index]
updated: 2026-10-17
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
| Add postcards, trips, cafés (content guide) | `content/README.md`, [[05 Content Model]] |
| Connect the visitor guest desk, hide a card | [[06 Supabase Setup]] |
| Find a component and what it does | [[07 Components]] |
| See what was verified and how to re-run it | [[08 Quality and Verification]] |
| Find out why something is the way it is | [[09 Decisions]] |
| See what is deferred or known to be imperfect | [[10 Backlog]] |
| See what changed and when | [[11 Changelog]] |
| Check where the sample photographs came from | [[12 Sample Content and Credits]] |

## Status (2026-10-10)

- Content is authored in `content/` and `public/images/` (see `content/README.md`); 49 postcards (all the author's own: P.F. Chang's, Daksina Bhawan, Costa Coffee, NY United Cafe, Shikarbagh in Jaipur, Punjab Grill, Skyhouse in Noida, art including a friend's drawing, random clicks and a Delhi Metro city shot), 5 places (Gurugram, Delhi, Noida, Jaipur and Bari, made automatically from the postcards), 7 cafés, 2 stories ("The emptiest metro" and "The langur that wasn't") and no trips yet. All the stand-in sample content was removed on 2026-10-14. Supabase is used only for the visitor guest desk and is **not yet connected** ([[06 Supabase Setup]]); the desk shows "being set up" until then.
- Typecheck, lint and production build pass (59 static pages). Work since the last push (the whole pivot: repo content, visitors, postcard pages, itineraries, search, flat map, dark theme, cursor) is **not committed**.
- axe on the new pages, Lighthouse and real devices are **not** done. See [[08 Quality and Verification]].

## Commands

```bash
npm run dev        # http://localhost:3000, also watches content/ and public/images/
npm run content    # validate and regenerate the content data
npm run build      # production build (validates content first)
npm run lint
npm run typecheck
```

## How to maintain this vault

1. Change code or design → update the matching note in the same change.
2. Make a decision with a trade-off → add an entry to [[09 Decisions]].
3. Ship something → add a line to [[11 Changelog]] (newest first).
4. Defer or discover a limitation → [[10 Backlog]].
5. Bump `updated:` in the note's frontmatter and the status block above.
6. Open `vault/` as a vault in Obsidian (Open folder as vault). Links use `[[wikilinks]]`.
