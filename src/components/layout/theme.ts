"use client";

import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

/** What is showing now. Light unless the visitor chose dark (the system setting is not followed). */
function snapshot(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

/** The theme on screen. Every switch (the header button, the lamp) reads and writes the same place. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, snapshot, () => "light" as Theme);
}

/** Applies a theme and keeps the choice in this browser only (applied before first paint by the layout script). */
export function setTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {
    // Private mode or blocked storage: the choice just lasts for this visit.
  }
}
