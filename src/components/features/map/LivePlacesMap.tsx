"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { PlacePin } from "@/content/selectors";
import base from "./LiveRouteMap.module.css";
import styles from "./LivePlacesMap.module.css";
import { STYLE_URL, hasWebGL, loadMapLibre, thumbUrl } from "./maplibre";

interface LivePlacesMapProps {
  places: PlacePin[];
  label: string;
  /** The server-drawn world map: holds the space, shows while loading and stays if WebGL is missing. */
  children: ReactNode;
}

/** Places closer than this many pixels share one marker, so none is hidden under another. */
const MERGE_PX = 52;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
const sentence = (names: string[]) =>
  names.length < 3 ? names.join(" and ") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

/** One marker for one place: its photo, the number of postcards, and its name. */
function placeElement(place: PlacePin) {
  const el = document.createElement("a");
  el.href = place.href;
  el.className = styles.place;
  if (place.planned) el.dataset.planned = "true";
  el.setAttribute("aria-label", place.planned ? `${place.name}, still on the list` : `${place.name}, ${plural(place.count, "postcard")}`);

  const bubble = document.createElement("span");
  bubble.className = styles.bubble;
  if (place.image && !place.planned) {
    const img = document.createElement("img");
    img.src = thumbUrl(place.image.src);
    img.alt = "";
    img.width = 46;
    img.height = 46;
    img.decoding = "async";
    img.draggable = false;
    bubble.append(img);
  } else {
    bubble.textContent = "?";
  }
  el.append(bubble);

  if (place.count > 0) {
    const count = document.createElement("span");
    count.className = styles.count;
    count.textContent = String(place.count);
    count.setAttribute("aria-hidden", "true");
    el.append(count);
  }
  const name = document.createElement("span");
  name.className = styles.name;
  name.textContent = place.name;
  name.setAttribute("aria-hidden", "true");
  el.append(name);
  return el;
}

/** A group of nearby places: a number, a name for the group and a click that zooms in on them. */
function clusterElement(members: PlacePin[], onOpen: () => void) {
  const total = members.reduce((n, place) => n + place.count, 0);
  const areas = new Set(members.map((place) => place.area));
  const title = members.length > 0 && areas.size === 1 && members[0].area ? members[0].area : plural(members.length, "place");
  const el = document.createElement("button");
  el.type = "button";
  el.className = styles.place;
  el.dataset.cluster = "true";
  el.setAttribute("aria-label", `${title}: ${sentence(members.map((m) => m.name))}, ${plural(total, "postcard")}. Zoom in to see them apart.`);
  el.addEventListener("click", onOpen);

  const bubble = document.createElement("span");
  bubble.className = styles.bubble;
  bubble.textContent = String(members.length);
  const name = document.createElement("span");
  name.className = styles.name;
  name.textContent = title;
  name.setAttribute("aria-hidden", "true");
  el.append(bubble, name);
  return el;
}

/**
 * Every place with a postcard on a real map, so the places the globe merges into one dot can be told
 * apart. It opens on the places visited, groups towns that are close together (click a group to zoom
 * in), and starts only when near the screen. The server-drawn world map stays under it as the
 * placeholder and the fallback.
 */
export function LivePlacesMap({ places, label, children }: LivePlacesMapProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || places.length === 0 || !hasWebGL()) return;

    let cancelled = false;
    let map: MapLibreMap | undefined;
    let resizer: ResizeObserver | undefined;
    let markers: Marker[] = [];

    const start = async () => {
      try {
        const lib = await loadMapLibre();
        if (cancelled) return;

        const visited = places.filter((place) => !place.planned);
        const focus = visited.length > 0 ? visited : places;
        const bounds = new lib.LngLatBounds();
        for (const place of focus) bounds.extend([place.lng, place.lat]);

        map = new lib.Map({
          container: host,
          style: STYLE_URL,
          center: [focus[0].lng, focus[0].lat],
          zoom: 4,
          cooperativeGestures: true,
          attributionControl: { compact: true },
          pitchWithRotate: false,
          dragRotate: false,
          touchPitch: false,
        });
        map.touchZoomRotate.disableRotation();
        map.addControl(new lib.NavigationControl({ showCompass: false }), "top-right");

        const fit = () => map?.fitBounds(bounds, { padding: { top: 70, bottom: 70, left: 70, right: 70 }, maxZoom: 9, animate: false });
        fit();

        // Group the places that would sit under each other at the current zoom, and redraw on every move.
        const draw = () => {
          if (!map) return;
          markers.forEach((m) => m.remove());
          markers = [];
          // Start with one group per place, then keep merging the two groups whose centres are closest
          // while they are nearer than MERGE_PX, so a group's marker never lands on top of another.
          type Group = { members: { place: PlacePin; x: number; y: number }[]; x: number; y: number };
          const centre = (g: Group) => {
            g.x = g.members.reduce((n, m) => n + m.x, 0) / g.members.length;
            g.y = g.members.reduce((n, m) => n + m.y, 0) / g.members.length;
          };
          const groups: Group[] = [...places]
            .sort((a, b) => b.count - a.count)
            .map((place) => {
              const at = map!.project([place.lng, place.lat]);
              return { members: [{ place, x: at.x, y: at.y }], x: at.x, y: at.y };
            });
          for (;;) {
            let best: [number, number] | null = null;
            let bestDistance = MERGE_PX;
            for (let i = 0; i < groups.length; i++) {
              for (let j = i + 1; j < groups.length; j++) {
                const d = Math.hypot(groups[i].x - groups[j].x, groups[i].y - groups[j].y);
                if (d < bestDistance) {
                  bestDistance = d;
                  best = [i, j];
                }
              }
            }
            if (!best) break;
            const [i, j] = best;
            groups[i].members.push(...groups[j].members);
            centre(groups[i]);
            groups.splice(j, 1);
          }
          for (const group of groups) {
            const members = group.members.map((m) => m.place);
            const lat = members.reduce((n, m) => n + m.lat, 0) / members.length;
            const lng = members.reduce((n, m) => n + m.lng, 0) / members.length;
            const element =
              members.length === 1
                ? placeElement(members[0])
                : clusterElement(members, () => {
                    const box = new lib.LngLatBounds();
                    for (const member of members) box.extend([member.lng, member.lat]);
                    map?.fitBounds(box, { padding: 110, maxZoom: 13, duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 600 });
                  });
            markers.push(new lib.Marker({ element, anchor: "center" }).setLngLat([lng, lat]).addTo(map));
          }
        };

        let moved = false;
        map.on("movestart", (event) => {
          if (event.originalEvent) moved = true;
        });
        map.on("moveend", draw);
        resizer = new ResizeObserver(() => {
          map?.resize();
          if (!moved) fit();
        });
        resizer.observe(host);

        map.on("load", () => {
          if (cancelled) return;
          draw();
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
      map?.remove();
      setReady(false);
    };
  }, [places]);

  return (
    <div
      className={base.wrap}
      style={{ "--live-map-min": "clamp(26rem, 64svh, 40rem)" } as CSSProperties}
      data-ready={ready || undefined}
      role="group"
      aria-label={label}
    >
      <div className={base.fallback} aria-hidden={ready || undefined}>
        {children}
      </div>
      <div ref={hostRef} className={base.host} />
    </div>
  );
}
