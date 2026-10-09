"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LightboxItem } from "./types";

interface OpenState {
  /** The photos the visitor can step through (a filtered subset or everything). */
  list: LightboxItem[];
  index: number;
  /** Where the clicked thumbnail sat, so the photo can grow out of it. */
  origin: DOMRect | null;
}

const HASH_KEY = "p=";

function slugFromHash(): string | null {
  const hash = window.location.hash.replace(/^#/, "");
  return hash.startsWith(HASH_KEY) ? decodeURIComponent(hash.slice(HASH_KEY.length)) : null;
}

/**
 * Open/close state for the lightbox, kept in sync with the URL hash (`#p=slug`) so a postcard
 * can be shared or linked to. Only one lightbox per page should sync the hash.
 */
export function useLightbox(allItems: LightboxItem[], { syncHash = true }: { syncHash?: boolean } = {}) {
  const [state, setState] = useState<OpenState | null>(null);

  const open = useCallback((slug: string, origin: Element | null, list?: LightboxItem[]) => {
    const source = list && list.some((item) => item.slug === slug) ? list : allItems;
    const index = source.findIndex((item) => item.slug === slug);
    if (index < 0) return;
    setState({ list: source, index, origin: origin ? origin.getBoundingClientRect() : null });
  }, [allItems]);

  const close = useCallback(() => setState(null), []);

  const setIndex = useCallback((index: number) => {
    setState((current) => (current ? { ...current, index, origin: null } : current));
  }, []);

  // Open from a shared link, and react to the hash changing (e.g. the hero links to /gallery#p=slug).
  useEffect(() => {
    if (!syncHash) return;
    const syncFromHash = () => {
      const slug = slugFromHash();
      if (slug) open(slug, null);
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [open, syncHash]);

  // Reflect the current photo in the URL without adding history entries.
  const wasOpen = useRef(false);
  const currentSlug = state ? state.list[state.index]?.slug : null;
  useEffect(() => {
    if (!syncHash) return;
    const { pathname, search, hash } = window.location;
    if (currentSlug) {
      wasOpen.current = true;
      if (hash !== `#${HASH_KEY}${currentSlug}`) {
        window.history.replaceState(window.history.state, "", `${pathname}${search}#${HASH_KEY}${currentSlug}`);
      }
    } else if (wasOpen.current && hash.startsWith(`#${HASH_KEY}`)) {
      wasOpen.current = false;
      window.history.replaceState(window.history.state, "", `${pathname}${search}`);
    }
  }, [currentSlug, syncHash]);

  return useMemo(() => ({ state, open, close, setIndex }), [state, open, close, setIndex]);
}
