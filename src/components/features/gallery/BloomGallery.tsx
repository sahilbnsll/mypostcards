"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { LoadMore } from "@/components/ui/LoadMore";
import { Photo } from "@/components/ui/Photo";
import { PlayBadge } from "@/components/ui/PostcardMedia";
import { Select } from "@/components/ui/Select";
import { CATEGORIES, CATEGORY_BY_ID } from "@/content/categories";
import type { Category } from "@/content/types";
import { Lightbox } from "@/components/features/lightbox/Lightbox";
import { useLightbox } from "@/components/features/lightbox/useLightbox";
import type { LightboxItem } from "@/components/features/lightbox/types";
import { formatLocation, plural } from "@/lib/utils";
import { reveal } from "@/lib/reveal";
import styles from "./BloomGallery.module.css";

type Filter = Category | "all";
type SortOption = "default" | "newest" | "oldest" | "place";

interface BloomGalleryProps {
  items: LightboxItem[];
  /** Show the category chips and filter bar. Off for trip and place pages, where the set is already narrow. */
  filterable?: boolean;
  /** Keep the chips pinned under the header while the gallery scrolls past. */
  stickyFilters?: boolean;
  /** Show this many photographs first and the rest on request. Filtering shows every match. 0 shows all. */
  pageSize?: number;
}

const SIZES = "(min-width: 75rem) 25vw, (min-width: 52rem) 33vw, 50vw";

/** The column counts the gallery can show; the stylesheet picks one by screen width. */
const COLUMN_COUNTS = [2, 3, 4] as const;

/**
 * Deal the photos into columns, each one into whichever column is shortest so far. CSS columns
 * balance by total height instead, so a few tall photographs can leave the last column empty;
 * this way every column is used, and the order still reads down each column in turn.
 */
function deal<T extends { image: { width: number; height: number } }>(items: readonly T[], count: number): Array<Array<{ item: T; index: number }>> {
  const columns: Array<Array<{ item: T; index: number }>> = Array.from({ length: count }, () => []);
  const heights = new Array<number>(count).fill(0);
  items.forEach((item, index) => {
    let shortest = 0;
    for (let c = 1; c < count; c++) if (heights[c] < heights[shortest] - 0.001) shortest = c;
    columns[shortest].push({ item, index });
    // Height relative to the column width, plus a little for the gap between photos
    heights[shortest] += item.image.height / item.image.width + 0.04;
  });
  return columns;
}

