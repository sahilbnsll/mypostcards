# Writing the journal

Everything on the site except the visitor cards comes from this folder and from `public/images/`. Edit a file, save, and the dev server rebuilds the data (`npm run dev` watches both folders). On deploy, `npm run build` does the same. If something is wrong, the build stops and says which file, which entry and what to fix.

```text
content/
  postcards.json      every photograph
  trips.json          trips, with optional day-by-day itineraries
  destinations.json   places you want to describe, or have not been to yet (the rest are automatic)
  cafes.json          cafés and food spots, with optional guide details
  stories/*.md        longer pieces
public/images/        your own photographs, one folder per café, trip or kind (see below)
```

The photo folders follow what the photo belongs to, so you can tell at a glance what is what:

```text
public/images/
  cafes/
    daksina-bhawan/     one folder per café: front-view.jpg, temple-bells.jpg, dosa.jpg ...
    pf-changs/          blossom-ceiling.jpg, spring-rolls.jpg ...
    costa-coffee/       mural-wall.jpg, serene-caramel-frappe.jpg, cheesecake.jpg ...
  art/                  house-on-the-hill.jpg, signed-on-the-back.jpg
  city/                 empty-metro-platform.jpg (street, skyline and transit shots that are not a trip)
  random-clicks/        lamp-over-the-pothos.jpg, plus a folder per place: ambience-mall/ (durga-pandal.jpg, flower-display.jpg), office-cafe/ (camera-and-cup.jpg, heart-latte.jpg)
  trips/<trip>/         photos from a trip (when there are trips)
  destinations/<place>/ photos from a place that belong to no café or trip
private-originals/      the same folders, holding your untouched originals (git-ignored, never published)
```

The file name is the short name of the shot (`front-view.jpg`), because the folder already says where it is from. The postcard's slug stays unique across the site (`daksina-front-view`), and its entry points at the file.

Slugs (`"slug"`) are lowercase words joined by single hyphens, for example `kyoto-morning`. They become URLs and are how files point at each other (`"trip": "paper-lanterns"`).

## Adding a postcard

1. Copy the photo into the folder it belongs to, for example `public/images/trips/paper-lanterns/kyoto-morning.jpg` (a café: `public/images/cafes/<cafe>/`; art: `public/images/art/`; anything else: `public/images/random-clicks/`). Keep the untouched original in the matching folder under `private-originals/`, named like `kyoto-morning__IMG_1234.JPEG`. Resize it to about 2400 px on the long edge first (smaller is fine) so the repo and the site stay light.
2. Add an entry to `postcards.json`:

```json
{
  "slug": "kyoto-morning",
  "title": "Kyoto, early",
  "image": "/images/trips/paper-lanterns/kyoto-morning.jpg",
  "alt": "A narrow street in Gion before the shops open, wet from rain",
  "category": "city",
  "place": "Gion",
  "city": "Kyoto",
  "country": "Japan",
  "lat": 35.0116,
  "lng": 135.7681,
  "date": "2025-04-06",
  "trip": "paper-lanterns",
  "destination": "kyoto",
  "tags": ["morning", "street"],
  "sample": false
}
```

Required: `slug`, `title`, `image`, `alt`, `category`. Everything else is optional and only shown when present. Width, height and an average colour are measured from the file for you. `alt` is mandatory: describe what is in the photo, in a sentence.

`sample: true` marks a stand-in photo. The site is open about those. Leave it out (or `false`) for your own photographs, and delete the sample entries when you no longer need them.

Other optional fields: `caption`, `note` (the text on the back of the postcard), `place` (the spot, such as a street or a viewpoint), `region`, `period` (such as `"Spring 2025"` when there is no exact date), `cafe`, `story`, `camera`, `credit`, `creditUrl`, `featured` (appears first on the home page and gallery).

Categories: `travel`, `city`, `cafe`, `food`, `getaway`, `art`, `random` (shown as "Random clicks"; the Art and Random clicks pages list these). For art, add `"artist": "Their Name"` to credit whoever made the piece, and optionally `"artistUrl": "https://www.instagram.com/their.handle/"` to link them (the back of the postcard then shows their name and `@handle`): it shows as "Artist" on the back of the postcard (`credit` is for a photographer who is not you).

A misspelt field name is caught and a likely correction suggested.

## A trip with an itinerary

In `trips.json`, add `days` to a trip. Every field of a stop except `place` is optional and appears only when filled in:

