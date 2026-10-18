"use client";

import { useMemo, useState } from "react";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { LoadMore } from "@/components/ui/LoadMore";
import { KINDS, type VisitorCard } from "@/content/visitors-shared";
import { plural } from "@/lib/utils";
import { VisitorWall } from "./VisitorWall";
import styles from "./VisitorBoard.module.css";

const PAGE = 12;

/**
 * The guest wall, kept to a sensible length: twelve cards at a time, a filter by kind once there
 * is more than one kind on the wall, and a button for the next batch instead of a page that never
 * ends. Pinned cards stay first, as the server sorted them.
 */
export function VisitorBoard({ cards }: { cards: VisitorCard[] }) {
  const [kind, setKind] = useState("all");
  const [limit, setLimit] = useState(PAGE);

  const kinds = useMemo(() => {
    const counts = new Map<string, number>();
    for (const card of cards) counts.set(card.kind, (counts.get(card.kind) ?? 0) + 1);
    return KINDS.filter((k) => counts.has(k.id)).map((k) => ({ id: k.id as string, label: k.label, count: counts.get(k.id) ?? 0 }));
  }, [cards]);

  const matching = kind === "all" ? cards : cards.filter((card) => card.kind === kind);
  const visible = matching.slice(0, limit);

  return (
    <div>
      {kinds.length > 1 && (
        <div className={styles.bar}>
          <ChipGroup
            label="Filter cards by kind"
            value={kind}
            onChange={(id) => {
              setKind(id);
              setLimit(PAGE);
            }}
            options={[{ id: "all", label: "All", count: cards.length }, ...kinds]}
          />
          <p className={styles.status} aria-live="polite">
            {plural(matching.length, "card")}
          </p>
        </div>
      )}
      <VisitorWall cards={visible} />
      <LoadMore shown={visible.length} total={matching.length} step={PAGE} noun="cards" onMore={() => setLimit((n) => n + PAGE)} />
    </div>
  );
}
