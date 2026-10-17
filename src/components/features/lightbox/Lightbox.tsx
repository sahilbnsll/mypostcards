"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { PostcardBack } from "@/components/features/postcard/PostcardBack";
import { Photo } from "@/components/ui/Photo";
import { PostcardMedia } from "@/components/ui/PostcardMedia";
import { pad2 } from "@/lib/utils";
import type { LightboxItem } from "./types";
import styles from "./Lightbox.module.css";

interface LightboxProps {
  list: LightboxItem[] | null;
  index: number;
  origin: DOMRect | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

const PHOTO_SIZES = "(min-width: 62rem) 62vw, 100vw";
const CLOSE_MS = 220;
const SWIPE_PX = 56;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Lightbox({ list, index, origin, onIndexChange, onClose }: LightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const closing = useRef(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const isOpen = list !== null;
  const count = list?.length ?? 0;
  const item = list?.[index];

  // Closing syncs state itself instead of waiting for the dialog's "close" event, which is the
  // fallback for closes the browser starts (and not every embedded browser dispatches it).
  const finishClose = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    document.documentElement.style.overflow = "";
    closing.current = false;
    onClose();
  }, [onClose]);

  const indexBySlug = new Map((list ?? []).map((entry, i) => [entry.slug, i] as const));

  const requestClose = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || closing.current) return;
    closing.current = true;
    if (prefersReducedMotion()) {
      finishClose();
      return;
    }
    dialog.dataset.closing = "true";
    window.setTimeout(finishClose, CLOSE_MS);
  }, [finishClose]);

  // Open and close the native dialog (focus trap, Escape and focus return come with it).
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      closing.current = false;
      delete dialog.dataset.closing;
      dialog.showModal();
      document.documentElement.style.overflow = "hidden";
      closeRef.current?.focus({ preventScroll: true });

      // Grow the photo out of the thumbnail that was clicked.
      const print = printRef.current;
      if (origin && print && !prefersReducedMotion()) {
        const target = print.getBoundingClientRect();
        const scale = Math.min(origin.width / target.width, 1);
        const dx = origin.left + origin.width / 2 - (target.left + target.width / 2);
        const dy = origin.top + origin.height / 2 - (target.top + target.height / 2);
        print.animate(
          [
            { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 0.4 },
            { transform: "none", opacity: 1 },
          ],
          { duration: 520, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
        );
      }
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen, origin]);

  useEffect(() => {
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  const go = useCallback(
    (step: 1 | -1) => {
      if (count < 2) return;
      setDirection(step);
      onIndexChange((index + step + count) % count);
    },
    [count, index, onIndexChange],
  );

  const jumpTo = (target: number) => {
    setDirection(target > index ? 1 : -1);
    onIndexChange(target);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    }
  };

  const onPointerDown = (event: ReactPointerEvent) => {
    if (event.pointerType === "mouse") return;
    swipe.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event: ReactPointerEvent) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
  };

  const prev = list && count > 1 ? list[(index - 1 + count) % count] : undefined;
  const next = list && count > 1 ? list[(index + 1) % count] : undefined;

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-label={item ? `${item.title}, photo ${index + 1} of ${count}` : "Photo viewer"}
      onClose={finishClose}
      onCancel={(event) => {
        // Escape: run the exit animation instead of vanishing.
        event.preventDefault();
        requestClose();
      }}
      onKeyDown={onKeyDown}
    >
      {item && (
        <div className={styles.shell}>
          <div className={styles.stage} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onClick={(e) => e.target === e.currentTarget && requestClose()}>
            <div
              key={item.slug}
              className={styles.slide}
              style={{ "--dir": direction } as CSSProperties}
              data-entering={origin === null ? "true" : undefined}
            >
              <div
                ref={printRef}
                className={styles.print}
                style={{ "--ratio": item.image.width / item.image.height } as CSSProperties}
              >
                <PostcardMedia card={item} sizes={PHOTO_SIZES} eager />
              </div>
            </div>
          </div>

          {/* Neighbours load in the background so stepping through is instant */}
          <div className="visually-hidden" aria-hidden>
            {prev && <Photo image={prev.image} sizes={PHOTO_SIZES} eager decorative />}
            {next && next !== prev && <Photo image={next.image} sizes={PHOTO_SIZES} eager decorative />}
          </div>

          <div className={styles.back} role="group" aria-label="About this postcard">
            <div className={styles.backInner} key={item.slug}>
              <PostcardBack item={item} />

              <p className={styles.pageLink}>
                <Link href={`/postcards/${item.slug}`} className="text-link">
                  Open this postcard&rsquo;s page
                </Link>
              </p>

              {item.related.length > 0 && (
                <section className={styles.related} aria-label="More like this">
                  <h3 className={styles.relatedTitle}>More like this</h3>
                  <ul role="list" className={styles.relatedList}>
                    {item.related.map((rel) => {
                      const at = indexBySlug.get(rel.slug);
                      const target = at === undefined ? undefined : list![at];
                      return (
                        <li key={rel.slug}>
                          {target ? (
                            <button
                              type="button"
                              className={styles.relatedItem}
                              onClick={() => jumpTo(at!)}
                              aria-label={`Show ${rel.title}`}
                              title={rel.title}
                            >
                              <Photo image={target.image} ratio="1 / 1" sizes="96px" />
                            </button>
                          ) : (
                            <Link href={`/postcards/${rel.slug}`} className={styles.relatedText}>
                              {rel.title}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
            </div>

            <div className={styles.controls}>
              <p className={styles.count} aria-hidden>
                <b>{pad2(index + 1)}</b> / {pad2(count)}
              </p>
              <div className={styles.buttons}>
                <button type="button" className={styles.round} onClick={() => go(-1)} disabled={count < 2} aria-label="Previous photo">
                  <Chevron dir="left" />
                </button>
                <button type="button" className={styles.round} onClick={() => go(1)} disabled={count < 2} aria-label="Next photo">
                  <Chevron dir="right" />
                </button>
              </div>
            </div>
            <div className={styles.edge} aria-hidden />
          </div>

          <button ref={closeRef} type="button" className={styles.close} onClick={requestClose} aria-label="Close photo viewer">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M2 2l12 12M14 2 2 14" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>

          <p className="visually-hidden" role="status" aria-live="polite">
            {`Photo ${index + 1} of ${count}: ${item.title}`}
          </p>
        </div>
      )}
    </dialog>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d={dir === "left" ? "M10 3 5 8l5 5" : "m6 3 5 5-5 5"} stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
