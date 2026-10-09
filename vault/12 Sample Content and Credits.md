---
title: Sample Content and Credits
tags: [content, credits]
updated: 2026-10-09
---

# Sample content and credits

## What is sample

All rows in `src/content/data/sample.ts` (and therefore `supabase/seed.sql`): 5 destinations, 5 trips, 4 cafés, 3 stories, 48 postcards. Every one has `isSample: true` (`is_sample` in SQL).

- Captions and titles describe what is in the photograph. No dates are given. Locations appear only where a landmark is unmistakable (for example Lago di Braies, the Taj Mahal, Multnomah Falls).
- Café names are fictional placeholders and marked "Sample entry".
- The three stories are written as observations and carry a "Sample story" notice.
- The UI discloses this: footer note, lightbox line "Sample photograph via Unsplash. Not from my travels.", postmark reading SAMPLE.

## Photographs

Source: **Unsplash** (free to use under the Unsplash License; attribution is appreciated, not required). Loaded from `images.unsplash.com` with pinned parameters `?auto=format&fit=max&w=2000&q=80`.

How they were chosen: unsplash.com is protected by a bot check and was not scraped. Instead, candidate photo IDs were requested directly from the image CDN, measured for real aspect ratio and average colour, and reviewed on contact sheets. 74 candidates, all loaded, 48 used. IDs for six alpine photographs and several others came from the user's own reference file.

Photographer names were not retrievable, so the credit reads "Unsplash". Before launch, either replace the samples or add the photographers (`credit`, `credit_url`).

## When real photographs arrive

1. Upload to the `postcards` Supabase bucket ([[06 Supabase Setup]]).
2. Add rows with `is_sample` left false and real alt text.
3. Delete the sample rows. The notices disappear automatically.
