"use client";

import { useEffect, useRef } from "react";
import styles from "./Cursor.module.css";

/** Things the circle grows over: anything you can press. */
const PRESSABLE = 'a[href], button, summary, label, [role="button"], [role="link"], [data-cursor-grow]';
/** Places that need the real pointer: text entry, and anywhere precision matters. */
const NATIVE = 'input, textarea, select, [contenteditable="true"], [data-native-cursor]';

/**
 * A round cursor that inverts whatever it passes over, easing after the mouse. It only exists for
 * a mouse or trackpad: touch screens never see it, and people who ask for reduced motion get a
 * circle that sits exactly on the pointer instead of trailing it. The real cursor comes back over
 * form fields, the drawing pad and any open dialog. Nothing here is announced: it is decoration.
 */
export function Cursor() {
  const outer = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = outer.current;
    const inner = dot.current;
    if (!el || !inner) return;

    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.documentElement;
    if (!pointer.matches) return;

    let targetX = -100;
    let targetY = -100;
    let x = -100;
    let y = -100;
    let frame = 0;

    const draw = () => {
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const tick = () => {
      frame = 0;
      x += (targetX - x) * 0.22;
      y += (targetY - y) * 0.22;
      draw();
      if (Math.abs(targetX - x) > 0.1 || Math.abs(targetY - y) > 0.1) frame = requestAnimationFrame(tick);
    };

    const setState = (state: "idle" | "grow" | "press" | "hidden") => {
      inner.dataset.state = state;
    };

    const onMove = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      const target = event.target instanceof Element ? event.target : null;
      if (calm.matches) {
        x = targetX;
        y = targetY;
        draw();
      } else if (!frame) {
        frame = requestAnimationFrame(tick);
      }
      if (!target || target.closest(NATIVE)) setState("hidden");
      else setState(target.closest(PRESSABLE) ? "grow" : "idle");
    };
    const onLeave = () => setState("hidden");
    const onDown = () => {
      if (inner.dataset.state !== "hidden") setState("press");
    };
    const onUp = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (inner.dataset.state === "press") setState(target?.closest(PRESSABLE) ? "grow" : "idle");
    };

    setState("hidden");
    root.dataset.cursor = "";
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      delete root.dataset.cursor;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div ref={outer} className={styles.cursor} aria-hidden="true">
      <div ref={dot} className={styles.dot} data-state="hidden" />
    </div>
  );
}
