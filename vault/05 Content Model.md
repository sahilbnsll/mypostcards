---
title: Content Model
tags: [data]
updated: 2026-10-09
---

# Content model

Types: `src/content/types/index.ts`. Database: `supabase/schema.sql`. Mappers (snake_case rows to camelCase types): `src/content/mappers.ts`, and the reverse in `scripts/seed.mjs`. A round-trip test (seed, read, map, compare to `sample.ts`) passes for all 65 sample rows.

**Every entity is keyed by a human-readable `slug`** (lowercase words joined by single hyphens, enforced by a `check`). Relations are slugs too (`trip_slug = 'alpine-light'`), `on update cascade`, `on delete set null`. Easy to type in the Table Editor and readable in URLs.

## Relations

```text
destinations 1─* trips
destinations 1─* cafes
trips        1─* stories
destinations 1─* stories
postcards  *─1 trip, destination, cafe, story   (all optional)
```

## Tables

### `postcards` (the product)

| Column | Notes |
|---|---|
| `slug` PK, `title` | Required |
| `caption` | One line. Every postcard should have one |
| `note` | Short handwritten message on the card back. Optional |
| `image_src`, `image_alt`, `image_width`, `image_height` | Required. **Alt text is required**; width/height prevent layout shift. `image_color` (hex) is optional placeholder tint |
| `category` | `travel`, `city`, `cafe`, `food`, `getaway` (check constraint; labels in `src/content/categories.ts`) |
| `place_name`, `city`, `region`, `country`, `lat`, `lng` | All optional. Location shown as place, city, country |
| `taken_on` (date), `period_label` (text) | Exact date, or an approximate period such as "Late autumn 2024". Both optional |
| `trip_slug`, `destination_slug`, `cafe_slug`, `story_slug` | Optional relations |
| `tags` text[], `camera` jsonb | Optional. Camera keys: `body, lens, focalLength, aperture, iso, shutterSpeed` |
| `credit`, `credit_url` | For photos that are not yours |
| `is_sample`, `featured`, `published`, `sort_order`, `created_at` | `published=false` hides from the site (RLS). `featured` lifts into hero/preview. New rows default to `sort_order 0`, so the newest appear first |

### `trips`, `destinations`, `cafes`, `stories`

- **trips**: `title`, `summary`, optional long `story`, cover image, `destination_slug`, `start_date`/`end_date` or `period_label`, `featured`.
- **destinations**: `name`, `country`, `region`, `description`, cover image, optional `lat/lng`.
- **cafes**: `name`, `city`, `country`, `neighborhood`, `destination_slug`, cover image, `vibe_tags[]`, `notes`, `favorite_order`.
- **stories**: `title`, `subtitle`, `published_at`, `reading_time_minutes`, `excerpt`, `body`, cover image, `trip_slug`, `destination_slug`, `featured`.

All five also have `is_sample`, `published`, `sort_order`, `created_at`.

## Long text format

`trips.story` and `stories.body` are plain text: **paragraphs separated by a blank line**, and a line starting with `## ` is a subheading. No markdown parser. A caption never needs a story; stories are opt-in (the model supports short captions and long stories without forcing either).

## Security

RLS on every table: the public `anon` and `authenticated` roles can only `select` rows where `published` is true; all insert/update/delete is revoked. Verified in an embedded Postgres. Writes happen in the dashboard or with the service-role key.

## Storage

Public bucket `postcards` (15 MB limit; jpeg/png/webp/avif). Upload in the dashboard, then paste the object's public URL into `image_src`. `next.config.ts` allow-lists the project's Storage host automatically from `SUPABASE_URL`.

## Categories live in code

They drive the filter UI, copy and the SQL `check`. To add one, change `categories.ts`, the `Category` type **and** the constraint in `schema.sql` (then run an `alter table` in Supabase). Logged in [[10 Backlog]] as deliberate friction.
