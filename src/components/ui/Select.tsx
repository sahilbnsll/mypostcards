"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import styles from "./Select.module.css";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  /** Names the control for screen readers; shown beside it unless `hideLabel` is set. */
  label: string;
  hideLabel?: boolean;
  /** Which edge of the button the list lines up with. */
  align?: "start" | "end";
  className?: string;
}

/**
 * A dropdown that looks like the rest of the site instead of the system menu: a pill button that
 * opens a small card of choices. It follows the listbox pattern: arrow keys, Home and End move,
 * Enter or Space picks, Escape closes and returns focus to the button, typing a letter jumps to a
 * matching choice, and a click outside closes it. The list opens upwards when there is no room
 * below.
 */
export function Select<T extends string>({ value, onChange, options, label, hideLabel, align = "end", className }: SelectProps<T>) {
  const uid = useId();
  const listId = `${uid}-list`;
  const labelId = `${uid}-label`;
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: "", at: 0 });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [up, setUp] = useState(false);

  const selected = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  const show = useCallback(() => {
    const button = buttonRef.current;
    if (button) {
      const room = window.innerHeight - button.getBoundingClientRect().bottom;
      setUp(room < options.length * 44 + 24 && button.getBoundingClientRect().top > room);
    }
    setActive(selected);
    setOpen(true);
  }, [options.length, selected]);

  const close = useCallback((refocus: boolean) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  }, []);

  const pick = (index: number) => {
    const option = options[index];
    if (option) onChange(option.value);
    close(true);
  };

  // Close on a click or tap anywhere else
  useEffect(() => {
    if (!open) return;
    const away = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  // Keep the highlighted choice in view in a long list
  useEffect(() => {
    if (open) listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = options.length - 1;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        show();
      }
      return;
    }
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive((i) => Math.min(last, i + 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        break;
      case "Home":
        event.preventDefault();
        setActive(0);
        break;
      case "End":
        event.preventDefault();
        setActive(last);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        pick(active);
        break;
      case "Escape":
        event.preventDefault();
        close(true);
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
          const now = Date.now();
          const t = typed.current;
          t.text = now - t.at > 700 ? event.key.toLowerCase() : t.text + event.key.toLowerCase();
          t.at = now;
          const hit = options.findIndex((o) => o.label.toLowerCase().startsWith(t.text));
          if (hit >= 0) setActive(hit);
        }
    }
  };

  return (
    <div className={cn(styles.root, className)} ref={rootRef} data-open={open || undefined} data-up={up || undefined} data-align={align}>
      <span id={labelId} className={hideLabel ? "visually-hidden" : styles.label}>
        {label}
      </span>
      <div className={styles.anchor}>
        <button
          ref={buttonRef}
          type="button"
          className={styles.button}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-labelledby={`${labelId} ${uid}-value`}
          aria-activedescendant={open ? `${uid}-opt-${active}` : undefined}
          onClick={() => (open ? close(false) : show())}
          onKeyDown={onKeyDown}
        >
          <span id={`${uid}-value`} className={styles.value}>
            {options[selected]?.label}
          </span>
          <svg className={styles.chevron} width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="m2.5 4.5 3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <ul ref={listRef} id={listId} role="listbox" aria-labelledby={labelId} className={styles.list} hidden={!open} tabIndex={-1}>
          {options.map((option, i) => (
            <li
              key={option.value}
              id={`${uid}-opt-${i}`}
              role="option"
              aria-selected={i === selected}
              data-active={i === active || undefined}
              className={styles.option}
              onPointerMove={() => setActive(i)}
              onClick={() => pick(i)}
            >
              <span>{option.label}</span>
              <svg className={styles.tick} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="m2.5 7.5 3 3 6-6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
