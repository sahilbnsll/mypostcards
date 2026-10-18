"use client";

import { useRef } from "react";
import type { KeyboardEvent } from "react";
import styles from "./ChipGroup.module.css";

export interface ChipOption {
  id: string;
  label: string;
  count?: number;
}

interface ChipGroupProps {
  label: string;
  options: ChipOption[];
  value: string;
  onChange: (id: string) => void;
}

/** A row of pill buttons where exactly one is chosen (a radio group): arrow keys move the choice. */
export function ChipGroup({ label, options, value, onChange }: ChipGroupProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const at = Math.max(0, options.findIndex((o) => o.id === value));
    const next = (at + (event.key === "ArrowRight" ? 1 : -1) + options.length) % options.length;
    onChange(options[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div role="radiogroup" aria-label={label} className={styles.chips} onKeyDown={onKey}>
      {options.map((option, i) => {
        const selected = option.id === value;
        return (
          <button
            key={option.id}
            ref={(node) => {
              refs.current[i] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            className={styles.chip}
            onClick={() => onChange(option.id)}
          >
            {option.label}
            {option.count !== undefined && <span className={styles.count}>{option.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
