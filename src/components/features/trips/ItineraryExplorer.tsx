"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { LiveRouteMap } from "@/components/features/map/LiveRouteMap";
import { Photo } from "@/components/ui/Photo";
import type { MapPin } from "@/content/selectors";
import type { ImageAsset } from "@/content/types";
import { plural } from "@/lib/utils";
import styles from "./Itinerary.module.css";

export interface ExplorerStop {
  /** Numbered across the whole trip, the same number the map shows. */
  number: number;
  place: string;
  time?: string;
  note?: string;
  tip?: string;
  card?: { slug: string; title: string; image: ImageAsset };
}

export interface ExplorerDay {
  day: number;
  title?: string;
  stops: ExplorerStop[];
}

interface ItineraryExplorerProps {
  tripTitle: string;
  days: ExplorerDay[];
  pins: MapPin[];
  mapLabel: string;
  /** The server-drawn map, kept under the live one as its placeholder and fallback. */
  children: ReactNode;
}

type DayChoice = number | "all";

const DESKTOP = "(min-width: 62rem)";
const REDUCED = "(prefers-reduced-motion: reduce)";
/** The reading line: how far down the screen (as a fraction) a stop's top must have come to count as reached. */
const READING_LINE = 0.4;
const prefersReducedMotion = () => window.matchMedia(REDUCED).matches;

