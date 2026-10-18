"use client";

import { useId, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import styles from "./Tabs.module.css";

export interface TabItem {
  id: string;
  label: string;
  /** A short number or word after the label, e.g. a count. */
  hint?: string;
  panel: ReactNode;
}

/**
 * A row of tabs over one panel: the way to fold several views of the same thing (a globe, a map, a
 * list) into one section instead of stacking them. Only the open panel is mounted, so a hidden map
 * or globe costs nothing. Arrow keys, Home and End move between tabs.
 */
export function Tabs({ tabs, label }: { tabs: TabItem[]; label: string }) {
  const uid = useId().replace(/:/g, "");
  const [active, setActive] = useState(tabs[0]?.id);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const at = Math.max(0, tabs.findIndex((t) => t.id === active));
    let next = at;
    if (event.key === "ArrowRight") next = (at + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (at - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    setActive(tabs[next].id);
    refs.current[next]?.focus();
  };

  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  if (!current) return null;

  return (
    <div className={styles.tabs}>
      <div role="tablist" aria-label={label} className={styles.list} onKeyDown={onKey}>
        {tabs.map((tab, i) => {
          const selected = tab.id === current.id;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                refs.current[i] = node;
              }}
              id={`${uid}-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${uid}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              className={styles.tab}
              onClick={() => setActive(tab.id)}
            >
              {tab.label}
              {tab.hint && <span className={styles.hint}>{tab.hint}</span>}
            </button>
          );
        })}
      </div>
      <div id={`${uid}-panel-${current.id}`} role="tabpanel" aria-labelledby={`${uid}-tab-${current.id}`} className={styles.panel}>
        {current.panel}
      </div>
    </div>
  );
}
