"use client";

import { useEffect } from "react";

/**
 * Lets visitors with a mouse or pen pick the hero postcards up and move them around, then still
 * click one to open it (a drag never counts as a click). Adapted from the drag-cards reference.
 *
 * Deliberately not for touch: a finger on a card must keep scrolling the page, and a tap already
 * opens the card. It works on the existing markup through `data-slot` and CSS variables, so the
 * deck stays a server-rendered list of links, fully usable from the keyboard.
 */
export function DeckDrag({ targetId }: { targetId: string }) {
  useEffect(() => {
    const deck = document.getElementById(targetId);
    const table = deck?.parentElement;
    if (!deck || !table) return;

    let layer = 10;
    let drag: {
      slot: HTMLElement;
      pointerId: number;
      startX: number;
      startY: number;
      baseX: number;
      baseY: number;
      minX: number;
      maxX: number;
      minY: number;
      maxY: number;
      moved: boolean;
    } | null = null;

    const swallowNextClick = () => {
      const stop = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
      };
      deck.addEventListener("click", stop, { capture: true, once: true });
      // If no click follows (pointer released elsewhere), do not leave the guard behind.
      window.setTimeout(() => deck.removeEventListener("click", stop, { capture: true }), 80);
    };

    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "touch" || event.button !== 0) return;
      const slot = (event.target as Element).closest<HTMLElement>("[data-slot]");
      if (!slot) return;
      const bounds = table.getBoundingClientRect();
      const box = slot.getBoundingClientRect();
      const baseX = parseFloat(slot.style.getPropertyValue("--dx")) || 0;
      const baseY = parseFloat(slot.style.getPropertyValue("--dy")) || 0;
      drag = {
        slot,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        baseX,
        baseY,
        // Keep the card on the table: how far it can still move in each direction
        minX: baseX - (box.left - bounds.left),
        maxX: baseX + (bounds.right - box.right),
        minY: baseY - (box.top - bounds.top),
        maxY: baseY + (bounds.bottom - box.bottom),
        moved: false,
      };
      slot.style.zIndex = String(++layer);
      // Follow the pointer anywhere on the page for the length of the press, so a fast drag
      // that outruns the card is not lost.
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    };

    const onMove = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (!drag.moved) {
        if (Math.hypot(dx, dy) < 5) return;
        drag.moved = true;
        drag.slot.dataset.dragging = "true";
        drag.slot.setPointerCapture(event.pointerId);
      }
      const x = Math.min(drag.maxX, Math.max(drag.minX, drag.baseX + dx));
      const y = Math.min(drag.maxY, Math.max(drag.minY, drag.baseY + dy));
      drag.slot.style.setProperty("--dx", `${x}px`);
      drag.slot.style.setProperty("--dy", `${y}px`);
    };

    const onUp = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      if (drag.moved) {
        delete drag.slot.dataset.dragging;
        swallowNextClick();
      }
      drag = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };

    // The browser's own link/image drag ghost would fight ours.
    const onDragStart = (event: Event) => event.preventDefault();

    deck.addEventListener("pointerdown", onDown);
    deck.addEventListener("dragstart", onDragStart);
    return () => {
      deck.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      deck.removeEventListener("dragstart", onDragStart);
    };
  }, [targetId]);

  return null;
}
