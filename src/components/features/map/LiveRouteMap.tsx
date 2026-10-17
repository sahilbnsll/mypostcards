"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { LngLatBounds, Map as MapLibreMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MapPin } from "@/content/selectors";
import styles from "./LiveRouteMap.module.css";
import { STYLE_URL, hasWebGL, loadMapLibre, thumbUrl } from "./maplibre";

interface LiveRouteMapProps {
  pins: MapPin[];
  label: string;
  /** The server-drawn map. It holds the space, shows until the live map is ready, and stays if WebGL is missing. */
  children: ReactNode;
  /** The stop the reader is on, shown larger. */
  activeNumber?: number | null;
  /** A stop being pointed at in the list, shown larger without moving the map. */
  hoverNumber?: number | null;
  /** Show one day's route in full colour and fade the rest; null shows the whole route. */
  focusDay?: number | null;
  /** Ease the map over to the active stop as it changes. */
  follow?: boolean;
  /** Bring the map to one stop once, whatever `follow` says (the `at` value tells one request from the next). */
  focusRequest?: { number: number; at: number } | null;
  /** A marker was chosen on the map. */
  onSelect?: (number: number) => void;
}

const ROUTE_COLOR = "#d23a30";
const PADDING = { top: 84, bottom: 64, left: 64, right: 64 };
/** Photos closer than this many pixels on screen are fanned out sideways so none hides another. */
const CARD_PX = 50;
const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** A postcard (photo, number) or, for a stop with no photo, a numbered dot with its name. */
function markerElement(pin: MapPin, index: number) {
  const number = pin.number ?? index + 1;
  const name = pin.label.replace(/^\d+\.\s*/, "");
  const el = document.createElement(pin.href ? "a" : "span");
  if (el instanceof HTMLAnchorElement && pin.href) el.href = pin.href;
  el.setAttribute("aria-label", pin.label);
  el.className = styles.marker;
  el.dataset.kind = pin.image ? "photo" : "plain";

  const badge = document.createElement("span");
  badge.className = styles.badge;
  badge.textContent = String(number);
  badge.setAttribute("aria-hidden", "true");

  if (pin.image) {
    const card = document.createElement("span");
    card.className = styles.card;
    card.style.rotate = `${[-5, 4, -3, 5][index % 4]}deg`;
    const img = document.createElement("img");
    img.src = thumbUrl(pin.image.src);
    img.alt = "";
    img.width = 56;
    img.height = 56;
    img.decoding = "async";
    img.draggable = false;
    card.append(img);
    el.append(card, badge);
  } else {
    const chip = document.createElement("span");
    chip.className = styles.name;
    chip.textContent = name;
    chip.setAttribute("aria-hidden", "true");
    el.append(badge, chip);
  }
  return el;
}

/** Opacity of the route for a focused day: the day in full, the rest faded (-1 means no focus). */
const opacityFor = (focus: number, full: number) => ["case", ["==", focus, -1], full, ["==", ["get", "day"], focus], full, 0.18];

/**
 * The route on a real map: OpenStreetMap tiles through MapLibre GL and OpenFreeMap, the same
 * combination as the author's portfolio. It starts only when the map is near the screen, loads
 * the library on demand, and fades in over the server-drawn map, which remains the fallback
 * (no WebGL, blocked tiles, or JavaScript off). Scrolling the page never zooms the map by accident:
 * zoom needs ctrl or two fingers.
 *
 * The page around it can drive it: highlight a stop, focus one day (zoom to it, fade the rest of
 * the route) and ease the map along with the reader. With reduced motion every move is instant.
 */
