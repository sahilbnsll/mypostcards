"use client";

import { useMemo, useState } from "react";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { LoadMore } from "@/components/ui/LoadMore";
import { Select } from "@/components/ui/Select";
import type { Cafe, ImageAsset } from "@/content/types";
import { plural } from "@/lib/utils";
import { CafeCard } from "./CafeCard";
import styles from "./CafeBrowser.module.css";

export interface CafeEntry {
  cafe: Cafe;
  count: number;
  /** The newest date on any of the café's photographs, "YYYY-MM-DD", or "" when none has one. */
  latest: string;
  prints: ImageAsset[];
}

type Sort = "rating" | "recent" | "postcards" | "name" | "city";

const PAGE = 6;

/**
 * The cafés page: a filter by city, a sort, and the cards, six at a time. With a handful of cafés
 * it is just a tidy grid; as the list grows it stays short instead of running on.
 */
export function CafeBrowser({ entries }: { entries: CafeEntry[] }) {
  const [city, setCity] = useState("all");
  const [sort, setSort] = useState<Sort>("rating");
  const [limit, setLimit] = useState(PAGE);

  const cities = useMemo(() => {
    const map = new Map<string, number>();
    for (const { cafe } of entries) if (cafe.city) map.set(cafe.city, (map.get(cafe.city) ?? 0) + 1);
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [entries]);

  const shown = useMemo(() => {
    const list = entries.filter(({ cafe }) => city === "all" || cafe.city === city);
    return list.sort((a, b) => {
      // By the date of the photographs, newest first; cafés whose photographs have no date go last
      if (sort === "recent") return (b.latest ?? "").localeCompare(a.latest ?? "") || b.cafe.sortOrder - a.cafe.sortOrder;
      if (sort === "name") return a.cafe.name.localeCompare(b.cafe.name);
      // By city, and by name within a city; a café with no city goes last
      if (sort === "city") return (a.cafe.city ?? "￿").localeCompare(b.cafe.city ?? "￿") || a.cafe.name.localeCompare(b.cafe.name);
      if (sort === "postcards") return b.count - a.count || a.cafe.sortOrder - b.cafe.sortOrder;
      return (b.cafe.rating ?? 0) - (a.cafe.rating ?? 0) || b.count - a.count;
    });
  }, [entries, city, sort]);

  const visible = shown.slice(0, limit);

  return (
    <div className={styles.root}>
      <div className={styles.bar}>
        {cities.length > 1 && (
          <ChipGroup
            label="Filter cafés by city"
            value={city}
            onChange={(id) => {
              setCity(id);
              setLimit(PAGE);
            }}
            options={[{ id: "all", label: "All", count: entries.length }, ...cities.map(([name, count]) => ({ id: name, label: name, count }))]}
          />
        )}
        <Select
          label="Sort by"
          value={sort}
          onChange={setSort}
          options={[
            { value: "rating", label: "Highest rated" },
            { value: "recent", label: "Most recent" },
            { value: "postcards", label: "Most postcards" },
            { value: "name", label: "Name (A to Z)" },
            { value: "city", label: "City (A to Z)" },
          ]}
        />
      </div>
      <p className={styles.status} aria-live="polite">
        {plural(shown.length, "café")}
        {city !== "all" ? ` in ${city}` : ""}
      </p>

      <div className="card-grid">
        {visible.map(({ cafe, count, prints }, index) => (
          <CafeCard as="h2" key={cafe.slug} cafe={cafe} count={count} index={index} prints={prints} />
        ))}
      </div>
      <LoadMore shown={visible.length} total={shown.length} step={PAGE} noun="cafés" onMore={() => setLimit((n) => n + PAGE)} />
    </div>
  );
}
