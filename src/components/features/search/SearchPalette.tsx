"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { prepare, search, type Prepared } from "./search";
import type { SearchEntry } from "./types";
import styles from "./SearchPalette.module.css";

let indexRequest: Promise<Prepared[]> | null = null;
/** Fetched once, the first time anyone opens the search. */
function loadIndex(): Promise<Prepared[]> {
  indexRequest ??= fetch("/search-index.json")
    .then((response) => {
      if (!response.ok) throw new Error(`search index ${response.status}`);
      return response.json() as Promise<SearchEntry[]>;
    })
    .then(prepare)
    .catch((error) => {
      indexRequest = null; // let the next open try again
      throw error;
    });
  return indexRequest;
}

const QUICK_LINKS = [
  { title: "Gallery", href: "/gallery" },
  { title: "Trips", href: "/trips" },
  { title: "Places", href: "/destinations" },
  { title: "Cafés", href: "/cafes" },
  { title: "Stories", href: "/stories" },
];

/**
 * Search box and button. Opens as a dialog from the header button, or with "/" or Ctrl/Cmd+K.
 * Arrow keys move through results, Enter opens one, Escape closes. The index is loaded the first
 * time it is opened.
 */
export function SearchPalette() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [entries, setEntries] = useState<Prepared[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => (entries ? search(entries, query) : []), [entries, query]);
  const trimmed = query.trim();

  const load = useCallback(() => {
    setFailed(false);
    loadIndex().then(setEntries, () => setFailed(true));
  }, []);

  const openSearch = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    inputRef.current?.focus();
    load();
  }, [load]);

  const closeSearch = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    setQuery("");
    setActive(0);
  }, []);

  // "/" and Ctrl/Cmd+K open the search from anywhere, except while typing in a field.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName));
      const shortcut = (event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey);
      if (!shortcut) return;
      event.preventDefault();
      openSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSearch]);

  const go = (href: string) => {
    closeSearch();
    router.push(href);
  };

  const onInputKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(results[active].href);
    }
  };

  const optionId = (i: number) => `${listId}-option-${i}`;

  let status = "";
  if (failed) status = "Search could not load. Try again.";
  else if (trimmed && entries) status = results.length === 0 ? "No matches" : `${results.length} ${results.length === 1 ? "result" : "results"}`;

  return (
    <>
      <button type="button" className={styles.trigger} onClick={openSearch} aria-label="Search" aria-haspopup="dialog" title="Search ( / )">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.7" />
          <path d="m15.5 15.5 5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </button>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-label="Search"
        onCancel={closeSearch}
        onClose={closeSearch}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeSearch();
        }}
      >
        <div className={styles.panel}>
          <div className={styles.field}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className={styles.glass}>
              <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.7" />
              <path d="m15.5 15.5 5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              className={styles.input}
              type="search"
              role="combobox"
              aria-label="Search postcards, trips, places, cafés and stories"
              aria-expanded={results.length > 0}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={results.length > 0 ? optionId(active) : undefined}
              placeholder="Search a place, a café, a word…"
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              onKeyDown={onInputKey}
            />
            <button type="button" className={styles.close} onClick={closeSearch}>
              Esc
              <span className="visually-hidden"> to close</span>
            </button>
          </div>

          <p className={styles.status} role="status" aria-live="polite">
            {status}
          </p>

          {results.length > 0 ? (
            <ul id={listId} role="listbox" aria-label="Results" className={styles.results}>
              {results.map((result, i) => (
                <li
                  key={result.href}
                  id={optionId(i)}
                  role="option"
                  aria-selected={i === active}
                  className={styles.option}
                  data-active={i === active || undefined}
                  onMouseMove={() => i !== active && setActive(i)}
                  onClick={() => go(result.href)}
                >
                  <span className={styles.kind}>{result.type}</span>
                  <span className={styles.text}>
                    <span className={styles.title}>{result.title}</span>
                    <span className={styles.subtitle}>{result.subtitle}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.empty}>
              {failed ? (
                <button type="button" className="text-link" onClick={load}>
                  Try again
                </button>
              ) : trimmed && entries ? (
                <p>Nothing matches &ldquo;{trimmed}&rdquo;. Try a place, a kind of food or a single word.</p>
              ) : (
                <>
                  <p>Or go straight to</p>
                  <ul role="list" className={styles.quick}>
                    {QUICK_LINKS.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} onClick={closeSearch}>
                          {link.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