export function LiveRouteMap({ pins, label, children, activeNumber = null, hoverNumber = null, focusDay = null, follow = false, focusRequest = null, onSelect }: LiveRouteMapProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const mapRef = useRef<MapLibreMap | null>(null);
  const libRef = useRef<Awaited<ReturnType<typeof loadMapLibre>> | null>(null);
  const markerEls = useRef(new Map<number, HTMLElement>());
  const markerObjs = useRef(new Map<number, Marker>());
  const viewRef = useRef<LngLatBounds | null>(null);
  const firstFocus = useRef(true);
  /** When a day was last fitted, so following the reader does not undo that view a moment later. */
  const fittedAt = useRef(0);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || pins.length === 0 || !hasWebGL()) return;

    let cancelled = false;
    let map: MapLibreMap | undefined;
    let resizer: ResizeObserver | undefined;
    const markers: Marker[] = [];
    const elements = markerEls.current;
    const objects = markerObjs.current;

    const start = async () => {
      try {
        const lib = await loadMapLibre();
        if (cancelled) return;
        libRef.current = lib;

        map = new lib.Map({
          container: host,
          style: STYLE_URL,
          center: [pins[0].lng, pins[0].lat],
          zoom: 8,
          cooperativeGestures: true,
          attributionControl: { compact: true },
          pitchWithRotate: false,
          dragRotate: false,
          touchPitch: false,
        });
        mapRef.current = map;
        map.touchZoomRotate.disableRotation();
        map.addControl(new lib.NavigationControl({ showCompass: false }), "top-right");

        const bounds = new lib.LngLatBounds();
        for (const pin of pins) bounds.extend([pin.lng, pin.lat]);
        viewRef.current = bounds;
        const fit = () => {
          if (viewRef.current) map?.fitBounds(viewRef.current, { padding: PADDING, maxZoom: 12, animate: false });
        };
        fit();

        // The page may still be laying out when the map starts (images, fonts, the sticky column):
        // measure again whenever the box changes, and keep the current view (the whole route, or the
        // focused day) in place until the visitor moves the map themselves.
        let moved = false;
        map.on("movestart", (event) => {
          if (event.originalEvent) moved = true;
        });
        resizer = new ResizeObserver(() => {
          map?.resize();
          if (!moved) fit();
        });
        resizer.observe(host);

        map.on("load", () => {
          if (cancelled || !map) return;
          // One piece of line per leg, each tagged with the day it belongs to, so a day can be picked out
          const legs = pins.slice(1).map((pin, i) => ({
            type: "Feature" as const,
            properties: { day: pin.day ?? 0 },
            geometry: { type: "LineString" as const, coordinates: [[pins[i].lng, pins[i].lat], [pin.lng, pin.lat]] },
          }));
          map.addSource("route", { type: "geojson", data: { type: "FeatureCollection", features: legs } });
          map.addLayer({
            id: "route-casing",
            type: "line",
            source: "route",
            layout: { "line-cap": "round", "line-join": "round" },
            paint: { "line-color": "#ffffff", "line-width": 6, "line-opacity": 0.85 },
          });
          map.addLayer({
            id: "route-line",
            type: "line",
            source: "route",
            layout: { "line-cap": "round", "line-join": "round" },
            paint: { "line-color": ROUTE_COLOR, "line-width": 2.5, "line-dasharray": [2, 1.6], "line-opacity": 1 },
          });

          // The exact spot of every stop, drawn on the map itself so a photo can stand beside its spot
          map.addSource("stops", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: pins.map((pin) => ({
                type: "Feature" as const,
                properties: {},
                geometry: { type: "Point" as const, coordinates: [pin.lng, pin.lat] },
              })),
            },
          });
          map.addLayer({
            id: "stop-dots",
            type: "circle",
            source: "stops",
            paint: { "circle-radius": 4.5, "circle-color": ROUTE_COLOR, "circle-stroke-width": 2, "circle-stroke-color": "#ffffff" },
          });

          pins.forEach((pin, index) => {
            const number = pin.number ?? index + 1;
            const element = markerElement(pin, index);
            // On a page that handles it, choosing a marker picks the stop instead of jumping by hash
            element.addEventListener("click", (event) => {
              if (!onSelectRef.current) return;
              event.preventDefault();
              onSelectRef.current(number);
            });
            elements.set(number, element);
            // A photo sits above its spot; a plain stop puts its numbered dot on the spot, name to the right
            const marker = new lib.Marker({
              element,
              anchor: pin.image ? "bottom" : "left",
              offset: pin.image ? [0, -7] : [-11, 0],
            })
              .setLngLat([pin.lng, pin.lat])
              .addTo(map!);
            markers.push(marker);
            objects.set(number, marker);
          });

          // Photos that would sit on top of each other at this zoom are fanned out sideways, and settle
          // back as the map zooms in far enough to pull their spots apart
          const fan = () => {
            if (!map) return;
            const photos = pins
              .map((pin, index) => ({ pin, number: pin.number ?? index + 1, at: map!.project([pin.lng, pin.lat]) }))
              .filter((item) => item.pin.image);
            const groups: (typeof photos)[] = [];
            for (const item of photos) {
              const group = groups.find((g) => g.some((other) => Math.hypot(other.at.x - item.at.x, other.at.y - item.at.y) < CARD_PX));
              if (group) group.push(item);
              else groups.push([item]);
            }
            for (const group of groups) {
              group.forEach((item, i) => objects.get(item.number)?.setOffset([(i - (group.length - 1) / 2) * (CARD_PX - 4), -7]));
            }
          };
          fan();
          map.on("moveend", fan);
          setReady(true);
        });
      } catch {
        // The library or style could not load: the server-drawn map stays.
      }
    };

    // Load the library only once the map is about to be seen.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        void start();
      },
      { rootMargin: "300px" },
    );
    io.observe(host);

    return () => {
      cancelled = true;
      io.disconnect();
      resizer?.disconnect();
      markers.forEach((m) => m.remove());
      elements.clear();
      objects.clear();
      map?.remove();
      mapRef.current = null;
      libRef.current = null;
      firstFocus.current = true;
      setReady(false);
    };
  }, [pins]);

  // Larger markers for the stop the reader is on and the one being pointed at; fade other days
  useEffect(() => {
    if (!ready) return;
    const dayOf = new Map(pins.map((pin, index) => [pin.number ?? index + 1, pin.day]));
    markerEls.current.forEach((el, number) => {
      el.toggleAttribute("data-active", number === activeNumber);
      el.toggleAttribute("data-hover", number === hoverNumber);
      el.toggleAttribute("data-dim", focusDay !== null && dayOf.get(number) !== focusDay);
    });
  }, [ready, pins, activeNumber, hoverNumber, focusDay]);

  // Focus a day: its route in full colour, the rest faded, and the map fitted to it
  useEffect(() => {
    const map = mapRef.current;
    const lib = libRef.current;
    if (!ready || !map || !lib) return;
    const focus = focusDay ?? -1;
    map.setPaintProperty("route-line", "line-opacity", opacityFor(focus, 1) as never);
    map.setPaintProperty("route-casing", "line-opacity", opacityFor(focus, 0.85) as never);
    const inDay = pins.filter((pin) => focus === -1 || pin.day === focus);
    if (inDay.length === 0) return;
    const bounds = new lib.LngLatBounds();
    for (const pin of inDay) bounds.extend([pin.lng, pin.lat]);
    viewRef.current = bounds;
    // The first pass only sets the view the map already has
    const instant = firstFocus.current || prefersReducedMotion();
    firstFocus.current = false;
    fittedAt.current = performance.now();
    map.fitBounds(bounds, { padding: PADDING, maxZoom: 12, duration: instant ? 0 : 700 });
  }, [ready, pins, focusDay]);

  // Ease the map over to the stop the reader has reached
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !follow || activeNumber === null) return;
    const pin = pins.find((p, index) => (p.number ?? index + 1) === activeNumber);
    if (!pin) return;
    // Choosing a day shows the whole day first; following starts again once the reader scrolls on
    if (performance.now() - fittedAt.current < 1500) return;
    map.easeTo({ center: [pin.lng, pin.lat], zoom: Math.max(map.getZoom(), 9.5), duration: prefersReducedMotion() ? 0 : 900 });
  }, [ready, pins, follow, activeNumber]);

  // Bring the map to a stop that was asked for
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !focusRequest) return;
    const pin = pins.find((p, index) => (p.number ?? index + 1) === focusRequest.number);
    if (!pin) return;
    map.easeTo({ center: [pin.lng, pin.lat], zoom: Math.max(map.getZoom(), 10), duration: prefersReducedMotion() ? 0 : 900 });
  }, [ready, pins, focusRequest]);

  return (
    <div className={styles.wrap} data-ready={ready || undefined} role="group" aria-label={label}>
      <div className={styles.fallback} aria-hidden={ready || undefined}>
        {children}
      </div>
      <div ref={hostRef} className={styles.host} />
    </div>
  );
}
