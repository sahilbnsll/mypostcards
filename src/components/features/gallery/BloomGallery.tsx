"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { Photo } from "@/components/ui/Photo";
import { CATEGORIES, CATEGORY_BY_ID } from "@/content/categories";
import type { Category } from "@/content/types";
import { Lightbox } from "@/components/features/lightbox/Lightbox";
import { useLightbox } from "@/components/features/lightbox/useLightbox";
import type { LightboxItem } from "@/components/features/lightbox/types";
import { formatLocation, plural } from "@/lib/utils";
import { reveal } from "@/lib/reveal";
import styles from "./BloomGallery.module.css";

type Filter = Category | "all";

interface BloomGalleryProps {
  items: LightboxItem[];
  /** Show the category chips. Off for trip and place pages, where the set is already narrow. */
  filterable?: boolean;
  /** Keep the chips pinned under the header while the gallery scrolls past. */
  stickyFilters?: boolean;
}

const SIZES = "(min-width: 75rem) 25vw, (min-width: 52rem) 33vw, 50vw";

export function BloomGallery({ items, filterable = true, stickyFilters = false }: BloomGalleryProps) {
  const [filter, setFilter] = useState<Filter>("all");
  // The colour layer is only mounted once someone is likely to use the filter.
  const [prepared, setPrepared] = useState(false);
  const [hover, setHover] = useState<{ slug: string; x: number; y: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const lightbox = useLightbox(items);

  const counts = useMemo(() => {
    const map = new Map<Category, number>();
    for (const item of items) map.set(item.category, (map.get(item.category) ?? 0) + 1);
    return map;
  }, [items]);

  const choices: Filter[] = useMemo(
    () => ["all", ...CATEGORIES.map((c) => c.id).filter((id) => (counts.get(id) ?? 0) > 0)],
    [counts],
  );

  const matches = useCallback((item: LightboxItem) => filter === "all" || item.category === filter, [filter]);
  const matching = useMemo(() => items.filter(matches), [items, matches]);

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

  const filtering = filterable && filter !== "all";
  const status =
    filter === "all"
      ? `All ${plural(items.length, "postcard")}`
      : `${plural(matching.length, "postcard")} in ${CATEGORY_BY_ID[filter].label.toLowerCase()}`;

  let rank = 0;

  return (
    <div ref={rootRef} className={styles.gallery} data-filtering={filtering || undefined}>
      {filterable && (
        <div className={styles.bar} data-sticky={stickyFilters || undefined}>
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
          <p className={styles.status} aria-live="polite">
            {status}
          </p>
        </div>
      )}

      <ul role="list" className={styles.grid}>
        {items.map((item, index) => {
          const on = matches(item);
          const isHover = hover?.slug === item.slug;
          const bloomed = on || isHover;
          const delay = on && !isHover ? Math.min(rank++ * 60, 420) : 0;
          const label = [item.title, formatLocation(item.location, ["city", "country"])].filter(Boolean).join(", ");
          return (
            <li
              key={item.slug}
              className={styles.cell}
              {...reveal("photo", index)}
            >
              <button
                type="button"
                className={styles.item}
                data-on={bloomed || undefined}
                data-dim={filtering && !bloomed ? true : undefined}
                data-grey={filtering || undefined}
                aria-label={`Open ${label}`}
                onClick={(e) => lightbox.open(item.slug, e.currentTarget, matching.length > 0 && on ? matching : items)}
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
                {prepared && filterable && (
                  <Photo image={item.image} sizes={SIZES} decorative className={styles.bloom} />
                )}
                <span className={styles.caption} aria-hidden>
                  <span className={styles.captionTitle}>{item.title}</span>
                  <span className={styles.captionMeta}>{formatLocation(item.location, ["city", "country"]) || CATEGORY_BY_ID[item.category].label}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

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
