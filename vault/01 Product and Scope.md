---
title: Product and Scope
tags: [product]
updated: 2026-10-09
---

# Product and scope

**Domain:** mypostcards.sahilbansal.net · **Author:** Sahil Bansal · **Brand line:** "A little collection of places I've been and moments I've kept."

## What it is

A contemporary digital postcard collection: travel photography, cafés, city streets, food and weekend getaways. Photographs and the stories behind them are the product; everything else supports discovering and remembering places.

## What it is not

A developer portfolio, a general photographer portfolio, a booking site, an Instagram/Pinterest clone, or a SaaS dashboard.

## In scope (built)

- Immersive hero, photography-first gallery with category filter, lightbox with metadata.
- Trips (collections), Places (destinations), Cafés, Stories, About.
- Content in Supabase (single creator, written by hand in the dashboard), with built-in sample content as a fallback.
- Responsive, keyboard accessible, reduced-motion aware, SEO foundations.

## Explicitly deferred

No authentication or accounts, no community posts or submissions, no profiles, likes, comments, followers or feeds, no moderation, no custom backend or admin UI. See [[10 Backlog]].

## Honesty rules for content

- Sample photographs are **not** the author's travel history. No dates, trips or first-person claims are asserted for them. Every sample row has `is_sample = true` and the UI says so (footer, lightbox, story notice). See [[12 Sample Content and Credits]].
- Do not invent social accounts, contact details or personal history anywhere in copy.

## Audience and jobs

A visitor lands from a link, looks at photographs, filters by what they feel like seeing (a café, a city), opens one to read its caption and where it was taken, and maybe follows a trip or story. The author adds rows in Supabase and the site updates.
