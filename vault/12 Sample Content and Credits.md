---
title: Sample Content and Credits
tags: [content, credits]
updated: 2026-10-14
---

# Sample content and credits

## What is the author's own

Three art postcards (`art-*`: a miniature hill with a lit house and its signed back, by Aslam Khan, and a lamp-lit pothos) and seven photographs from a dinner at P.F. Chang's, Gurugram, on 6 October 2026 (`content/postcards.json`, slugs `pf-changs-*`), with their café entry and the Gurugram place. They are marked `sample: false`, so they show no sample notice and the postmark carries the year. The files in `public/images/postcards/` are cleaned copies (upright, 2000px, no location or device data); the originals are kept out of the published site in the git-ignored `private-originals/` folder.

The captions and handwritten notes were written from what each picture shows, in the author's voice, and are meant to be edited.

## What is sample

**Nothing, since 2026-10-14.** All the stand-in content (48 Unsplash postcards, 5 trips, 6 places including a "Dreaming of" one, 4 cafés and 3 stories) was removed at the author's request; it is still in the git history (commit 9784db7 and earlier) if it is ever needed as a reference for the data shapes. The sample-content machinery stays in the code (`sample: true` in a content entry shows a "Sample photograph" line and a footer note, and the postmark says "someday"), so stand-ins can be used again for a test without changing code.

## Photographs (historical)

The removed samples came from **Unsplash** (free to use under the Unsplash License; attribution is appreciated, not required). Loaded from `images.unsplash.com` with pinned parameters `?auto=format&fit=max&w=2000&q=80`.

How they were chosen: unsplash.com is protected by a bot check and was not scraped. Instead, candidate photo IDs were requested directly from the image CDN, measured for real aspect ratio and average colour, and reviewed on contact sheets. 74 candidates, all loaded, 48 used. IDs for six alpine photographs and several others came from the user's own reference file.

Photographer names were not retrievable, so the credit reads "Unsplash". Before launch, either replace the samples or add the photographers (`credit`, `credit_url`).

## When real photographs arrive

1. Copy the photo (cleaned of location data) into `public/images/postcards/`.
2. Add an entry to `content/postcards.json` with `sample` left out or false and real alt text (see `content/README.md`).
3. Delete the sample entries. The notices disappear automatically.
