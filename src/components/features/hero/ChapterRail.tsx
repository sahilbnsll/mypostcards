"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ChapterRail.module.css";

export interface Chapter {
  id: string;
  label: string;
}

/** How long the index stays out after the last scroll before it tucks itself away. */
const IDLE_MS = 1800;

/**
 * A quiet index down the right edge of the home page: one tick per section, the one you are in
 * marked in red, each a plain link that jumps there. It only reads the scroll position (no
 * scroll-jacking). It is not a fixture: it shows while you scroll and minimises a moment after you
 * stop, coming back when you scroll again, point at its edge, or tab into it. Wide screens only.
 */
export function ChapterRail({ chapters }: { chapters: Chapter[] }) {
  const [active, setActive] = useState<string | null>(null);
  const [awake, setAwake] = useState(false);
  const holding = useRef(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const rest = () => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        if (!holding.current) setAwake(false);
      }, IDLE_MS);
    };
    const update = () => {
      // The chapter in view is the last one whose top has passed 40% of the way down the screen
      const line = window.innerHeight * 0.4;
      let current: string | null = null;
      for (const chapter of chapters) {
        const el = document.getElementById(chapter.id);
        if (el && el.getBoundingClientRect().top <= line) current = chapter.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      update();
      setAwake(true);
      rest();
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.clearTimeout(timer.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, [chapters]);

  // While the pointer or focus is on the index it stays; leaving it starts the countdown again
  const hold = () => {
    holding.current = true;
    window.clearTimeout(timer.current);
    setAwake(true);
  };
  const release = () => {
    holding.current = false;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAwake(false), IDLE_MS);
  };

  const shown = awake && active !== null;

  return (
    <nav
      aria-label="On this page"
      className={styles.rail}
      data-show={shown ? "" : undefined}
      onPointerEnter={hold}
      onPointerLeave={release}
      onFocus={hold}
      onBlur={release}
    >
      <ol role="list" className={styles.list}>
        {chapters.map((chapter) => (
          <li key={chapter.id}>
            <a href={`#${chapter.id}`} className={styles.link} aria-current={active === chapter.id ? "location" : undefined}>
              <span className={styles.label}>{chapter.label}</span>
              <span className={styles.tick} aria-hidden />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
