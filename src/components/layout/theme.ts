"use client";

import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";
const QUERY = "(prefers-color-scheme: dark)";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    media.removeEventListener("change", onChange);
  };
}

/** What is showing now: the explicit choice if there is one, otherwise the system preference. */
function snapshot(): Theme {
  const set = document.documentElement.dataset.theme;
  if (set === "dark" || set === "light") return set;
  return window.matchMedia(QUERY).matches ? "dark" : "light";
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