```json
"days": [
  {
    "title": "Arrival",
    "stops": [
      {
        "place": "Fushimi Inari",
        "time": "Early morning",
        "note": "Start before seven; the gates are empty.",
        "tip": "Walk past the first viewpoint, the crowd thins out.",
        "lat": 34.9671,
        "lng": 135.7727,
        "postcard": "kyoto-morning"
      }
    ]
  }
]
```

Stops with `lat` and `lng` are drawn on the route map beside the timeline, numbered in order. A stop with `postcard` shows that photograph on its map pin and in the timeline.

## A café or food spot

`cafes.json` entries accept `order` (your usual), `price` (as you would write it, such as `"around 4 euro"`), `seat` (the best seat), `wifi`, `map` (a link, https only), and your rating:

```json
"rating": 4.5,
"ratingNote": "Go for the ceiling, stay for the noodles."
```

`rating` is a number from 0.5 to 5 with at most one decimal (4, 4.5, 4.8). The last star is filled by the exact amount, so a 4.8 is five stars with the fifth almost full. It is drawn as five hand-drawn yellow stars (full, half, empty) on the café's guide card, which sits above the photograph, and as a small row on the café's card in the list. A café with a `map` link also gets an "Open in Maps" link in the details row under its name, next to its place. `ratingNote` is one handwritten line shown beside it. Only what you provide is shown, and with none of it the guide card is not shown at all.

A café page builds the rest itself from what you have written: the "Visited" date comes from the dates on its postcards, the handwritten caption under the cover photo is its `neighborhood`, and a "More cafés" strip links to others.

A single photograph can carry a rating too, for a dish, a drink or a view: add `"rating": 4` to that postcard in `postcards.json` and "My rating" appears on the back of the postcard.

## Places and the maps are automatic

You do not have to add a place by hand. Every `city` that a postcard carries becomes a place on the Places page, with its postcards, a cover photo, a pin on the globe and the flat map, and a page of its own at `/destinations/<city>`. Add a postcard with `"city": "Jaipur"` and Jaipur appears after the next rebuild.

Where the pin goes, in order: the `lat` and `lng` of the postcards from that city (their average), then the place's own `lat` and `lng` in `destinations.json`, then the city list in `scripts/gazetteer.json` (about forty cities; add a line for a new one). A postcard with no coordinates of its own sits at its place, and its back does not show the coordinates because they are approximate. If a city cannot be pinned the build says so ("... is listed under Places but not pinned on the map") and the place still appears in the list.

Cities that sit next to each other are grouped into a named **area** so the globe and the map show one pin with one name instead of a list: Delhi, Gurugram, Noida, Faridabad and Ghaziabad are "Delhi NCR". The list is `_regions` in `scripts/gazetteer.json` (add a line for another area), or give a place an `"area": "Name"` in `destinations.json`. The globe's list shows the area with its cities inside it as links, and every city keeps its own page and its place on the Places list.

Use `destinations.json` when you want a description, your own cover photo, or exact coordinates for a place; give the entry the same name as the city and the postcards attach to it. Cafés with a `city` attach to the matching place the same way.

## A place you have not been yet

In `destinations.json` set `"status": "planned"`. A planned place needs no cover photo and appears under "Dreaming of" and as a dashed pin on the map (give it `lat` and `lng`). When you go, change it to `"visited"` and add a cover.

## Stories

Add a Markdown file to `content/stories/`; the file name is the slug. It starts with a front matter block between `---` lines (`title`, `subtitle`, `excerpt`, `date`, `cover`, `coverAlt`, optional `trip`, `destination`, `featured`, as in the existing files), then the story in Markdown. To tie a postcard to a story, give the postcard `"story": "<story file name>"`; its back then links to the story. A story with a local cover needs no width or height.

## Photographs and the repository

Photos live in the repository only, in `public/images/`. The build never changes them. Prefer JPEG or WebP at 2400 px or less; Next resizes them per device when the page loads. Vercel's free plan includes 5,000 image transformations a month, so keep the number of different photos reasonable. Remove EXIF location data from photos if you do not want to publish where they were taken.

## Commands

```bash
npm run dev       # dev server; rebuilds the data whenever content/ or public/images/ changes
npm run content   # rebuild the data once and check it, without starting anything
npm run build     # production build (runs the same check first)
```

The generated file `src/content/generated/journal.json` is not committed. Never edit it.