export function BloomGallery({ items, filterable = true, stickyFilters = false, pageSize = 0 }: BloomGalleryProps) {
  const [limit, setLimit] = useState(pageSize);
  const [filter, setFilter] = useState<Filter>("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("default");

  // The colour layer is only mounted once someone is likely to use the filter.
  const [prepared, setPrepared] = useState(false);
  const [hover, setHover] = useState<{ slug: string; x: number; y: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const counts = useMemo(() => {
    const map = new Map<Category, number>();
    for (const item of items) map.set(item.category, (map.get(item.category) ?? 0) + 1);
    return map;
  }, [items]);

  const choices: Filter[] = useMemo(
    () => ["all", ...CATEGORIES.map((c) => c.id).filter((id) => (counts.get(id) ?? 0) > 0)],
    [counts],
  );

  // Extract top mood tags (strictly count >= 2, max 6 moods)
  const tagCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      for (const tag of item.tags) {
        map.set(tag, (map.get(tag) ?? 0) + 1);
      }
    }
    return map;
  }, [items]);

  const popularTags = useMemo(() => {
    return Array.from(tagCounts.entries())
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag]) => tag);
  }, [tagCounts]);

  // Sort items according to sortBy selection
  const sortedItems = useMemo(() => {
    if (sortBy === "default") return items;
    return [...items].sort((a, b) => {
      if (sortBy === "newest") {
        if (a.takenOn && b.takenOn) return b.takenOn.localeCompare(a.takenOn);
        return b.sortOrder - a.sortOrder;
      }
      if (sortBy === "oldest") {
        if (a.takenOn && b.takenOn) return a.takenOn.localeCompare(b.takenOn);
        return a.sortOrder - b.sortOrder;
      }
      if (sortBy === "place") {
        const placeA = a.location.city || a.location.placeName || a.title;
        const placeB = b.location.city || b.location.placeName || b.title;
        return placeA.localeCompare(placeB);
      }
      return 0;
    });
  }, [items, sortBy]);

  const matches = useCallback(
    (item: LightboxItem) => {
      const matchCat = filter === "all" || item.category === filter;
      const matchTag = !activeTag || item.tags.includes(activeTag);
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.caption && item.caption.toLowerCase().includes(q)) ||
        (item.note && item.note.toLowerCase().includes(q)) ||
        (item.location.placeName && item.location.placeName.toLowerCase().includes(q)) ||
        (item.location.city && item.location.city.toLowerCase().includes(q)) ||
        (item.location.country && item.location.country.toLowerCase().includes(q)) ||
        item.tags.some((t) => t.toLowerCase().includes(q));

      return Boolean(matchCat && matchTag && matchQuery);
    },
    [filter, activeTag, searchQuery],
  );

  const matching = useMemo(() => sortedItems.filter(matches), [sortedItems, matches]);

  const lightbox = useLightbox(sortedItems);

  useEffect(() => {
    if (!filterable || prepared) return;
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setPrepared(true);
        observer.disconnect();
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [filterable, prepared]);

  const onChipKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const at = Math.max(0, choices.indexOf(filter));
    const next = (at + (event.key === "ArrowRight" ? 1 : -1) + choices.length) % choices.length;
    setFilter(choices[next]);
    chipRefs.current[next]?.focus();
  };

  const onEnter = (event: PointerEvent<HTMLButtonElement>, slug: string) => {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    setHover({
      slug,
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  const filtering = filterable && (filter !== "all" || activeTag !== null || searchQuery.trim() !== "");

  const statusParts = [];
  if (filter !== "all") statusParts.push(CATEGORY_BY_ID[filter].label.toLowerCase());
  if (activeTag) statusParts.push(activeTag);
  if (searchQuery.trim()) statusParts.push(`“${searchQuery.trim()}”`);

  const status = !filtering
    ? `All ${plural(items.length, "postcard")}`
    : `${plural(matching.length, "postcard")} matching ${statusParts.join(", ")}`;

  const resetFilters = () => {
    setFilter("all");
    setActiveTag(null);
    setSearchQuery("");
    setSearchOpen(false);
  };

  // Photos that light up appear one after another; work out each one's delay once, up front
  const delays = new Map<string, number>();
  let rank = 0;
  for (const item of sortedItems) {
    if (matches(item) && hover?.slug !== item.slug) delays.set(item.slug, Math.min(rank++ * 60, 420));
  }

  // The first batch only, until someone asks for more or starts filtering (a filter must see everything)
  const paged = pageSize > 0 && !filtering && limit < sortedItems.length;
  const shown = paged ? sortedItems.slice(0, limit) : sortedItems;
  const layouts = COLUMN_COUNTS.map((count) => ({ count, columns: deal(shown, count) }));

  const cell = (item: LightboxItem, index: number) => {
    const on = matches(item);
    const isHover = hover?.slug === item.slug;
    const bloomed = on || isHover;
    const delay = delays.get(item.slug) ?? 0;
    const label = [item.title, formatLocation(item.location, ["city", "country"])].filter(Boolean).join(", ");
    return (
      <div key={item.slug} role="listitem" className={styles.cell} {...reveal("photo", index)}>
        <button
          type="button"
          className={styles.item}
          data-on={bloomed || undefined}
          data-dim={filtering && !bloomed ? true : undefined}
          data-grey={filtering || undefined}
          aria-label={`Open ${label}${item.video ? (item.video.sound ? ", video with sound" : ", video") : ""}`}
          onClick={(e) => lightbox.open(item.slug, e.currentTarget, matching.length > 0 && on ? matching : sortedItems)}
          onPointerEnter={(e) => onEnter(e, item.slug)}
          onPointerLeave={() => setHover((h) => (h?.slug === item.slug ? null : h))}
          style={
            {
              aspectRatio: item.image.width / item.image.height,
              "--ox": `${isHover ? hover.x : 50}%`,
              "--oy": `${isHover ? hover.y : 50}%`,
              "--delay": `${delay}ms`,
            } as CSSProperties
          }
        >
          <Photo image={item.image} sizes={SIZES} className={styles.base} />
          {prepared && filterable && <Photo image={item.image} sizes={SIZES} decorative className={styles.bloom} />}
          {item.video && <PlayBadge />}
          <span className={styles.caption} aria-hidden>
            <span className={styles.captionTitle}>{item.title}</span>
            <span className={styles.captionMeta}>{formatLocation(item.location, ["city", "country"]) || CATEGORY_BY_ID[item.category].label}</span>
          </span>
        </button>
      </div>
    );
  };

  return (
    <div ref={rootRef} className={styles.gallery} data-filtering={filtering || undefined}>
      {filterable && (
        <div className={styles.bar} data-sticky={stickyFilters || undefined}>
          <div className={styles.topRow}>
            {/* Category selection */}
            <div
              role="radiogroup"
              aria-label="Filter postcards by kind"
              className={styles.chips}
              onKeyDown={onChipKey}
              onPointerEnter={() => setPrepared(true)}
            >
              {choices.map((choice, i) => {
                const selected = filter === choice;
                const count = choice === "all" ? items.length : (counts.get(choice) ?? 0);
                return (
                  <button
                    key={choice}
                    ref={(node) => {
                      chipRefs.current[i] = node;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    tabIndex={selected ? 0 : -1}
                    className={styles.chip}
                    onClick={() => setFilter(choice)}
                  >
                    {choice === "all" ? "All" : CATEGORY_BY_ID[choice].label}
                    <span className={styles.count}>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Controls: Non-persistent Search + Sort */}
            <div className={styles.controls}>
              {searchOpen || searchQuery ? (
                <div className={styles.searchBox}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className={styles.searchIcon}>
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                    <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <input
                    id="gallery-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setSearchQuery("");
                        setSearchOpen(false);
                      }
                    }}
                    placeholder="Search place, mood..."
                    aria-label="Search postcards"
                    className={styles.searchInput}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchOpen(false);
                    }}
                    className={styles.clearSearch}
                    aria-label="Close search"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.searchToggle}
                  onClick={() => setSearchOpen(true)}
                  aria-label="Open search input"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                    <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>Search</span>
                </button>
              )}

              <Select
                label="Sort postcards"
                hideLabel
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { value: "default", label: "Default order" },
                  { value: "newest", label: "Newest first" },
                  { value: "oldest", label: "Oldest first" },
                  { value: "place", label: "By place (A–Z)" },
                ]}
              />
            </div>
          </div>

          {/* Curated mood pills (strictly max 6, no hashtags, no count noise) */}
          {popularTags.length > 0 && (
            <div className={styles.tagStrip} aria-label="Filter by mood">
              <span className={styles.tagLabel}>Mood</span>
              <div className={styles.tagList}>
                {popularTags.map((tag) => {
                  const active = activeTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      aria-pressed={active}
                      className={styles.tagPill}
                      data-active={active || undefined}
                      onClick={() => setActiveTag(active ? null : tag)}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status line with reset button */}
          <div className={styles.statusRow}>
            <p className={styles.status} aria-live="polite">
              {status}
            </p>
            {filtering && (
              <button
                type="button"
                className={styles.resetBtn}
                onClick={resetFilters}
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* One arrangement per column count; the stylesheet shows the one that fits the screen. The
          hidden ones are display:none, so they cost nothing to look at or tab through, and
          their lazy photographs are never fetched. */}
      {layouts.map(({ count, columns }) => (
        <div key={count} role="list" className={styles.grid} data-cols={count}>
          {columns.map((column, c) => (
            <div key={c} className={styles.column}>
              {column.map(({ item, index }) => cell(item, index))}
            </div>
          ))}
        </div>
      ))}

      {paged && (
        <LoadMore
          shown={shown.length}
          total={sortedItems.length}
          step={pageSize}
          noun="postcards"
          onMore={() => setLimit((n) => n + pageSize)}
          onAll={() => setLimit(sortedItems.length)}
        />
      )}

      <Lightbox
        list={lightbox.state?.list ?? null}
        index={lightbox.state?.index ?? 0}
        origin={lightbox.state?.origin ?? null}
        onIndexChange={lightbox.setIndex}
        onClose={lightbox.close}
      />
    </div>
  );
}
