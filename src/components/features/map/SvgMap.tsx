import Link from "next/link";
import type { CSSProperties } from "react";
import { geoEqualEarth, geoGraticule10, geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import countries110 from "world-atlas/countries-110m.json";
import countries50 from "world-atlas/countries-50m.json";
import { Photo } from "@/components/ui/Photo";
import type { MapPin } from "@/content/selectors";
import styles from "./SvgMap.module.css";

interface SvgMapProps {
  pins: MapPin[];
  /** "world" shows the whole earth; "fit" zooms to the pins (for a trip's route). */
  mode?: "world" | "fit";
  /** Join the pins in order with a line and number them (an itinerary). */
  route?: boolean;
  /** Accessible name for the whole map. */
  label: string;
}

const W = 1000;
/** A small tilt per pin so the postcards look pinned by hand. */
const TILTS = [-6, 4, -3, 5, -4, 3, -5, 6];

/** Every country as one drawing: the fill is the land, the outlines between them are the borders. */
function countriesOf(topology: unknown) {
  const t = topology as Topology;
  return feature(t, t.objects.countries as GeometryCollection);
}
const WORLD = countriesOf(countries110);
const DETAIL = countriesOf(countries50);

interface Spot {
  /** The true position of the place, in map units. */
  x: number;
  y: number;
  /** Where the middle of its postcard ends up after spreading, in map units. */
  cx: number;
  cy: number;
}

/**
 * Spread postcards that would cover each other. Each card starts just above its place; any two
 * that overlap are pushed apart, and a weak pull keeps every card close to the spot it belongs
 * to. Pure arithmetic on the server, so the page ships no layout code.
 */
function spread(points: { x: number; y: number }[], w: number, h: number, width: number, height: number): Spot[] {
  const gap = 5;
  const spots: Spot[] = points.map((p) => ({ ...p, cx: p.x, cy: p.y - h / 2 - gap }));
  for (let pass = 0; pass < 140; pass++) {
    for (let i = 0; i < spots.length; i++) {
      for (let j = i + 1; j < spots.length; j++) {
        const a = spots[i];
        const b = spots[j];
        const dx = b.cx - a.cx;
        const dy = b.cy - a.cy;
        const overlapX = w + gap - Math.abs(dx);
        const overlapY = h + gap - Math.abs(dy);
        if (overlapX <= 0 || overlapY <= 0) continue;
        // Separate along the shorter way out
        if (overlapX < overlapY) {
          const push = (overlapX / 2) * (dx >= 0 ? 1 : -1);
          a.cx -= push;
          b.cx += push;
        } else {
          const push = (overlapY / 2) * (dy >= 0 ? 1 : -1);
          a.cy -= push;
          b.cy += push;
        }
      }
    }
    for (const s of spots) {
      // A gentle pull back toward the card's own spot, then keep it on the map
      s.cx += (s.x - s.cx) * 0.02;
      s.cy += (s.y - h / 2 - gap - s.cy) * 0.02;
      s.cx = Math.min(width - w / 2 - 4, Math.max(w / 2 + 4, s.cx));
      s.cy = Math.min(height - h / 2 - 4, Math.max(h / 2 + 4, s.cy));
    }
  }
  return spots;
}

/**
 * A flat map drawn as SVG on the server: land, a faint graticule, and the pins as small
 * postcards. No tile provider, no API key and no client JavaScript. Pins are real links placed
 * over the drawing, so they can be tabbed to and read by a screen reader.
 */
/** The map-unit box a fitted route needs: how far to zoom out, and how tall the map should be. */
function routeBox(pins: MapPin[], pad: number) {
  const lngs = pins.map((p) => p.lng);
  const lats = pins.map((p) => p.lat);
  const lngSpan = Math.max(...lngs) - Math.min(...lngs);
  const latSpan = Math.max(...lats) - Math.min(...lats);
  // Stops close together in one place still show where in the world they are (a region floor).
  // A route that really travels is shown at its own size, so its stops are not bunched in a corner.
  const travels = Math.max(lngSpan, latSpan) >= 0.25;
  const halfLng = Math.max(lngSpan / 2, travels ? 0.1 : 5);
  const halfLat = Math.max(latSpan / 2, travels ? 0.1 : 3);
  const mercY = (deg: number) => Math.log(Math.tan(Math.PI / 4 + (deg * Math.PI) / 360));
  const centreLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const tallness = (mercY(centreLat + halfLat) - mercY(centreLat - halfLat)) / ((halfLng * 2 * Math.PI) / 180);
  // Wide regions keep the standard height; a route running mostly north to south gets a taller map
  const height = tallness > 0.75 ? Math.min(900, Math.round((W - 2 * pad) * tallness + 2 * pad)) : 560;
  return { halfLng, halfLat, height };
}

/** Round steps for grid lines (degrees) and the scale bar (kilometres). */
const GRID_STEPS = [0.01, 0.02, 0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10];
const BAR_KM = [1, 2, 5, 10, 20, 50, 100, 200, 500];

const gridDecimals = (step: number) => (step >= 1 ? 0 : Math.abs(step * 10 - Math.round(step * 10)) < 1e-9 ? 1 : 2);

/**
 * A zoomed route has no coastline in view, so it gets what a printed map has instead: a coordinate
 * grid with its degrees, a scale bar and a north arrow. All of it is arithmetic on the projection.
 */
function surveyFor(projection: ReturnType<typeof geoMercator>, path: ReturnType<typeof geoPath>, H: number) {
  const tl = projection.invert?.([0, 0]);
  const br = projection.invert?.([W, H]);
  if (!tl || !br) return null;
  const [lngMin, latMax] = tl;
  const [lngMax, latMin] = br;
  const step = GRID_STEPS.find((s) => s >= Math.max(lngMax - lngMin, latMax - latMin) / 5) ?? 10;
  const dp = gridDecimals(step);

  const lines: string[] = [];
  const lngLabels: Array<{ text: string; x: number }> = [];
  const latLabels: Array<{ text: string; y: number }> = [];
  for (let lng = Math.ceil(lngMin / step) * step; lng <= lngMax; lng += step) {
    const d = path({ type: "LineString", coordinates: [[lng, latMin], [lng, latMax]] });
    const at = projection([lng, latMax]);
    if (d && at) {
      lines.push(d);
      lngLabels.push({ text: `${lng.toFixed(dp)}°E`, x: at[0] });
    }
  }
  for (let lat = Math.ceil(latMin / step) * step; lat <= latMax; lat += step) {
    const d = path({ type: "LineString", coordinates: [[lngMin, lat], [lngMax, lat]] });
    const at = projection([lngMin, lat]);
    if (d && at) {
      lines.push(d);
      latLabels.push({ text: `${lat.toFixed(dp)}°N`, y: at[1] });
    }
  }

  // Scale bar: how many map units one kilometre is, in the middle of the map
  const middle: [number, number] = [(lngMin + lngMax) / 2, (latMin + latMax) / 2];
  const a = projection(middle);
  const b = projection([middle[0] + 0.1, middle[1]]);
  if (!a || !b) return { lines, lngLabels, latLabels, bar: null };
  const unitsPerKm = (b[0] - a[0]) / (111.32 * Math.cos((middle[1] * Math.PI) / 180) * 0.1);
  const km = [...BAR_KM].reverse().find((k) => k * unitsPerKm <= 230) ?? BAR_KM[0];
  return { lines, lngLabels, latLabels, bar: { km, width: km * unitsPerKm } };
}

export function SvgMap({ pins, mode = "world", route = false, label }: SvgMapProps) {
  const fit = mode === "fit" && pins.length > 0;
  const pad = fit ? 90 : 14;
  const box = fit ? routeBox(pins, pad) : null;
  const H = box ? box.height : 500;

  let projection;
  if (fit && box) {
    const lngs = pins.map((p) => p.lng);
    const lats = pins.map((p) => p.lat);
    const centre = [(Math.min(...lngs) + Math.max(...lngs)) / 2, (Math.min(...lats) + Math.max(...lats)) / 2];
    const { halfLng, halfLat } = box;
    const points: [number, number][] = [
      [centre[0] - halfLng, centre[1] - halfLat],
      [centre[0] + halfLng, centre[1] + halfLat],
      ...pins.map((p): [number, number] => [p.lng, p.lat]),
    ];
    projection = geoMercator().fitExtent([[pad, pad], [W - pad, H - pad]], { type: "MultiPoint", coordinates: points });
    projection.clipExtent([[0, 0], [W, H]]);
  } else {
    projection = geoEqualEarth().fitExtent([[pad, pad], [W - pad, H - pad]], { type: "Sphere" });
  }
  const path = geoPath(projection);

  const landPath = path(fit ? DETAIL : WORLD) ?? "";
  const graticulePath = path(geoGraticule10()) ?? "";
  const located = pins
    .map((pin, index) => {
      const at = projection([pin.lng, pin.lat]);
      return at ? { pin, index, x: at[0], y: at[1] } : null;
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  // The size of a card in map units, matching its width in the stylesheet (about 5% of the map,
  // or about 8.5% on a route map)
  const cardW = route ? 88 : 52;
  const cardH = cardW * 1.14;
  // On a route, a stop with no photograph is a numbered marker on its spot, not an empty postcard
  const isPlain = (pin: MapPin) => route && !pin.image;
  const plain = located.filter((item) => isPlain(item.pin));
  const withCard = located.filter((item) => !isPlain(item.pin));
  const spots = spread(withCard, cardW, cardH, W, H);
  const placed = withCard
    .map((item, i) => ({ ...item, cx: spots[i].cx, cy: spots[i].cy }))
    // Southern cards are drawn last, so where they still touch the nearer ones sit on top.
    .sort((a, b) => a.cy - b.cy);

  const routePath = route && pins.length > 1 ? path({ type: "LineString", coordinates: pins.map((p) => [p.lng, p.lat]) }) : null;
  const survey = fit ? surveyFor(projection as ReturnType<typeof geoMercator>, path, H) : null;

  return (
    <figure className={styles.map} data-route={route || undefined} data-fit={fit || undefined} role="group" aria-label={label} style={{ aspectRatio: `${W} / ${H}` } as CSSProperties}>
      <svg className={styles.svg} viewBox={`0 0 ${W} ${H}`} aria-hidden focusable="false" preserveAspectRatio="xMidYMid slice">
        {mode === "world" && <path d={graticulePath} className={styles.graticule} />}
        <path d={landPath} className={styles.land} />
        {survey && survey.lines.map((d, i) => <path key={i} d={d} className={styles.gridLine} />)}
        {routePath && <path d={routePath} className={styles.route} />}
        {placed.map(({ pin, x, y, cx, cy }) => (
          <g key={pin.id}>
            {/* A thread from the real spot to its postcard, so a moved card still points home */}
            <line x1={x} y1={y} x2={cx} y2={cy} className={styles.thread} />
            <circle cx={x} cy={y} r={route ? 5 : 4.5} className={styles.dot} data-planned={pin.planned || undefined} />
          </g>
        ))}
      </svg>

      {survey && (
        <div className={styles.survey} aria-hidden>
          {survey.lngLabels.map((l) => (
            <span key={l.text} className={styles.gridLabel} data-axis="lng" style={{ left: `${(l.x / W) * 100}%` }}>
              {l.text}
            </span>
          ))}
          {survey.latLabels.map((l) => (
            <span key={l.text} className={styles.gridLabel} data-axis="lat" style={{ top: `${(l.y / H) * 100}%` }}>
              {l.text}
            </span>
          ))}
          {survey.bar && (
            <span className={styles.scale} style={{ width: `${(survey.bar.width / W) * 100}%` }}>
              <span className={styles.scaleLabel}>{survey.bar.km} km</span>
            </span>
          )}
          <span className={styles.north}>N</span>
        </div>
      )}

      <ul role="list" className={styles.pins}>
        {plain.map(({ pin, index, x, y }) => {
          const number = pin.number ?? index + 1;
          const name = pin.label.replace(/^\d+\.\s*/, "");
          return (
            <li key={pin.id} className={styles.stopMark} data-flip={x / W > 0.6 || undefined} style={{ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` }}>
              {pin.href ? (
                <Link href={pin.href} className={styles.stopLink} aria-label={pin.label}>
                  <span className={styles.stopNum} aria-hidden>{number}</span>
                  <span className={styles.stopName} aria-hidden>{name}</span>
                </Link>
              ) : (
                <span className={styles.stopLink}>
                  <span className={styles.stopNum} aria-hidden>{number}</span>
                  <span className={styles.stopName}>{name}</span>
                </span>
              )}
            </li>
          );
        })}
        {placed.map(({ pin, index, cx, cy }) => {
          const number = pin.number ?? index + 1;
          const postcard = (
            <>
              <span className={styles.card} data-planned={pin.planned || undefined} style={{ rotate: `${TILTS[index % TILTS.length]}deg` }} aria-hidden>
                {pin.image ? (
                  <Photo image={pin.image} ratio="1 / 1" sizes="64px" decorative />
                ) : (
                  <span className={styles.blank}>{route ? number : pin.planned ? "?" : ""}</span>
                )}
                {route && pin.image && <span className={styles.badge}>{number}</span>}
              </span>
              <span className={styles.tag}>{pin.label}</span>
            </>
          );
          return (
            <li key={pin.id} className={styles.pin} data-low={cy / H > 0.84 || undefined} style={{ left: `${(cx / W) * 100}%`, top: `${(cy / H) * 100}%` }}>
              {pin.href ? (
                <Link href={pin.href} className={styles.link} aria-label={`${pin.label}${pin.planned ? " (planned)" : ""}`}>
                  {postcard}
                </Link>
              ) : (
                <span className={styles.link}>
                  {postcard}
                  <span className="visually-hidden">{pin.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