/** A media query as a value that follows the screen (false while rendering on the server). */
function useMedia(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** "Sunday 17 May: Jaipur to Kasol" gives { date: "17 May", place: "Jaipur to Kasol" }. */
function parseTitle(title: string | undefined) {
  if (!title) return {};
  const [head, ...rest] = title.split(":");
  const date = /(\d{1,2}\s+[A-Za-z]+)/.exec(head)?.[1];
  return { date, place: rest.length > 0 ? rest.join(":").trim() : head.trim() };
}

/**
 * The itinerary and its route map as one thing. A row of day buttons shows one day (or all) and
 * zooms the map to it. On a wide screen the stop the reader has scrolled to is lit on the map, and
 * the map can ease along with them (a switch turns that off, and reduced motion starts it off).
 * Pointing at a stop previews it on the map; choosing a stop's number, or a marker on the map,
 * takes you to the other. Nothing here takes over the scroll.
 */
export function ItineraryExplorer({ tripTitle, days, pins, mapLabel, children }: ItineraryExplorerProps) {
  const [day, setDay] = useState<DayChoice>("all");
  const [active, setActive] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  // null until the reader uses the switch; then reduced motion starts it off and everyone else on
  const [followChoice, setFollowChoice] = useState<boolean | null>(null);
  const desktop = useMedia(DESKTOP);
  const reduced = useMedia(REDUCED);
  const follow = followChoice ?? !reduced;
  const [focusRequest, setFocusRequest] = useState<{ number: number; at: number } | null>(null);
  const requests = useRef(0);
  /** While the page scrolls to a stop that was chosen, the scroll tracking must not pick a different one on the way. */
  const standDownUntil = useRef(0);
  const listRef = useRef<HTMLOListElement>(null);

  const pinned = useMemo(() => new Set(pins.map((pin, index) => pin.number ?? index + 1)), [pins]);
  const dayOfStop = useMemo(() => new Map(days.flatMap((d) => d.stops.map((stop) => [stop.number, d.day] as const))), [days]);

  // The reader is on the last stop whose top has gone past a line at 40% of the screen. Working it out
  // from where the stops are (not from which one happens to cross a band) means a quick scroll can
  // never skip a short stop.
  useEffect(() => {
    const list = listRef.current;
    if (!list || !desktop) return;
    // Run on every scroll event (fourteen position reads, no waiting on a frame that might never come)
    const pick = () => {
      if (performance.now() < standDownUntil.current) return;
      const line = window.innerHeight * READING_LINE;
      let current: number | null = null;
      for (const el of list.querySelectorAll<HTMLElement>("[data-stop]")) {
        if (el.offsetParent === null) continue; // a day that is hidden
        if (el.getBoundingClientRect().top <= line) current = Number(el.dataset.stop);
        else break;
      }
      setActive((previous) => (previous === current ? previous : current));
    };
    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", pick);
    const first = window.setTimeout(pick, 0);
    return () => {
      window.removeEventListener("scroll", pick);
      window.removeEventListener("resize", pick);
      window.clearTimeout(first);
    };
  }, [desktop, day]);

  // Scroll so the stop's top sits just above the reading line, which is exactly where the scroll tracking
  // above would call it reached, so the stop that was chosen is the one that stays lit
  const scrollToStop = useCallback((number: number) => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-stop="${number}"]`);
    if (!el) return;
    const top = window.scrollY + el.getBoundingClientRect().top - window.innerHeight * READING_LINE + 4;
    window.scrollTo({ top: Math.max(0, top), behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, []);

  // A marker on the map: show its day if that day is hidden, then bring its stop into view
  const selectFromMap = useCallback(
    (number: number) => {
      const owner = dayOfStop.get(number);
      if (owner !== undefined && day !== "all" && day !== owner) setDay(owner);
      setActive(number);
      standDownUntil.current = performance.now() + 1600;
      // let a newly shown day render before scrolling to it
      window.requestAnimationFrame(() => scrollToStop(number));
    },
    [day, dayOfStop, scrollToStop],
  );

  // A stop's number: light it on the map and bring the map to it, even with following switched off
  const showOnMap = (number: number) => {
    setActive(number);
    requests.current += 1;
    setFocusRequest({ number, at: requests.current });
  };

  return (
    <div className={styles.explorer}>
      <div className={styles.controls}>
        <div className={styles.chips} role="group" aria-label="Show which day">
          <button type="button" className={styles.chip} aria-pressed={day === "all"} onClick={() => setDay("all")}>
            <span className={styles.chipMain}>All days</span>
          </button>
          {days.map((d) => {
            const { date, place } = parseTitle(d.title);
            return (
              <button
                key={d.day}
                type="button"
                className={styles.chip}
                aria-pressed={day === d.day}
                aria-label={`Day ${d.day}${date ? `, ${date}` : ""}${place ? `, ${place}` : ""}`}
                onClick={() => setDay(d.day)}
              >
                <span className={styles.chipMain}>Day {d.day}</span>
                {date && <span className={styles.chipSub}>{date}</span>}
              </button>
            );
          })}
        </div>

        <label className={styles.follow}>
          <input type="checkbox" role="switch" checked={follow} onChange={(event) => setFollowChoice(event.target.checked)} />
          <span className={styles.track} aria-hidden />
          <span>Map follows my scrolling</span>
        </label>
      </div>

      <div className={styles.layout}>
        <ol ref={listRef} role="list" className={styles.days} aria-label={`Itinerary for ${tripTitle}`}>
          {days.map((d) => {
            const { date, place } = parseTitle(d.title);
            return (
              <li key={d.day} className={styles.day} hidden={day !== "all" && day !== d.day}>
                <h3 className={styles.dayTitle}>
                  <span className={styles.dayNumber}>Day {d.day}</span>
                  {d.title && (
                    <span className={styles.dayName}>
                      {place ?? d.title}
                      {date && <span className={styles.dayDate}>{date}</span>}
                    </span>
                  )}
                  <span className={styles.dayCount}>{plural(d.stops.length, "stop")}</span>
                </h3>

                <ol role="list" className={styles.stops}>
                  {d.stops.map((stop) => {
                    const onMap = pinned.has(stop.number);
                    return (
                      <li
                        key={stop.number}
                        id={`day-${d.day}-stop-${stop.number}`}
                        data-stop={stop.number}
                        className={styles.stop}
                        data-active={active === stop.number || undefined}
                        onPointerEnter={(event) => event.pointerType === "mouse" && onMap && setHover(stop.number)}
                        onPointerLeave={(event) => event.pointerType === "mouse" && setHover((current) => (current === stop.number ? null : current))}
                      >
                        {onMap && desktop ? (
                          <button
                            type="button"
                            className={styles.marker}
                            aria-label={`Show ${stop.place} on the map`}
                            onClick={() => showOnMap(stop.number)}
                            onFocus={() => setHover(stop.number)}
                            onBlur={() => setHover((current) => (current === stop.number ? null : current))}
                          >
                            {stop.number}
                          </button>
                        ) : (
                          <span className={styles.marker} data-plain aria-hidden>
                            {stop.number}
                          </span>
                        )}

                        <div className={styles.body}>
                          <div className={styles.text}>
                            <p className={styles.place}>
                              {stop.place}
                              {stop.time && <span className={styles.time}>{stop.time}</span>}
                            </p>
                            {stop.note && <p className={styles.note}>{stop.note}</p>}
                            {stop.tip && (
                              <p className={styles.tip}>
                                <span className={styles.tipLabel}>Tip</span> {stop.tip}
                              </p>
                            )}
                          </div>

                          {stop.card && (
                            <Link href={`/postcards/${stop.card.slug}`} className={styles.print}>
                              <Photo image={stop.card.image} ratio="4 / 5" sizes="96px" decorative />
                              <span className={styles.printTitle}>{stop.card.title}</span>
                            </Link>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </li>
            );
          })}
        </ol>

        <div className={styles.map}>
          <LiveRouteMap
            pins={pins}
            label={mapLabel}
            activeNumber={active}
            hoverNumber={hover}
            focusDay={day === "all" ? null : day}
            follow={follow && desktop}
            focusRequest={focusRequest}
            onSelect={selectFromMap}
          >
            {children}
          </LiveRouteMap>
        </div>
      </div>
    </div>
  );
}
