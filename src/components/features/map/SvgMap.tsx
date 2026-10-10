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
export function SvgMap({ pins, mode = "world", route = false, label }: SvgMapProps) {
  const fit = mode === "fit" && pins.length > 0;
  const H = fit ? 560 : 500;
  const pad = fit ? 90 : 14;

  let projection;
  if (fit) {
    // Fit the pins, but never closer than a region: two stops in one city should still show where
    // in the world they are. Smaller extents are widened around their centre.
    const lngs = pins.map((p) => p.lng);
    const lats = pins.map((p) => p.lat);
    const centre = [(Math.min(...lngs) + Math.max(...lngs)) / 2, (Math.min(...lats) + Math.max(...lats)) / 2];
    const halfLng = Math.max((Math.max(...lngs) - Math.min(...lngs)) / 2, 5);
    const halfLat = Math.max((Math.max(...lats) - Math.min(...lats)) / 2, 3);
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
  const spots = spread(located, cardW, cardH, W, H);
  const placed = located
    .map((item, i) => ({ ...item, cx: spots[i].cx, cy: spots[i].cy }))
    // Southern cards are drawn last, so where they still touch the nearer ones sit on top.
    .sort((a, b) => a.cy - b.cy);

  const routePath = route && pins.length > 1 ? path({ type: "LineString", coordinates: pins.map((p) => [p.lng, p.lat]) }) : null;

  return (
    <figure className={styles.map} data-route={route || undefined} role="group" aria-label={label} style={{ aspectRatio: `${W} / ${H}` } as CSSProperties}>
      <svg className={styles.svg} viewBox={`0 0 ${W} ${H}`} aria-hidden focusable="false" preserveAspectRatio="xMidYMid slice">
        {mode === "world" && <path d={graticulePath} className={styles.graticule} />}
        <path d={landPath} className={styles.land} />
        {routePath && <path d={routePath} className={styles.route} />}
        {placed.map(({ pin, x, y, cx, cy }) => (
          <g key={pin.id}>
            {/* A thread from the real spot to its postcard, so a moved card still points home */}
            <line x1={x} y1={y} x2={cx} y2={cy} className={styles.thread} />
            <circle cx={x} cy={y} r={route ? 5 : 4.5} className={styles.dot} data-planned={pin.planned || undefined} />
          </g>
        ))}
      </svg>

      <ul role="list" className={styles.pins}>
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
