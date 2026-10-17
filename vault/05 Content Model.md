---
title: Content Model
tags: [data]
updated: 2026-10-17
---

# Content model

Authoring guide with examples: `content/README.md`. Types: `src/content/types/index.ts`. Validator and generator: `scripts/build-content.mjs`. Visitor cards (the only database table): [[06 Supabase Setup]].

## Photo folders

```text
public/images/
  cafes/
    daksina-bhawan/     one folder per café: front-view.jpg, temple-bells.jpg, dosa.jpg ...
    pf-changs/          blossom-ceiling.jpg, spring-rolls.jpg ...
  art/                  house-on-the-hill.jpg, signed-on-the-back.jpg
  random-clicks/        lamp-over-the-pothos.jpg
  trips/<trip>/         photos from a trip (when there are trips)
  destinations/<place>/ photos from a place that belong to no café or trip
private-originals/      the same folders, holding your untouched originals (git-ignored, never published)
```

Short file names inside the folder (the folder says which café), the postcard slug stays globally unique ([[09 Decisions]] D32). Originals are named `<shot>__IMG_1234.JPEG` so each one can be traced to its published photo.

## Where content lives

```text
content/postcards.json  trips.json  destinations.json  cafes.json   authored data
content/stories/*.md                                                 stories (front matter + Markdown, file name is the slug)
public/images/**                                                     the author's photographs, one folder per café, trip or kind
private-originals/**                                                 untouched originals, same folders, git-ignored
   -> scripts/build-content.mjs -> src/content/generated/journal.json (gitignored)
```

The generator validates everything and stops the build with a precise message: slug format (`^[a-z0-9]+(-[a-z0-9]+)*$`), references between files (slugs), required `alt`, unknown field names (with a suggested correction), local image files that do not exist. For local images it measures width and height and an average colour with `sharp`; remote (sample) images carry explicit dimensions. Covers for trips, places and cafés are derived from their postcards when not given.

## Relations

```text
destinations 1-* trips, cafes, stories
trips        1-* stories
postcards  *-1 trip, destination, cafe, story   (all optional)
```

## Entities

- **Postcard**: `slug, title, image, alt, category` required. Optional `caption, note, place, city, region, country, lat, lng, date | period, trip, destination, cafe, story, tags, camera, credit, creditUrl, featured, sample`. Categories: travel, city, cafe, food, getaway, art, random (shown as "Random clicks"). `/art` and `/random-clicks` list one category each. Optional `artist` credits whoever made the thing in the photo. Each postcard has its own page (`/postcards/[slug]`) and share image, and a list of related postcards ([[09 Decisions]] D22).
- **Trip**: summary, optional cover, dates or `period`, and optional `days`: `[{ title, stops: [{ place, time?, note?, tip?, lat?, lng?, postcard? }] }]`. Shown as a timeline with a route map ([[07 Components]]).
- **Destination**: `status` is `visited` (default) or `planned`. Planned places need no cover and appear under "Dreaming of" and as dashed pins.
- **Cafe**: `order, price, seat, wifi, map` (https link), `rating` (0.5 to 5, at most one decimal, drawn as stars filled by the exact amount) and `ratingNote` are shown only when provided. A postcard may also have its own `rating`.
- **Story**: front matter plus Markdown body.
- **`sample: true`** flags stand-in content. The UI says so honestly; never present samples as the author's own travel ([[12 Sample Content and Credits]]).

## Visitor card (database)

`kind` (hello, place suggestion, about the site, other), `name?`, `message?`, `drawing` (stroke JSON: colour names, widths, points), `color` (card tint), `hidden` (default false: cards are public at once), `pinned`.
