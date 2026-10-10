/**
 * Builds the journal from what you author in `content/` and `public/images/`.
 *
 *   content/postcards.json     one entry per photograph
 *   content/trips.json         trips, with optional day-by-day itineraries
 *   content/destinations.json  places, visited or planned
 *   content/cafes.json         cafés and food spots, with optional guide details
 *   content/stories/*.md       stories (front matter + text)
 *   public/images/**           your photographs (commit them to git)
 *
 * It writes src/content/generated/journal.json, which the site imports. For local photographs it
 * reads the real size and average colour, so you never type width, height or colour. Anything
 * wrong (a typo in a field name, missing alt text, a link to something that does not exist)
 * stops the build with a message that says which file and which entry.
 *
 * Runs automatically before `dev`, `build` and `typecheck`. See content/README.md for the format.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(root, "content");
const imagesDir = join(root, "public", "images");
const outFile = join(root, "src", "content", "generated", "journal.json");

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const CATEGORIES = ["travel", "city", "cafe", "food", "getaway"];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const KEYS = {
  postcard: ["slug", "title", "caption", "note", "image", "alt", "width", "height", "color", "category", "place", "city", "region", "country", "lat", "lng", "date", "period", "trip", "destination", "cafe", "story", "tags", "camera", "credit", "creditUrl", "featured", "sample"],
  trip: ["slug", "title", "summary", "story", "cover", "coverAlt", "coverWidth", "coverHeight", "coverColor", "destination", "start", "end", "period", "featured", "sample", "days"],
  day: ["title", "stops"],
  stop: ["place", "time", "note", "tip", "lat", "lng", "postcard"],
  destination: ["slug", "name", "country", "region", "description", "cover", "coverAlt", "coverWidth", "coverHeight", "coverColor", "lat", "lng", "status", "sample"],
  cafe: ["slug", "name", "city", "country", "neighborhood", "destination", "cover", "coverAlt", "coverWidth", "coverHeight", "coverColor", "vibes", "notes", "order", "price", "seat", "wifi", "map", "sample"],
  story: ["title", "subtitle", "date", "excerpt", "cover", "coverAlt", "coverWidth", "coverHeight", "coverColor", "trip", "destination", "featured", "sample"],
};

export async function buildContent({ quiet = false } = {}) {
  const errors = [];
  const fail = (where, message) => errors.push(`${where}: ${message}`);
  const imageCache = new Map();

  /* ------------------------------------------------------------------------- readers */

  const readJson = (name) => {
    const file = join(contentDir, name);
    if (!existsSync(file)) return [];
    try {
      const data = JSON.parse(readFileSync(file, "utf8"));
      if (!Array.isArray(data)) {
        fail(`content/${name}`, "must be a list ([ ... ])");
        return [];
      }
      return data;
    } catch (error) {
      fail(`content/${name}`, `is not valid JSON (${error.message})`);
      return [];
    }
  };

  const checkKeys = (entry, allowed, where) => {
    for (const key of Object.keys(entry)) {
      if (!allowed.includes(key)) {
        const near = allowed.find((a) => a.toLowerCase().startsWith(key.toLowerCase().slice(0, 3)));
        fail(where, `unknown field "${key}"${near ? ` (did you mean "${near}"?)` : ""}`);
      }
    }
  };

  const str = (value, where, field, { required = false } = {}) => {
    if (value === undefined || value === null || value === "") {
      if (required) fail(where, `"${field}" is required`);
      return undefined;
    }
    if (typeof value !== "string") {
      fail(where, `"${field}" must be text`);
      return undefined;
    }
    return value.trim();
  };

  const coordinates = (lat, lng, where) => {
    if (lat === undefined && lng === undefined) return undefined;
    if (typeof lat !== "number" || typeof lng !== "number" || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      fail(where, "lat and lng must both be numbers (lat -90 to 90, lng -180 to 180)");
      return undefined;
    }
    return { lat, lng };
  };

  /* -------------------------------------------------------------------------- images */

  async function readLocalImage(rel, where) {
    const file = resolve(imagesDir, rel);
    if (!file.startsWith(imagesDir + sep)) {
      fail(where, `image path "${rel}" must stay inside public/images`);
      return null;
    }
    if (!existsSync(file)) {
      fail(where, `image file not found: public/images/${rel}`);
      return null;
    }
    if (imageCache.has(file)) return imageCache.get(file);
    try {
      const meta = await sharp(file).metadata();
      const swap = meta.orientation && meta.orientation >= 5;
      const raw = await sharp(file).rotate().resize(1, 1, { fit: "cover" }).removeAlpha().raw().toBuffer();
      const info = {
        width: swap ? meta.height : meta.width,
        height: swap ? meta.width : meta.height,
        color: "#" + [...raw.subarray(0, 3)].map((v) => v.toString(16).padStart(2, "0")).join(""),
      };
      imageCache.set(file, info);
      return info;
    } catch (error) {
      fail(where, `could not read image public/images/${rel} (${error.message})`);
      return null;
    }
  }

  /** `prefix` is "" for postcards ("image", "alt") or "cover" for covers ("cover", "coverAlt"). */
  async function resolveImage(entry, where, { srcKey, altKey, widthKey, heightKey, colorKey }) {
    const src = str(entry[srcKey], where, srcKey);
    if (!src) return null;
    const alt = str(entry[altKey], where, altKey, { required: true });
    if (!alt) return null;
    if (/^https?:\/\//.test(src)) {
      const { [widthKey]: width, [heightKey]: height, [colorKey]: color } = entry;
      if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
        fail(where, `a web image needs "${widthKey}" and "${heightKey}" (whole numbers); local photos are measured automatically`);
        return null;
      }
      return { src, alt, width, height, ...(color ? { color } : {}) };
    }
    const rel = src.replace(/^\/?(images\/)?/, "");
    const info = await readLocalImage(rel, where);
    return info ? { src: `/images/${rel}`, alt, ...info } : null;
  }

  const postcardKeys = { srcKey: "image", altKey: "alt", widthKey: "width", heightKey: "height", colorKey: "color" };
  const coverKeys = { srcKey: "cover", altKey: "coverAlt", widthKey: "coverWidth", heightKey: "coverHeight", colorKey: "coverColor" };

  /* ----------------------------------------------------------------------- collections */

  const seen = new Map();
  const claimSlug = (kind, slug, where) => {
    if (!slug) return false;
    if (!SLUG.test(slug)) return fail(where, `slug "${slug}" must be lowercase words joined by hyphens`), false;
    const key = `${kind}:${slug}`;
    if (seen.has(key)) return fail(where, `duplicate ${kind} slug "${slug}"`), false;
    seen.set(key, true);
    return true;
  };

  // Postcards
  const rawPostcards = readJson("postcards.json");
  const postcards = [];
  for (const [index, raw] of rawPostcards.entries()) {
    const where = `postcards.json #${index + 1}${raw.slug ? ` (${raw.slug})` : ""}`;
    checkKeys(raw, KEYS.postcard, where);
    const slug = str(raw.slug, where, "slug", { required: true });
    if (!claimSlug("postcard", slug, where)) continue;
    const title = str(raw.title, where, "title", { required: true });
    const image = await resolveImage(raw, where, postcardKeys);
    if (!image) {
      if (!raw.image) fail(where, `"image" is required (a file in public/images, e.g. "postcards/${slug}.jpg")`);
      continue;
    }
    if (!CATEGORIES.includes(raw.category)) {
      fail(where, `"category" must be one of: ${CATEGORIES.join(", ")}`);
      continue;
    }
    if (raw.date && !DATE.test(raw.date)) fail(where, `"date" must look like 2024-11-15`);
    const location = {
      placeName: str(raw.place, where, "place"),
      city: str(raw.city, where, "city"),
      region: str(raw.region, where, "region"),
      country: str(raw.country, where, "country"),
      coordinates: coordinates(raw.lat, raw.lng, where),
    };
    postcards.push({
      slug,
      title,
      caption: str(raw.caption, where, "caption"),
      note: str(raw.note, where, "note"),
      image,
      category: raw.category,
      location: Object.fromEntries(Object.entries(location).filter(([, v]) => v !== undefined)),
      takenOn: raw.date,
      periodLabel: str(raw.period, where, "period"),
      tripSlug: raw.trip,
      destinationSlug: raw.destination,
      cafeSlug: raw.cafe,
      storySlug: raw.story,
      tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
      camera: raw.camera,
      credit: str(raw.credit, where, "credit"),
      creditUrl: str(raw.creditUrl, where, "creditUrl"),
      isSample: raw.sample === true,
      featured: raw.featured === true,
      sortOrder: index + 1,
    });
  }

  const byGroup = (key) => {
    const map = new Map();
    for (const card of postcards) {
      const slug = card[key];
      if (!slug) continue;
      const list = map.get(slug) ?? [];
      list.push(card);
      map.set(slug, list);
    }
    return map;
  };
  const byTrip = byGroup("tripSlug");
  const byPlace = byGroup("destinationSlug");
  const byCafe = byGroup("cafeSlug");
  const pickCover = (cards) => {
    const card = cards?.find((c) => c.featured) ?? cards?.[0];
    return card ? card.image : undefined;
  };
  const cover = async (raw, where, fallbackCards, { optional = false } = {}) => {
    if (raw.cover) return (await resolveImage(raw, where, coverKeys)) ?? undefined;
    const derived = pickCover(fallbackCards);
    if (!derived && !optional) fail(where, `needs a "cover" (with "coverAlt") or at least one postcard linked to it`);
    return derived;
  };

  // Destinations
  const destinations = [];
  for (const [index, raw] of readJson("destinations.json").entries()) {
    const where = `destinations.json #${index + 1}${raw.slug ? ` (${raw.slug})` : ""}`;
    checkKeys(raw, KEYS.destination, where);
    const slug = str(raw.slug, where, "slug", { required: true });
    if (!claimSlug("destination", slug, where)) continue;
    const status = raw.status ?? "visited";
    if (!["visited", "planned"].includes(status)) fail(where, `"status" must be "visited" or "planned"`);
    const coverImage = await cover(raw, where, byPlace.get(slug), { optional: status === "planned" });
    destinations.push({
      slug,
      name: str(raw.name, where, "name", { required: true }),
      country: str(raw.country, where, "country", { required: true }),
      region: str(raw.region, where, "region"),
      description: str(raw.description, where, "description") ?? "",
      coverImage,
      coordinates: coordinates(raw.lat, raw.lng, where),
      status: status === "planned" ? "planned" : "visited",
      isSample: raw.sample === true,
      sortOrder: index + 1,
    });
  }

  // Trips (with itineraries)
  const trips = [];
  for (const [index, raw] of readJson("trips.json").entries()) {
    const where = `trips.json #${index + 1}${raw.slug ? ` (${raw.slug})` : ""}`;
    checkKeys(raw, KEYS.trip, where);
    const slug = str(raw.slug, where, "slug", { required: true });
    if (!claimSlug("trip", slug, where)) continue;
    const days = [];
    for (const [d, rawDay] of (raw.days ?? []).entries()) {
      const dayWhere = `${where}, day ${d + 1}`;
      checkKeys(rawDay, KEYS.day, dayWhere);
      const stops = [];
      for (const [s, rawStop] of (rawDay.stops ?? []).entries()) {
        const stopWhere = `${dayWhere}, stop ${s + 1}`;
        checkKeys(rawStop, KEYS.stop, stopWhere);
        stops.push({
          place: str(rawStop.place, stopWhere, "place", { required: true }) ?? "",
          time: str(rawStop.time, stopWhere, "time"),
          note: str(rawStop.note, stopWhere, "note"),
          tip: str(rawStop.tip, stopWhere, "tip"),
          coordinates: coordinates(rawStop.lat, rawStop.lng, stopWhere),
          postcardSlug: rawStop.postcard,
        });
      }
      days.push({ day: d + 1, title: str(rawDay.title, dayWhere, "title"), stops });
    }
    trips.push({
      slug,
      title: str(raw.title, where, "title", { required: true }),
      summary: str(raw.summary, where, "summary", { required: true }),
      story: str(raw.story, where, "story"),
      coverImage: await cover(raw, where, byTrip.get(slug)),
      destinationSlug: raw.destination,
      startDate: raw.start,
      endDate: raw.end,
      periodLabel: str(raw.period, where, "period"),
      days,
      isSample: raw.sample === true,
      featured: raw.featured === true,
      sortOrder: index + 1,
    });
  }

  // Cafés and food spots
  const cafes = [];
  for (const [index, raw] of readJson("cafes.json").entries()) {
    const where = `cafes.json #${index + 1}${raw.slug ? ` (${raw.slug})` : ""}`;
    checkKeys(raw, KEYS.cafe, where);
    const slug = str(raw.slug, where, "slug", { required: true });
    if (!claimSlug("cafe", slug, where)) continue;
    const map = str(raw.map, where, "map");
    if (map && !/^https:\/\//.test(map)) fail(where, `"map" must be a link starting with https://`);
    cafes.push({
      slug,
      name: str(raw.name, where, "name", { required: true }),
      city: str(raw.city, where, "city"),
      country: str(raw.country, where, "country"),
      neighborhood: str(raw.neighborhood, where, "neighborhood"),
      destinationSlug: raw.destination,
      coverImage: await cover(raw, where, byCafe.get(slug)),
      vibeTags: Array.isArray(raw.vibes) ? raw.vibes.map(String) : [],
      notes: str(raw.notes, where, "notes"),
      favoriteOrder: str(raw.order, where, "order"),
      price: str(raw.price, where, "price"),
      bestSeat: str(raw.seat, where, "seat"),
      wifi: str(raw.wifi, where, "wifi"),
      mapUrl: map,
      isSample: raw.sample === true,
      sortOrder: index + 1,
    });
  }

  // Stories (Markdown with a small front-matter block)
  const stories = [];
  const storyDir = join(contentDir, "stories");
  const storyFiles = existsSync(storyDir) ? readdirSync(storyDir).filter((f) => f.endsWith(".md")).sort() : [];
  for (const file of storyFiles) {
    const slug = file.replace(/\.md$/, "");
    const where = `stories/${file}`;
    if (!claimSlug("story", slug, where)) continue;
    const text = readFileSync(join(storyDir, file), "utf8").replace(/\r\n/g, "\n");
    const match = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!match) {
      fail(where, "must start with a --- front matter block");
      continue;
    }
    const meta = {};
    for (const line of match[1].split("\n")) {
      const at = line.indexOf(":");
      if (at < 1) continue;
      const key = line.slice(0, at).trim();
      const value = line.slice(at + 1).trim();
      const numeric = (key.endsWith("Width") || key.endsWith("Height")) && /^\d+$/.test(value);
      meta[key] = value === "true" ? true : value === "false" ? false : numeric ? Number(value) : value;
    }
    checkKeys(meta, KEYS.story, where);
    const body = match[2].trim();
    const words = body.split(/\s+/).filter(Boolean).length;
    const tripCards = byTrip.get(meta.trip);
    stories.push({
      slug,
      title: str(meta.title, where, "title", { required: true }),
      subtitle: str(meta.subtitle, where, "subtitle"),
      publishedAt: meta.date,
      readingTimeMinutes: Math.max(1, Math.round(words / 200)),
      excerpt: str(meta.excerpt, where, "excerpt") ?? body.split("\n\n")[0].slice(0, 180),
      body,
      coverImage: await cover(meta, where, tripCards),
      tripSlug: meta.trip,
      destinationSlug: meta.destination,
      isSample: meta.sample === true,
      featured: meta.featured === true,
      sortOrder: 0,
    });
  }
  stories.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "") || a.slug.localeCompare(b.slug));
  stories.forEach((story, i) => (story.sortOrder = i + 1));

  /* ------------------------------------------------------------------------ references */

  const exists = (kind, slug) => seen.has(`${kind}:${slug}`);
  const ref = (kind, slug, where, field) => {
    if (slug && !exists(kind, slug)) fail(where, `${field} "${slug}" does not exist`);
  };
  for (const p of postcards) {
    const where = `postcards.json (${p.slug})`;
    ref("trip", p.tripSlug, where, "trip");
    ref("destination", p.destinationSlug, where, "destination");
    ref("cafe", p.cafeSlug, where, "cafe");
    ref("story", p.storySlug, where, "story");
  }
  for (const t of trips) {
    ref("destination", t.destinationSlug, `trips.json (${t.slug})`, "destination");
    for (const day of t.days)
      for (const stop of day.stops) ref("postcard", stop.postcardSlug, `trips.json (${t.slug}), day ${day.day}`, "postcard");
  }
  for (const c of cafes) ref("destination", c.destinationSlug, `cafes.json (${c.slug})`, "destination");
  for (const s of stories) {
    ref("trip", s.tripSlug, `stories/${s.slug}.md`, "trip");
    ref("destination", s.destinationSlug, `stories/${s.slug}.md`, "destination");
  }

  if (errors.length > 0) {
    const shown = errors.slice(0, 30).map((e) => `  - ${e}`).join("\n");
    const more = errors.length > 30 ? `\n  ...and ${errors.length - 30} more` : "";
    throw new Error(`Content has ${errors.length} problem${errors.length === 1 ? "" : "s"}:\n${shown}${more}`);
  }

  // Drop undefined so the JSON is clean.
  const journal = JSON.parse(JSON.stringify({ postcards, trips, destinations, cafes, stories }));
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, JSON.stringify(journal));
  if (!quiet) {
    console.log(
      `content: ${postcards.length} postcards, ${trips.length} trips, ${destinations.length} places, ${cafes.length} cafés, ${stories.length} stories`,
    );
  }
  return journal;
}

// Run directly (`node scripts/build-content.mjs`) as the pre-dev / pre-build step.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  buildContent().catch((error) => {
    console.error(`\n${error.message}\n`);
    process.exit(1);
  });
}
