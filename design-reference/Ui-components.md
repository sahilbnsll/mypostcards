You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
color-filter-gallery.tsx
"use client";

import * as React from "react";

export type ColorName = "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink";
export type ColorFilterValue = ColorName | "all";

export interface ColorFilterItem {
  src: string;
  alt?: string;
  title?: string;
  /** Dominant color of the photo. Detected from the image when omitted. */
  color?: ColorName;
}

export interface ColorFilterGalleryProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  items: ColorFilterItem[];
  columns?: number;
  /** CSS aspect-ratio of each photo, e.g. "5 / 4". */
  aspect?: string;
  gap?: number;
  /** Selected color, or "all". Leave undefined to let the gallery manage it. */
  value?: ColorFilterValue;
  defaultValue?: ColorFilterValue;
  onValueChange?: (value: ColorFilterValue) => void;
  /** Step through the colors on its own until someone picks one. */
  autoplay?: boolean;
  /** Milliseconds between colors in autoplay. */
  interval?: number;
  /** Milliseconds for a photo to bloom from black and white into color. */
  bloomDuration?: number;
  /** React 19 passes `ref` as a regular prop. */
  ref?: React.Ref<HTMLDivElement>;
}

const COLORS: ColorName[] = ["red", "orange", "yellow", "green", "blue", "purple", "pink"];
const SWATCH: Record<ColorName, string> = {
  red: "#ef4444",
  orange: "#f97316",
  yellow: "#eab308",
  green: "#22c55e",
  blue: "#3b82f6",
  purple: "#8b5cf6",
  pink: "#ec4899",
};
const LABEL: Record<ColorName, string> = {
  red: "Red",
  orange: "Orange",
  yellow: "Yellow",
  green: "Green",
  blue: "Blue",
  purple: "Purple",
  pink: "Pink",
};
const IDLE_MS = 6000;
const READY_FALLBACK_MS = 1500;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function bucketOf(hue: number, saturation = 1, value = 1): ColorName {
  if ((hue >= 330 || hue < 22) && saturation < 0.6 && value > 0.62) return "pink";
  if (hue < 12 || hue >= 345) return "red";
  if (hue < 37) return "orange";
  if (hue < 68) return "yellow";
  if (hue < 170) return "green";
  if (hue < 255) return "blue";
  if (hue < 290) return "purple";
  return "pink";
}

// Dominant hue of a 32×32 downsample: saturated, bright pixels vote into 10° bins and the
// strongest neighbourhood wins. Needs CORS; resolves null when the canvas is tainted.
function detectColor(src: string): Promise<ColorName | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => {
      try {
        const size = 32;
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) return resolve(null);
        context.drawImage(image, 0, 0, size, size);
        const { data } = context.getImageData(0, 0, size, size);
        const bins = new Array<number>(36).fill(0);
        const satSum = new Array<number>(36).fill(0);
        const valSum = new Array<number>(36).fill(0);
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]! / 255;
          const g = data[i + 1]! / 255;
          const b = data[i + 2]! / 255;
          const max = Math.max(r, g, b);
          const delta = max - Math.min(r, g, b);
          const saturation = max === 0 ? 0 : delta / max;
          if (saturation < 0.25 || max < 0.18) continue;
          let hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
          hue = (hue * 60 + 360) % 360;
          const bin = Math.floor(hue / 10) % 36;
          const weight = saturation * max;
          bins[bin] = (bins[bin] ?? 0) + weight;
          satSum[bin] = (satSum[bin] ?? 0) + saturation * weight;
          valSum[bin] = (valSum[bin] ?? 0) + max * weight;
        }
        let best = -1;
        let bestWeight = 0;
        for (let k = 0; k < 36; k++) {
          const weight = (bins[(k + 35) % 36] ?? 0) * 0.5 + (bins[k] ?? 0) + (bins[(k + 1) % 36] ?? 0) * 0.5;
          if (weight > bestWeight) {
            bestWeight = weight;
            best = k;
          }
        }
        if (best < 0) return resolve(null);
        const total = bins[best] ?? 0;
        resolve(bucketOf(best * 10 + 5, total ? (satSum[best] ?? 0) / total : 1, total ? (valSum[best] ?? 0) / total : 1));
      } catch {
        resolve(null);
      }
    };
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

export function ColorFilterGallery({
  items,
  columns = 4,
  aspect = "5 / 4",
  gap = 8,
  value: controlledValue,
  defaultValue = "red",
  onValueChange,
  autoplay = true,
  interval = 2800,
  bloomDuration = 750,
  ref,
  className,
  ...rest
}: ColorFilterGalleryProps) {
  const [internalValue, setInternalValue] = React.useState<ColorFilterValue>(defaultValue);
  const value = controlledValue ?? internalValue;
  const [detected, setDetected] = React.useState<Record<string, ColorName | null>>({});
  const [ready, setReady] = React.useState(false);
  const [hovered, setHovered] = React.useState<{ index: number; x: number; y: number } | null>(null);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const pausedUntil = React.useRef(0);
  const valueRef = React.useRef(value);
  valueRef.current = value;
  const requested = React.useRef(new Set<string>());
  const chipRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const colorOf = React.useCallback(
    (item: ColorFilterItem): ColorName | null => item.color ?? detected[item.src] ?? null,
    [detected],
  );
  const counts = React.useMemo(() => {
    const map = new Map<ColorName, number>();
    for (const item of items) {
      const color = colorOf(item);
      if (color) map.set(color, (map.get(color) ?? 0) + 1);
    }
    return map;
  }, [items, colorOf]);
  const present = React.useMemo(() => COLORS.filter((color) => (counts.get(color) ?? 0) > 0), [counts]);
  const choices: ColorFilterValue[] = ["all", ...present];

  const choose = React.useCallback(
    (next: ColorFilterValue, fromUser: boolean) => {
      if (fromUser) pausedUntil.current = Date.now() + IDLE_MS;
      if (controlledValue === undefined) setInternalValue(next);
      onValueChange?.(next);
    },
    [controlledValue, onValueChange],
  );

  React.useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setReducedMotion(motion.matches);
    onMotion();
    motion.addEventListener("change", onMotion);
    return () => motion.removeEventListener("change", onMotion);
  }, []);

  React.useEffect(() => {
    for (const item of items) {
      if (item.color || requested.current.has(item.src)) continue;
      requested.current.add(item.src);
      detectColor(item.src).then((color) => setDetected((prev) => ({ ...prev, [item.src]: color })));
    }
  }, [items]);

  React.useEffect(() => {
    let done = false;
    const markReady = () => {
      if (!done) setReady(true);
      done = true;
    };
    const first = valueRef.current;
    const awaited = items.filter((item) => first === "all" || item.color === first);
    const gate = awaited.length > 0 ? awaited : items;
    let loaded = 0;
    const images = items.map((item) => {
      const image = new Image();
      image.decoding = "async";
      if (gate.includes(item)) {
        image.onload = image.onerror = () => {
          loaded += 1;
          if (loaded >= gate.length) markReady();
        };
      }
      image.src = item.src;
      return image;
    });
    if (gate.length === 0) markReady();
    const fallback = window.setTimeout(markReady, READY_FALLBACK_MS);
    return () => {
      done = true;
      window.clearTimeout(fallback);
      for (const image of images) image.onload = image.onerror = null;
    };
  }, [items]);

  React.useEffect(() => {
    if (!autoplay || reducedMotion || !ready || present.length === 0) return;
    const sequence: ColorFilterValue[] = [...present, "all"];
    const timer = window.setInterval(() => {
      if (Date.now() < pausedUntil.current) return;
      const at = sequence.indexOf(valueRef.current);
      choose(sequence[(at + 1) % sequence.length]!, false);
    }, interval);
    return () => window.clearInterval(timer);
  }, [autoplay, reducedMotion, ready, present, interval, choose]);

  const onChipKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const at = Math.max(0, choices.indexOf(value));
    const next = (at + (event.key === "ArrowRight" ? 1 : -1) + choices.length) % choices.length;
    choose(choices[next]!, true);
    chipRefs.current[next]?.focus();
  };

  const matchRank = new Map<number, number>();
  items.forEach((item, index) => {
    if (value === "all" || colorOf(item) === value) matchRank.set(index, matchRank.size);
  });
  const hoveredColor = hovered ? colorOf(items[hovered.index] ?? { src: "" }) : null;
  const shown = value === "all" ? items.length : (counts.get(value) ?? 0);
  const status =
    value === "all" ? `All ${shown} photos` : `${shown} ${shown === 1 ? "photo" : "photos"} in ${LABEL[value].toLowerCase()}`;

  return (
    <div
      ref={ref}
      data-slot="color-filter-gallery"
      data-value={value}
      data-ready={ready || undefined}
      className={cx("w-full text-foreground", className)}
      {...rest}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div role="radiogroup" aria-label="Filter photos by color" className="flex flex-wrap gap-1" onKeyDown={onChipKey}>
          {choices.map((choice, i) => {
            const selected = value === choice;
            const count = choice === "all" ? items.length : (counts.get(choice) ?? 0);
            return (
              <button
                key={choice}
                ref={(node) => {
                  chipRefs.current[i] = node;
                }}
                type="button"
                role="radio"
                aria-checked={selected}
                tabIndex={selected ? 0 : -1}
                data-chip={choice}
                data-hint={choice !== "all" && hoveredColor === choice ? "" : undefined}
                onClick={() => choose(choice, true)}
                className={cx(
                  "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-medium transition-[background-color,border-color,color,box-shadow] duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  selected ? "border-foreground bg-foreground text-background" : "border-border bg-background hover:bg-accent",
                )}
                style={
                  choice !== "all" && hoveredColor === choice && !selected
                    ? { boxShadow: `0 0 0 2px ${SWATCH[choice]}55` }
                    : undefined
                }
              >
                <span
                  aria-hidden
                  className="size-2.5 rounded-full ring-1 ring-black/10"
                  style={{
                    background:
                      choice === "all"
                        ? "conic-gradient(#ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6, #ec4899, #ef4444)"
                        : SWATCH[choice],
                  }}
                />
                {choice === "all" ? "All" : LABEL[choice]}
                <span className="tabular-nums opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
        <p data-status aria-live="polite" className="text-xs text-muted-foreground">
          {status}
        </p>
      </div>

      <div role="list" className="grid" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap }}>
        {items.map((item, index) => {
          const color = colorOf(item);
          const rank = matchRank.get(index);
          const matches = rank !== undefined;
          const isHovered = hovered?.index === index;
          const colored = ready && (matches || isHovered);
          const dimmed = ready && !matches && !isHovered;
          const originX = isHovered ? hovered.x : 50;
          const originY = isHovered ? hovered.y : 50;
          const delay = colored && !isHovered && rank !== undefined ? Math.min(rank * 70, 420) : 0;
          return (
            <div key={`${item.src}-${index}`} role="listitem" className="min-w-0">
              <button
                type="button"
                data-photo={index}
                data-color={color ?? undefined}
                data-colored={colored || undefined}
                aria-label={`${item.title ?? item.alt ?? `Photo ${index + 1}`}${color ? `, ${LABEL[color].toLowerCase()}` : ""}. Show ${color ? LABEL[color].toLowerCase() : "all"} photos`}
                onClick={() => choose(color ?? "all", true)}
                onPointerEnter={(event) => {
                  if (event.pointerType === "touch") return;
                  const rect = event.currentTarget.getBoundingClientRect();
                  setHovered({
                    index,
                    x: ((event.clientX - rect.left) / rect.width) * 100,
                    y: ((event.clientY - rect.top) / rect.height) * 100,
                  });
                }}
                onPointerLeave={() => setHovered((current) => (current?.index === index ? null : current))}
                onFocus={() => setHovered({ index, x: 50, y: 50 })}
                onBlur={() => setHovered((current) => (current?.index === index ? null : current))}
                className={cx(
                  "group relative block w-full overflow-hidden rounded-xl bg-muted text-left outline-none ease-out",
                  "transition-[opacity,transform] duration-500",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
                style={{ aspectRatio: aspect, opacity: dimmed ? 0.42 : 1, transform: dimmed ? "scale(0.97)" : "scale(1)" }}
              >
                <img
                  src={item.src}
                  alt={item.alt ?? item.title ?? ""}
                  draggable={false}
                  className="absolute inset-0 size-full object-cover"
                  style={{ filter: "grayscale(1) contrast(1.06)" }}
                />
                <img
                  src={item.src}
                  alt=""
                  aria-hidden
                  data-bloom
                  draggable={false}
                  className="absolute inset-0 size-full object-cover"
                  style={{
                    clipPath: `circle(${colored ? 150 : 0}% at ${originX}% ${originY}%)`,
                    transition: reducedMotion
                      ? "none"
                      : colored
                        ? `clip-path ${bloomDuration}ms cubic-bezier(0.22, 0.8, 0.2, 1) ${delay}ms`
                        : `clip-path ${Math.round(bloomDuration * 0.55)}ms cubic-bezier(0.4, 0, 1, 1)`,
                  }}
                />
                {color && (
                  <span
                    aria-hidden
                    className="absolute left-2 top-2 size-2.5 rounded-full ring-2 ring-white/80 transition-[opacity,transform] duration-300"
                    style={{
                      background: SWATCH[color],
                      opacity: colored ? 1 : 0,
                      transform: colored ? "scale(1)" : "scale(0.4)",
                      transitionDelay: colored ? `${delay + bloomDuration * 0.4}ms` : "0ms",
                    }}
                  />
                )}
                {item.title && (
                  <span
                    className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-2.5 pb-2 pt-6 text-[11px] font-medium text-white transition-opacity duration-300"
                    style={{ opacity: colored ? 1 : 0 }}
                  >
                    {item.title}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ColorFilterGallery;


demo.tsx
"use client";

import { ColorFilterGallery } from "@/components/ui/color-filter-gallery";
import type { ColorFilterItem, ColorName } from "@/components/ui/color-filter-gallery";

const settings = {
  autoplay: true,
  interval: 2800,
  bloomDuration: 750,
  columns: 4,
};

const PHOTOS: Array<{ id: string; title: string; color: ColorName }> = [
  { id: "photo-1644088302289-29e0a0c6a36b", title: "Lantern street", color: "red" },
  { id: "photo-1559617519-66f3814bfdb3", title: "Blue alley", color: "blue" },
  { id: "photo-1595756035507-995aad5d5de3", title: "Sunflower field", color: "yellow" },
  { id: "photo-1530092140914-77b08774835e", title: "Flamingo", color: "pink" },
  { id: "photo-1495758874721-e9da827a0581", title: "Fern", color: "green" },
  { id: "photo-1623867452962-d2a44d65dd79", title: "Red parasol", color: "red" },
  { id: "photo-1595562161314-4ed3f3503826", title: "Lavender", color: "purple" },
  { id: "photo-1518614768202-663a3a0ecf59", title: "Vintage cab", color: "yellow" },
  { id: "photo-1558286598-73a6be5c16b0", title: "Blue door", color: "blue" },
  { id: "photo-1522383225653-ed111181a951", title: "Cherry blossom", color: "pink" },
  { id: "photo-1610047629542-464f7210209a", title: "Dune by the sea", color: "orange" },
  { id: "photo-1480996408299-fc0e830b5db1", title: "Rice terraces", color: "green" },
];

const ITEMS: ColorFilterItem[] = PHOTOS.map(({ id, title, color }) => ({
  src: `https://images.unsplash.com/${id}?w=640&h=512&fit=crop&q=80&auto=format`,
  alt: title,
  title,
  color,
}));

const CCGATHER_URL = "https://ccgather.com/?utm_source=21st&utm_medium=component&utm_campaign=color_filter_gallery";

export default function Demo(props: Partial<typeof settings> & { autoDetect?: boolean }) {
  const { autoDetect, ...overrides } = props;
  const s = { ...settings, ...overrides };
  const items = autoDetect ? ITEMS.map(({ color: _color, ...rest }) => rest) : ITEMS;
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-5 bg-background p-6 text-foreground">
      <ColorFilterGallery
        items={items}
        autoplay={s.autoplay}
        interval={s.interval}
        bloomDuration={s.bloomDuration}
        columns={s.columns}
        className="max-w-3xl"
      />
      <p className="text-xs text-muted-foreground">
        Pick a color and the photos that carry it bloom out of black and white. Click a photo to see more in its color.{" "}
        <a href={CCGATHER_URL} target="_blank" rel="noreferrer" className="underline underline-offset-4 transition-colors hover:text-foreground">
          By the CCgather team
        </a>
      </p>
    </div>
  );
}

```

You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
polaroid-line-carousel.tsx
"use client"

import * as React from "react"

/*
 * Polaroid Line Carousel — instant photos pegged to a sagging string. Drag the
 * line (or use the arrows) and the prints slide along it, swinging on their
 * pegs with the speed you give them and settling back with a little
 * overshoot; even at rest they sway in a light breeze. The one in the middle
 * is the one you're looking at.
 *
 * Drag, click a print, ←/→ and autoplay. Slides without an `image` get a
 * painted landscape, so it works with no assets at all.
 */

export type LandPalette = "dawn" | "alpine" | "dusk" | "mist"

export type Slide = {
  image?: string
  title?: string
  caption?: string
  alt?: string
  /** Palette and seed of the painted landscape used when `image` is empty. */
  palette?: LandPalette
  seed?: number
}

export type PolaroidLineCarouselProps = {
  slides?: Slide[]
  /** Any CSS length. Default 100svh. */
  height?: number | string
  /** Width of a print in px (it shrinks on narrow screens). */
  cardWidth?: number
  /** How far the string sags in the middle, px. */
  sag?: number
  /** How much the prints swing; 0 holds them still. */
  swing?: number
  /** ms per print; 0 turns autoplay off. It waits while someone is interacting. */
  autoplay?: number
  /** Colour of the string and pegs. */
  string?: string
  background?: string
  ink?: string
  onChange?: (index: number) => void
  className?: string
  style?: React.CSSProperties
  ariaLabel?: string
}

// #region logic
export function wrap(i: number, n: number): number {
  return n ? ((i % n) + n) % n : 0
}

export function clamp(v: number, a: number, b: number): number {
  return Math.min(b, Math.max(a, v))
}

/** Height of a string sagging by `sag` between (0, y0) and (w, y0), at x. */
export function stringY(x: number, w: number, y0: number, sag: number): number {
  const t = clamp(x / w, 0, 1)
  return y0 + 4 * sag * t * (1 - t)
}

/** One step of a critically damped spring toward target. */
export function springStep(x: number, v: number, target: number, dt: number, k = 70): [number, number] {
  const c = 2 * Math.sqrt(k)
  const nv = v + (k * (target - x) - c * v) * dt
  return [x + nv * dt, nv]
}

/** One step of a print's swing. lineVel is the prints' on-screen speed (px/s, + = moving right); a print lags behind the motion, is pulled back by gravity and damped. */
export function swingStep(a: number, w: number, lineVel: number, dt: number, gain: number): [number, number] {
  const nw = w + (-38 * a - 4.2 * w + lineVel * 0.0034 * gain) * dt
  return [clamp(a + nw * dt, -0.6, 0.6), nw]
}

/** Index of the print nearest the centre for a line offset. */
export function nearestAt(off: number, spacing: number, n: number): number {
  return clamp(Math.round(off / spacing), 0, Math.max(0, n - 1))
}

export function pad2(n: number): string {
  return n < 10 ? "0" + n : String(n)
}
// #endregion logic

/* ------------------------------------------------------- painted images */

const PALETTES = {
  dawn: { top: "#e7b7a5", bottom: "#f8e8d6", sun: "#fff4df", far: "#d2b2bb", near: "#3a2a3b", mist: "255,240,232" },
  alpine: { top: "#7ea5c8", bottom: "#e3ecf2", sun: "#ffffff", far: "#a9bfd0", near: "#1c3044", mist: "236,244,250" },
  dusk: { top: "#2a2450", bottom: "#ef8d60", sun: "#ffd9a6", far: "#93607c", near: "#18121f", mist: "255,196,160" },
  mist: { top: "#c4d0cb", bottom: "#eef1ec", sun: "#ffffff", far: "#aebcb5", near: "#2c3a33", mist: "246,248,245" },
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function hexRgb(h: string): [number, number, number] {
  const v = parseInt(h.replace("#", ""), 16)
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
}
function mixRgb(a: string, b: string, t: number): string {
  const A = hexRgb(a)
  const B = hexRgb(b)
  return "rgb(" + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",") + ")"
}

// A layered-ridge landscape: sky, a low sun, five ridges fading into haze with
// mist between them, a tree line on the nearest, film grain. Painted once.
function paintLandscape(seed: number, palette: LandPalette, w = 1600, h = 1000): string {
  if (typeof document === "undefined") return ""
  const c = document.createElement("canvas")
  c.width = w
  c.height = h
  const g = c.getContext("2d")
  if (!g) return ""
  const P = PALETTES[palette] ?? PALETTES.dawn
  const r = mulberry32(seed * 104729 + 7)

  const sky = g.createLinearGradient(0, 0, 0, h * 0.72)
  sky.addColorStop(0, P.top)
  sky.addColorStop(1, P.bottom)
  g.fillStyle = sky
  g.fillRect(0, 0, w, h)
  const sx = w * (0.22 + r() * 0.56)
  const sy = h * (0.26 + r() * 0.16)
  const halo = g.createRadialGradient(sx, sy, 0, sx, sy, w * 0.45)
  halo.addColorStop(0, "rgba(" + hexRgb(P.sun).join(",") + ",.85)")
  halo.addColorStop(0.08, "rgba(" + hexRgb(P.sun).join(",") + ",.55)")
  halo.addColorStop(1, "rgba(" + hexRgb(P.sun).join(",") + ",0)")
  g.fillStyle = halo
  g.fillRect(0, 0, w, h)
  g.fillStyle = P.sun
  g.beginPath()
  g.arc(sx, sy, h * 0.045, 0, Math.PI * 2)
  g.fill()

  const layers = 5
  for (let L = 0; L < layers; L++) {
    const k = L / (layers - 1)
    const base = h * (0.42 + k * 0.4)
    const amp = h * (0.07 + k * 0.1)
    const ph = [r(), r(), r(), r()].map((v) => v * Math.PI * 2)
    const fr = [1.3 + r(), 3.1 + r() * 2, 7 + r() * 4, 17 + r() * 8]
    const ridge = (x: number) => {
      const u = x / w
      return (
        base -
        amp *
          (0.55 * Math.sin(u * fr[0] + ph[0]) +
            0.28 * Math.sin(u * fr[1] + ph[1]) +
            0.12 * Math.abs(Math.sin(u * fr[2] + ph[2])) +
            0.05 * Math.sin(u * fr[3] + ph[3]))
      )
    }
    const mist = g.createLinearGradient(0, base - amp * 1.4, 0, base + amp * 0.4)
    mist.addColorStop(0, "rgba(" + P.mist + ",0)")
    mist.addColorStop(1, "rgba(" + P.mist + "," + (0.55 - k * 0.35).toFixed(2) + ")")
    g.fillStyle = mist
    g.fillRect(0, base - amp * 1.4, w, amp * 1.8)
    const body = g.createLinearGradient(0, base - amp, 0, h)
    body.addColorStop(0, mixRgb(P.far, P.near, Math.pow(k, 1.3)))
    body.addColorStop(1, mixRgb(P.far, P.near, Math.min(1, Math.pow(k, 1.3) + 0.18)))
    g.fillStyle = body
    g.beginPath()
    g.moveTo(0, h)
    for (let x = 0; x <= w; x += 6) g.lineTo(x, ridge(x))
    g.lineTo(w, h)
    g.closePath()
    g.fill()
    if (L >= layers - 2) {
      g.fillStyle = mixRgb(P.far, P.near, Math.min(1, Math.pow(k, 1.3) + 0.08))
      for (let x = 0; x < w; x += 7 + r() * 9) {
        if (r() < 0.35) continue
        const y = ridge(x) + 2
        const th = h * (0.025 + r() * 0.035) * (0.6 + k)
        const tw = th * 0.32
        g.beginPath()
        g.moveTo(x, y - th)
        g.lineTo(x + tw, y)
        g.lineTo(x - tw, y)
        g.closePath()
        g.fill()
      }
    }
  }

  const vig = g.createRadialGradient(w / 2, h * 0.45, h * 0.3, w / 2, h / 2, w * 0.78)
  vig.addColorStop(0, "rgba(0,0,0,0)")
  vig.addColorStop(1, "rgba(0,0,0,.32)")
  g.fillStyle = vig
  g.fillRect(0, 0, w, h)
  const grain = g.getImageData(0, 0, w, h)
  const d = grain.data
  for (let i = 0; i < d.length; i += 4) {
    const v = (r() - 0.5) * 14
    d[i] += v
    d[i + 1] += v
    d[i + 2] += v
  }
  g.putImageData(grain, 0, 0)
  return c.toDataURL("image/jpeg", 0.88)
}

const DEFAULT_SLIDES: Slide[] = [
  { title: "First Light", caption: "Haze lifting off the eastern ridges.", palette: "dawn", seed: 3 },
  { title: "High Pass", caption: "Cold air, clear to the far range.", palette: "alpine", seed: 8 },
  { title: "Ember Hour", caption: "The last of the sun on the valley floor.", palette: "dusk", seed: 14 },
  { title: "Still Valley", caption: "Morning mist that never quite lifts.", palette: "mist", seed: 21 },
  { title: "Rose Ridge", caption: "Five ridges, one long exhale.", palette: "dawn", seed: 34 },
  { title: "Blue Hour", caption: "Pines going dark against the snow.", palette: "alpine", seed: 55 },
]

// Every slide as an image URL; slides without one are painted after mount.
function useSlideImages(slides: Slide[]): string[] {
  const key = slides.map((s) => s.image || (s.palette || "dawn") + ":" + (s.seed ?? 1)).join("|")
  const [painted, setPainted] = React.useState(() => slides.map(() => ""))
  React.useEffect(() => {
    setPainted(slides.map((s, i) => (s.image ? "" : paintLandscape(s.seed ?? i + 1, s.palette || "dawn"))))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return slides.map((s, i) => s.image || painted[i] || "")
}

const PL_CSS = [
  ".pl-root{position:relative;width:100%;overflow:hidden;background:var(--pl-bg);color:var(--pl-ink);user-select:none;-webkit-user-select:none;touch-action:pan-y;outline:none;cursor:grab}",
  ".pl-root[data-drag='1']{cursor:grabbing}",
  ".pl-root:focus-visible{box-shadow:inset 0 0 0 2px var(--pl-ink)}",
  ".pl-string{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;overflow:visible}",
  ".pl-card{position:absolute;left:0;top:0;width:var(--pl-cw);transform-origin:50% 0;will-change:transform;cursor:inherit}",
  ".pl-print{margin-top:10px;background:#fbfaf7;padding:10px 10px 0;box-shadow:0 1px 2px rgba(0,0,0,.12),0 18px 30px -16px rgba(0,0,0,.4);transition:transform .5s cubic-bezier(.2,.7,.2,1),filter .5s ease}",
  ".pl-card[data-on='0'] .pl-print{transform:scale(.9);filter:saturate(.7) brightness(.96)}",
  ".pl-shot{position:relative;aspect-ratio:1;overflow:hidden;background:#d9d5cc}",
  ".pl-shot img{position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:cover;display:block;pointer-events:none}",
  ".pl-note{height:46px;display:flex;align-items:center;justify-content:center;padding:0 6px;font:italic 400 15px/1.1 ui-serif,Georgia,'Times New Roman',serif;color:#3b3833;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
  ".pl-peg{position:absolute;left:50%;top:0;width:10px;height:26px;margin-left:-5px;border-radius:2px;background:linear-gradient(90deg,#c9a67a,#e3c9a1 45%,#b8915f);box-shadow:0 2px 3px rgba(0,0,0,.25)}",
  ".pl-peg::after{content:'';position:absolute;left:4px;top:8px;width:2px;height:7px;background:rgba(80,60,30,.45);border-radius:1px}",
  ".pl-bar{position:absolute;left:clamp(16px,4vw,56px);right:clamp(16px,4vw,56px);bottom:clamp(20px,4vh,40px);display:flex;align-items:center;gap:clamp(12px,2vw,24px);cursor:default}",
  ".pl-cap{flex:1;min-width:0;overflow:hidden;padding-bottom:.15em}",
  ".pl-cap>*{display:block;animation:pl-in .55s cubic-bezier(.2,.8,.2,1) both}",
  ".pl-title{font:500 clamp(18px,2.2vw,26px)/1.15 ui-serif,Georgia,'Times New Roman',serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
  ".pl-sub{margin-top:4px;font:400 13px/1.4 ui-sans-serif,system-ui,sans-serif;color:var(--pl-muted)}",
  ".pl-count{font:500 12px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.14em;color:var(--pl-muted)}",
  ".pl-count b{color:var(--pl-ink);font-weight:500}",
  ".pl-btn{appearance:none;width:40px;height:40px;border-radius:50%;border:1px solid var(--pl-line);background:transparent;color:inherit;display:grid;place-items:center;cursor:pointer;transition:background .2s ease,color .2s ease}",
  ".pl-btn:hover{background:var(--pl-ink);color:var(--pl-bg)}",
  ".pl-btn:focus-visible{outline:2px solid var(--pl-ink);outline-offset:2px}",
  ".pl-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}",
  "@keyframes pl-in{from{transform:translateY(100%);opacity:0}to{transform:none;opacity:1}}",
  "@media (prefers-reduced-motion:reduce){.pl-cap>*{animation:none}.pl-print{transition:none}}",
].join("
")

export default function PolaroidLineCarousel({
  slides = DEFAULT_SLIDES,
  height = "100svh",
  cardWidth = 300,
  sag = 46,
  swing = 1,
  autoplay = 4500,
  string = "#8a7f72",
  background = "var(--color-background, #efece6)",
  ink = "var(--color-foreground, #161513)",
  onChange,
  className,
  style,
  ariaLabel = "Image carousel",
}: PolaroidLineCarouselProps) {
  const n = slides.length
  const srcs = useSlideImages(slides)
  const [active, setActive] = React.useState(0)
  const [dragging, setDragging] = React.useState(false)
  const [size, setSize] = React.useState({ w: 1200, h: 800, cw: cardWidth })
  const rootRef = React.useRef(null as HTMLDivElement | null)
  const pathRef = React.useRef(null as SVGPathElement | null)
  const cards = React.useRef([] as (HTMLDivElement | null)[])
  const sim = React.useRef({ off: 0, vel: 0, target: 0, a: [] as number[], w: [] as number[] })
  const drag = React.useRef(null as null | { x: number; off: number; lx: number; lt: number; v: number; moved: boolean })
  const lastTouch = React.useRef(0)
  const activeRef = React.useRef(0)
  const opts = React.useRef({ sag, swing })
  opts.current = { sag, swing }

  const spacing = size.cw * 1.08
  const goTo = React.useCallback(
    (i: number) => {
      sim.current.target = clamp(i, 0, n - 1) * spacing
    },
    [n, spacing],
  )

  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ro = new ResizeObserver(() => {
      const r = root.getBoundingClientRect()
      const cw = Math.round(Math.max(150, Math.min(cardWidth, r.width * 0.42, r.height * 0.42)))
      setSize({ w: r.width, h: r.height, cw })
    })
    ro.observe(root)
    return () => ro.disconnect()
  }, [cardWidth])

  // keep the target on the active print when the spacing changes
  React.useEffect(() => {
    sim.current.target = activeRef.current * spacing
    sim.current.off = activeRef.current * spacing
  }, [spacing])

  React.useEffect(() => {
    onChange?.(active)
  }, [active, onChange])

  // the simulation, written straight to the DOM each frame
  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let visible = true
    let raf = 0
    let prev = performance.now()
    const S = sim.current
    const frame = (now: number) => {
      raf = 0
      if (!visible) return
      const dt = Math.min(0.033, (now - prev) / 1000)
      prev = now
      const { w, h, cw } = size
      const y0 = Math.max(40, h * 0.2)
      const d = drag.current
      let lineVel: number
      if (d && d.moved) {
        lineVel = d.v * 1000
      } else {
        const before = S.off
        ;[S.off, S.vel] = springStep(S.off, S.vel, S.target, dt)
        lineVel = -(S.off - before) / Math.max(dt, 1e-3)
      }
      const o = opts.current
      const g = reduce ? 0 : o.swing
      const near = nearestAt(S.off, spacing, n)
      for (let i = 0; i < n; i++) {
        const el = cards.current[i]
        if (!el) continue
        const x = w / 2 + i * spacing - S.off
        if (x < -cw * 1.5 || x > w + cw * 1.5) {
          el.style.visibility = "hidden"
          continue
        }
        el.style.visibility = "visible"
        let a = S.a[i] || 0
        let av = S.w[i] || 0
        ;[a, av] = swingStep(a, av, lineVel, dt, g)
        if (g) a += Math.sin(now / 1300 + i * 1.7) * 0.0009 * g
        S.a[i] = a
        S.w[i] = av
        const y = stringY(x, w, y0, o.sag) - 6
        el.style.transform = "translate(" + (x - cw / 2).toFixed(1) + "px," + y.toFixed(1) + "px) rotate(" + a.toFixed(4) + "rad)"
        el.style.zIndex = String(i === near ? n + 1 : n - Math.abs(i - near))
      }
      pathRef.current?.setAttribute("d", "M0 " + y0 + " Q" + w / 2 + " " + (y0 + 2 * o.sag) + " " + w + " " + y0)
      if (near !== activeRef.current) {
        activeRef.current = near
        setActive(near)
      }
      raf = requestAnimationFrame(frame)
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !raf) {
        prev = performance.now()
        raf = requestAnimationFrame(frame)
      }
    })
    io.observe(root)
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [size, spacing, n])

  // autoplay, back to the first print after the last
  React.useEffect(() => {
    if (!autoplay || n < 2) return
    const t = window.setInterval(() => {
      if (document.hidden || drag.current || performance.now() - lastTouch.current < autoplay) return
      goTo(activeRef.current >= n - 1 ? 0 : activeRef.current + 1)
    }, autoplay)
    return () => window.clearInterval(t)
  }, [autoplay, n, goTo])

  const onDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest(".pl-bar")) return
    lastTouch.current = performance.now()
    drag.current = { x: e.clientX, off: sim.current.off, lx: e.clientX, lt: e.timeStamp, v: 0, moved: false }
  }
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true
      setDragging(true)
      rootRef.current?.setPointerCapture(e.pointerId)
    }
    if (!d.moved) return
    const dt = Math.max(1, e.timeStamp - d.lt)
    d.v = 0.7 * ((e.clientX - d.lx) / dt) + 0.3 * d.v
    d.lx = e.clientX
    d.lt = e.timeStamp
    const max = (n - 1) * spacing
    let off = d.off - dx
    if (off < 0) off *= 0.35
    if (off > max) off = max + (off - max) * 0.35
    sim.current.off = off
  }
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current
    drag.current = null
    lastTouch.current = performance.now()
    if (!d) return
    if (d.moved) {
      setDragging(false)
      sim.current.vel = -d.v * 1000
      goTo(nearestAt(sim.current.off - d.v * 180, spacing, n))
      return
    }
    const card = (e.target as HTMLElement).closest("[data-i]")
    if (card) goTo(Number(card.getAttribute("data-i")))
  }
  const step = (dir: number) => {
    lastTouch.current = performance.now()
    goTo(clamp(activeRef.current + dir, 0, n - 1))
  }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") step(1)
    else if (e.key === "ArrowLeft") step(-1)
    else return
    e.preventDefault()
  }

  const s = slides[active] || {}

  return (
    <div
      ref={rootRef}
      className={["pl-root", className].filter(Boolean).join(" ")}
      style={{
        height,
        ["--pl-bg" as string]: background,
        ["--pl-ink" as string]: ink,
        ["--pl-muted" as string]: "color-mix(in srgb, var(--pl-ink) 55%, transparent)",
        ["--pl-line" as string]: "color-mix(in srgb, var(--pl-ink) 18%, transparent)",
        ["--pl-cw" as string]: size.cw + "px",
        ...style,
      }}
      data-drag={dragging ? "1" : "0"}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKey}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <style>{PL_CSS}</style>
      <svg className="pl-string" aria-hidden="true">
        <path ref={pathRef} fill="none" stroke={string} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {slides.map((sl, i) => (
        <div key={i} className="pl-card" data-i={i} data-on={i === active ? "1" : "0"} ref={(el) => void (cards.current[i] = el)} aria-hidden={i === active ? undefined : true}>
          <div className="pl-print">
            <div className="pl-shot">{srcs[i] ? <img src={srcs[i]} alt={sl.alt || sl.title || ""} draggable={false} /> : null}</div>
            <div className="pl-note">{sl.title || ""}</div>
          </div>
          <div className="pl-peg" />
        </div>
      ))}
      <div className="pl-bar">
        <div className="pl-cap" key={active} aria-hidden="true">
          {s.title ? <span className="pl-title">{s.title}</span> : null}
          {s.caption ? <span className="pl-sub">{s.caption}</span> : null}
        </div>
        <span className="pl-count" aria-hidden="true">
          <b>{pad2(active + 1)}</b> / {pad2(n)}
        </span>
        <button type="button" className="pl-btn" aria-label="Previous" onClick={() => step(-1)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
        <button type="button" className="pl-btn" aria-label="Next" onClick={() => step(1)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
      </div>
      <div className="pl-sr" aria-live="polite">
        {"Print " + (active + 1) + " of " + n + (s.title ? ": " + s.title : "")}
      </div>
    </div>
  )
}


demo.tsx
"use client"

import PolaroidLineCarousel from "@/components/ui/polaroid-line-carousel"

// Real landscape photography (Unsplash).
const U = (id: string) => "https://images.unsplash.com/photo-" + id + "?q=80&w=1800&auto=format&fit=crop"

export default function DemoPhotos() {
  return (
    <PolaroidLineCarousel
      slides={[
        { image: U("1506905925346-21bda4d32df4"), title: "Above the Clouds", caption: "Valais, Switzerland — sunrise at 3,100 m." },
        { image: U("1501785888041-af3ef285b470"), title: "Glass Lake", caption: "Lago di Braies, a rowboat at noon." },
        { image: U("1469474968028-56623f02e42e"), title: "Gold Valley", caption: "Late light pouring over the ridge." },
        { image: U("1464822759023-fed622ff2c3b"), title: "Snow Line", caption: "Pines, river flats and the high range." },
        { image: U("1500534314209-a25ddb2bd429"), title: "Blue Ridges", caption: "Seven layers of haze before dusk." },
        { image: U("1433086966358-54859d0ed716"), title: "Falls Bridge", caption: "Multnomah Falls after the rain." },
      ]}
    />
  )
}

```


You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
focus-cards.tsx
"use client";
import Image from "next/image";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

export const Card = React.memo(
  ({
    card,
    index,
    hovered,
    setHovered,
  }: {
    card: any;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
  }) => (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "rounded-lg relative bg-gray-100 dark:bg-neutral-900 overflow-hidden h-60 md:h-96 w-full transition-all duration-300 ease-out",
        hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
      )}
    >
      <Image
        src={card.src}
        alt={card.title}
        fill
        className="object-cover absolute inset-0"
      />
      <div
        className={cn(
          "absolute inset-0 bg-black/50 flex items-end py-8 px-4 transition-opacity duration-300",
          hovered === index ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="text-xl md:text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-200">
          {card.title}
        </div>
      </div>
    </div>
  )
);

Card.displayName = "Card";

type Card = {
  title: string;
  src: string;
};

export function FocusCards({ cards }: { cards: Card[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto md:px-8 w-full">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
    </div>
  );
}


demo.tsx
import { FocusCards } from "@/components/ui/focus-cards";

export function FocusCardsDemo() {
  const cards = [
    {
      title: "Forest Adventure",
      src: "https://cdn.21st.dev/assets/mirror/0b/0b19c5c1fabaec64306b1368da5b246f8ccd4d28d538ce6fea29d47374c0abc0.jpg",
    },
    {
      title: "Valley of life",
      src: "https://cdn.21st.dev/assets/mirror/c4/c43517f5768dc5dc981f7dbb4a91e549679a8bd9d3c81b0a6ad639d25bc930f1.jpg",
    },
    {
      title: "Sala behta hi jayega",
      src: "https://cdn.21st.dev/assets/mirror/77/773e007a928155eaec093cec79f4cd2adb718b6fb50b5b5469623d8b1492b076.jpg",
    },
    {
      title: "Camping is for pros",
      src: "https://cdn.21st.dev/assets/mirror/b0/b0a3b9eff623f3779d3543114c7a128d6269c7decb5aea47f5738fae078d37ec.jpg",
    },
    {
      title: "The road not taken",
      src: "https://cdn.21st.dev/assets/mirror/23/2397ae82f36c0da8c02a48ef12d073eca7c785c062c799add5329f4d7836423b.jpg",
    },
    {
      title: "The First Rule",
      src: "https://cdn.21st.dev/assets/mirror/55/55322fc4f6b2cf723261097a093416ebc513dba7d9c39173015e533c71695dbd.png",
    },
  ];

  return <FocusCards cards={cards} />;
}

```


You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
scroll-morph-hero.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";

// --- Utility ---
// function cn(...inputs: ClassValue[]) {
//     return twMerge(clsx(inputs));
// }

// --- Types ---
export type AnimationPhase = "scatter" | "line" | "circle" | "bottom-strip";

interface FlipCardProps {
    src: string;
    index: number;
    total: number;
    phase: AnimationPhase;
    target: { x: number; y: number; rotation: number; scale: number; opacity: number };
}

// --- FlipCard Component ---
const IMG_WIDTH = 60;  // Reduced from 100
const IMG_HEIGHT = 85; // Reduced from 140

function FlipCard({
    src,
    index,
    total,
    phase,
    target,
}: FlipCardProps) {
    return (
        <motion.div
            // Smoothly animate to the coordinates defined by the parent
            animate={{
                x: target.x,
                y: target.y,
                rotate: target.rotation,
                scale: target.scale,
                opacity: target.opacity,
            }}
            transition={{
                type: "spring",
                stiffness: 40,
                damping: 15,
            }}

            // Initial style
            style={{
                position: "absolute",
                width: IMG_WIDTH,
                height: IMG_HEIGHT,
                transformStyle: "preserve-3d", // Essential for the 3D hover effect
                perspective: "1000px",
            }}
            className="cursor-pointer group"
        >
            <motion.div
                className="relative h-full w-full"
                style={{ transformStyle: "preserve-3d" }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                whileHover={{ rotateY: 180 }}
            >
                {/* Front Face */}
                <div
                    className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg bg-gray-200"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    <img
                        src={src}
                        alt={`hero-${index}`}
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-transparent" />
                </div>

                {/* Back Face */}
                <div
                    className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg bg-gray-900 flex flex-col items-center justify-center p-4 border border-gray-700"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                    <div className="text-center">
                        <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest mb-1">View</p>
                        <p className="text-xs font-medium text-white">Details</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// --- Main Hero Component ---
const TOTAL_IMAGES = 20;
const MAX_SCROLL = 3000; // Virtual scroll range

// Unsplash Images
const IMAGES = [
    "https://cdn.21st.dev/assets/mirror/4d/4d1bff4ea8b9f400dff7ae405f92e15bd39ec76e9285c7d96017e64ba1de3ae1.jpg",
    "https://cdn.21st.dev/assets/mirror/ee/ee36e332fe99d7611c43b90511db08a4f84e4545caa78e7b52e9ccffe273864b.jpg",
    "https://cdn.21st.dev/assets/mirror/dd/dddeaa4e6132c65bf7ff99d197f792a30937b5cbfe97a2b1ee54a793684df52e.jpg",
    "https://cdn.21st.dev/assets/mirror/48/487977107b5011b5e1c25289f6e4393ef555e1a92daee554788e9363b233ca14.jpg",
    "https://cdn.21st.dev/assets/mirror/a1/a12509688be6c9d3b2cb26d2ea1cfce48b8a8dbf2653e17be8a3fc31bd69f162.jpg",
    "https://cdn.21st.dev/assets/mirror/05/051f9e565b5b0b221384d9c27a0760febc3fb48d190c046adfda579f3614c958.jpg",
    "https://cdn.21st.dev/assets/mirror/87/87d4f60a4465d19d14b8acefa46275df4ccd767ccea6d7f234ea5bad99cfec56.jpg",
    "https://cdn.21st.dev/assets/mirror/06/0610989e0675a12c02d35aa5464e2644bf77913214b748b73a894808d2d79877.jpg",
    "https://cdn.21st.dev/assets/mirror/fe/fe90b90751e671a9526134c4743e2fcbf6c1a24991aba273ad7418c88fc9c701.jpg",
    "https://cdn.21st.dev/assets/mirror/2e/2e0452c1994fcc2130a1b8ef68e34b5ea52d1b35b80dde09b99349ad1de54598.jpg",
    "https://cdn.21st.dev/assets/mirror/84/847dc523558808119dc4bbb5218ff862ae5f5b455f33e9a0304f2f5a4b2f0f2c.jpg",
    "https://cdn.21st.dev/assets/mirror/2f/2f128763d177d6bdda3de9f0a766693406034977082bdb542138b7b74af9697b.jpg",
    "https://cdn.21st.dev/assets/mirror/30/30f8223f1d1ecc24fc8b7a9995b8ee98449b1e9fc300c14fbccec01b6a83a0ae.jpg",
    "https://cdn.21st.dev/assets/mirror/b4/b4df0e3e425ffce3b4f62fd7bc717e4dc90b94455f4d65d64fc07fe9721b0519.jpg",
    "https://cdn.21st.dev/assets/mirror/90/90c625659f072e4a701c2e37fa4ca46f25c7ca8689d723e7802fe84cf17874e9.jpg",
    "https://cdn.21st.dev/assets/mirror/6a/6aa0befc69cc3db8f3f3558d4b5e1216a5b64ceae1b86f51acf1c3f1432a8cf7.jpg",
    "https://cdn.21st.dev/assets/mirror/dc/dc126cfd753dc217945d0ea2f915e539dfe4ffb5fdea02245d0f576b25a9c4dd.jpg",
    "https://cdn.21st.dev/assets/mirror/ab/ab5f167fcb763aee7c3247fb8af97875998a7f519a6119da7dadd9cf73ae1a2c.jpg",
    "https://cdn.21st.dev/assets/mirror/57/57d6e450f7068e5f3be04907dcc0815343e67df1dc82f2da0ff1c859afc1f700.jpg",
    "https://cdn.21st.dev/assets/mirror/e4/e491359016d1494074e287dfbb55be068cffc0110017ae2257a5d4cdec193a47.jpg",
];

// Helper for linear interpolation
const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

export default function IntroAnimation() {
    const [introPhase, setIntroPhase] = useState<AnimationPhase>("scatter");
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // --- Container Size ---
    useEffect(() => {
        if (!containerRef.current) return;

        const handleResize = (entries: ResizeObserverEntry[]) => {
            for (const entry of entries) {
                setContainerSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                });
            }
        };

        const observer = new ResizeObserver(handleResize);
        observer.observe(containerRef.current);

        // Initial set
        setContainerSize({
            width: containerRef.current.offsetWidth,
            height: containerRef.current.offsetHeight,
        });

        return () => observer.disconnect();
    }, []);

    // --- Virtual Scroll Logic ---
    const virtualScroll = useMotionValue(0);
    const scrollRef = useRef(0); // Keep track of scroll value without re-renders

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            // Prevent default to stop browser overscroll/bounce
            e.preventDefault();

            const newScroll = Math.min(Math.max(scrollRef.current + e.deltaY, 0), MAX_SCROLL);
            scrollRef.current = newScroll;
            virtualScroll.set(newScroll);
        };

        // Touch support
        let touchStartY = 0;
        const handleTouchStart = (e: TouchEvent) => {
            touchStartY = e.touches[0].clientY;
        };
        const handleTouchMove = (e: TouchEvent) => {
            const touchY = e.touches[0].clientY;
            const deltaY = touchStartY - touchY;
            touchStartY = touchY;

            const newScroll = Math.min(Math.max(scrollRef.current + deltaY, 0), MAX_SCROLL);
            scrollRef.current = newScroll;
            virtualScroll.set(newScroll);
        };

        // Attach listeners to container instead of window for portability
        container.addEventListener("wheel", handleWheel, { passive: false });
        container.addEventListener("touchstart", handleTouchStart, { passive: false });
        container.addEventListener("touchmove", handleTouchMove, { passive: false });

        return () => {
            container.removeEventListener("wheel", handleWheel);
            container.removeEventListener("touchstart", handleTouchStart);
            container.removeEventListener("touchmove", handleTouchMove);
        };
    }, [virtualScroll]);

    // 1. Morph Progress: 0 (Circle) -> 1 (Bottom Arc)
    // Happens between scroll 0 and 600
    const morphProgress = useTransform(virtualScroll, [0, 600], [0, 1]);
    const smoothMorph = useSpring(morphProgress, { stiffness: 40, damping: 20 });

    // 2. Scroll Rotation (Shuffling): Starts after morph (e.g., > 600)
    // Rotates the bottom arc as user continues scrolling
    const scrollRotate = useTransform(virtualScroll, [600, 3000], [0, 360]);
    const smoothScrollRotate = useSpring(scrollRotate, { stiffness: 40, damping: 20 });

    // --- Mouse Parallax ---
    const mouseX = useMotionValue(0);
    const smoothMouseX = useSpring(mouseX, { stiffness: 30, damping: 20 });

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const relativeX = e.clientX - rect.left;

            // Normalize -1 to 1
            const normalizedX = (relativeX / rect.width) * 2 - 1;
            // Move +/- 100px
            mouseX.set(normalizedX * 100);
        };
        container.addEventListener("mousemove", handleMouseMove);
        return () => container.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX]);

    // --- Intro Sequence ---
    useEffect(() => {
        const timer1 = setTimeout(() => setIntroPhase("line"), 500);
        const timer2 = setTimeout(() => setIntroPhase("circle"), 2500);
        return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }, []);

    // --- Random Scatter Positions ---
    const scatterPositions = useMemo(() => {
        return IMAGES.map(() => ({
            x: (Math.random() - 0.5) * 1500,
            y: (Math.random() - 0.5) * 1000,
            rotation: (Math.random() - 0.5) * 180,
            scale: 0.6,
            opacity: 0,
        }));
    }, []);

    // --- Render Loop (Manual Calculation for Morph) ---
    const [morphValue, setMorphValue] = useState(0);
    const [rotateValue, setRotateValue] = useState(0);
    const [parallaxValue, setParallaxValue] = useState(0);

    useEffect(() => {
        const unsubscribeMorph = smoothMorph.on("change", setMorphValue);
        const unsubscribeRotate = smoothScrollRotate.on("change", setRotateValue);
        const unsubscribeParallax = smoothMouseX.on("change", setParallaxValue);
        return () => {
            unsubscribeMorph();
            unsubscribeRotate();
            unsubscribeParallax();
        };
    }, [smoothMorph, smoothScrollRotate, smoothMouseX]);

    // --- Content Opacity ---
    // Fade in content when arc is formed (morphValue > 0.8)
    const contentOpacity = useTransform(smoothMorph, [0.8, 1], [0, 1]);
    const contentY = useTransform(smoothMorph, [0.8, 1], [20, 0]);

    return (
        <div ref={containerRef} className="relative w-full h-full bg-[#FAFAFA] overflow-hidden">
            {/* Container */}
            <div className="flex h-full w-full flex-col items-center justify-center perspective-1000">

                {/* Intro Text (Fades out) */}
                <div className="absolute z-0 flex flex-col items-center justify-center text-center pointer-events-none top-1/2 -translate-y-1/2">
                    <motion.h1
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={introPhase === "circle" && morphValue < 0.5 ? { opacity: 1 - morphValue * 2, y: 0, filter: "blur(0px)" } : { opacity: 0, filter: "blur(10px)" }}
                        transition={{ duration: 1 }}
                        className="text-2xl font-medium tracking-tight text-gray-800 md:text-4xl"
                    >
                        The future is built on AI.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={introPhase === "circle" && morphValue < 0.5 ? { opacity: 0.5 - morphValue } : { opacity: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="mt-4 text-xs font-bold tracking-[0.2em] text-gray-500"
                    >
                        SCROLL TO EXPLORE
                    </motion.p>
                </div>

                {/* Arc Active Content (Fades in) */}
                <motion.div
                    style={{ opacity: contentOpacity, y: contentY }}
                    className="absolute top-[10%] z-10 flex flex-col items-center justify-center text-center pointer-events-none px-4"
                >
                    <h2 className="text-3xl md:text-5xl font-semibold text-gray-900 tracking-tight mb-4">
                        Explore Our Vision
                    </h2>
                    <p className="text-sm md:text-base text-gray-600 max-w-lg leading-relaxed">
                        Discover a world where technology meets creativity. <br className="hidden md:block" />
                        Scroll through our curated collection of innovations designed to shape the future.
                    </p>
                </motion.div>

                {/* Main Container */}
                <div className="relative flex items-center justify-center w-full h-full">
                    {IMAGES.slice(0, TOTAL_IMAGES).map((src, i) => {
                        let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

                        // 1. Intro Phases (Scatter -> Line)
                        if (introPhase === "scatter") {
                            target = scatterPositions[i];
                        } else if (introPhase === "line") {
                            const lineSpacing = 70; // Adjusted for smaller images (60px width + 10px gap)
                            const lineTotalWidth = TOTAL_IMAGES * lineSpacing;
                            const lineX = i * lineSpacing - lineTotalWidth / 2;
                            target = { x: lineX, y: 0, rotation: 0, scale: 1, opacity: 1 };
                        } else {
                            // 2. Circle Phase & Morph Logic

                            // Responsive Calculations
                            const isMobile = containerSize.width < 768;
                            const minDimension = Math.min(containerSize.width, containerSize.height);

                            // A. Calculate Circle Position
                            const circleRadius = Math.min(minDimension * 0.35, 350);

                            const circleAngle = (i / TOTAL_IMAGES) * 360;
                            const circleRad = (circleAngle * Math.PI) / 180;
                            const circlePos = {
                                x: Math.cos(circleRad) * circleRadius,
                                y: Math.sin(circleRad) * circleRadius,
                                rotation: circleAngle + 90,
                            };

                            // B. Calculate Bottom Arc Position
                            // "Rainbow" Arch: Convex up. Center is highest point.

                            // Radius:
                            const baseRadius = Math.min(containerSize.width, containerSize.height * 1.5);
                            const arcRadius = baseRadius * (isMobile ? 1.4 : 1.1);

                            // Position:
                            const arcApexY = containerSize.height * (isMobile ? 0.35 : 0.25);
                            const arcCenterY = arcApexY + arcRadius;

                            // Spread angle:
                            const spreadAngle = isMobile ? 100 : 130;
                            const startAngle = -90 - (spreadAngle / 2);
                            const step = spreadAngle / (TOTAL_IMAGES - 1);

                            // Apply Scroll Rotation (Shuffle) with Bounds
                            // We want to clamp rotation so images don't disappear.
                            // Map scroll range [600, 3000] to a limited rotation range.
                            // Range: [-spreadAngle/2, spreadAngle/2] keeps them roughly in view.
                            // We map 0 -> 1 (progress of scroll loop) to this range.

                            // Note: rotateValue comes from smoothScrollRotate which maps [600, 3000] -> [0, 360]
                            // We need to adjust that mapping in the hook above, OR adjust it here.
                            // Better to adjust it here relative to the spread.

                            // Let's interpret rotateValue (0 to 360) as a progress 0 to 1
                            const scrollProgress = Math.min(Math.max(rotateValue / 360, 0), 1);

                            // Calculate bounded rotation:
                            // Move from 0 (centered) to -spreadAngle (all the way left) or similar.
                            // Let's allow scrolling through the list.
                            // Total sweep needed to see all items if we start at one end?
                            // If we start centered, we can go +/- spreadAngle/2.

                            // User wants to "stop on the last image".
                            // Let's map scroll to: 0 -> -spreadAngle (shifts items left)
                            const maxRotation = spreadAngle * 0.8; // Don't go all the way, keep last item visible
                            const boundedRotation = -scrollProgress * maxRotation;

                            const currentArcAngle = startAngle + (i * step) + boundedRotation;
                            const arcRad = (currentArcAngle * Math.PI) / 180;

                            const arcPos = {
                                x: Math.cos(arcRad) * arcRadius + parallaxValue,
                                y: Math.sin(arcRad) * arcRadius + arcCenterY,
                                rotation: currentArcAngle + 90,
                                scale: isMobile ? 1.4 : 1.8, // Increased scale for active state
                            };

                            // C. Interpolate (Morph)
                            target = {
                                x: lerp(circlePos.x, arcPos.x, morphValue),
                                y: lerp(circlePos.y, arcPos.y, morphValue),
                                rotation: lerp(circlePos.rotation, arcPos.rotation, morphValue),
                                scale: lerp(1, arcPos.scale, morphValue),
                                opacity: 1,
                            };
                        }

                        return (
                            <FlipCard
                                key={i}
                                src={src}
                                index={i}
                                total={TOTAL_IMAGES}
                                phase={introPhase} // Pass intro phase for initial animations
                                target={target}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}


demo.tsx
"use client";

import IntroAnimation from "../components/ui/scroll-morph-hero";

export default function Demo() {
    return (
        <div className="w-full h-[800px] border rounded-lg overflow-hidden relative">
            <IntroAnimation />
        </div>
    );
}

```

Install NPM dependencies:
```bash
framer-motion
```

Extend existing Tailwind 4 index.css with this code (or if project uses Tailwind 3, extend tailwind.config.js or globals.css):
```css
@import "tailwindcss";
@import "tw-animate-css";

@theme inline {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

:root {
  --background: #0a0a0a;
  --foreground: #ededed;
}

```
You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
image-stream-hero.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ── the corridor ────────────────────────────────────────────────
 * Two rails of cards ride from far behind the screen toward the
 * viewer. Perspective alone does the work that looks like two
 * animations: as a card's z grows it gets bigger *and* its screen x
 * sweeps outward from the vanishing point, because the projection
 * scales position and size by the same factor.
 *
 * Three things shape it, and each one fixes a specific artefact:
 *
 * 1. Depth is authored as *apparent size*, geometrically — each card
 *    is a constant ratio bigger than the one behind it, all the way
 *    out. Spacing a straight z-range evenly instead makes the near
 *    cards tear apart from each other as the projection blows up.
 * 2. The rails open hard in the first stretch and then hold
 *    (`fan` > 1). That opening cancels the — still slow — growth back
 *    there, so the ribbon leaves the centre as a flat band, bends
 *    once, and only then runs out on the diagonal. Parallel rails
 *    project to a straight cone with no bend at all.
 * 3. Neither end of the loop is ever on screen. A card dies with its
 *    inner edge past 50cqw, clear of the container's edge. And it is
 *    born *across* the axis — `railBirth` is negative, so the newest
 *    card starts on the far side and sweeps back through the centre.
 *    That plugs the throat: the axis stays covered at every instant,
 *    and a newborn lands behind cards that already cover it, so it
 *    needs no fade in. Birthing on its own side instead leaves a hole
 *    at dead centre that blinks open once every cycle.
 *
 * Every length is in `cqw` — a percentage of the container's width —
 * so the whole corridor keeps its proportions at any size. The
 * defaults were fitted numerically against a reference recording's
 * card-height and edge-position profile, not eyeballed.
 * ─────────────────────────────────────────────────────────────── */

/**
 * Geometry of the corridor. Every length is `cqw`, a percentage of the
 * container's width, so the shape is resolution-independent.
 *
 * These interact: the ribbon only stays solid while consecutive cards
 * overlap, which needs `exitHeight / birthHeight` spread over enough
 * `cards`. Raising `exitHeight`, dropping `cards`, or pulling `railExit`
 * in all push toward a visible tear near the frame edge.
 */
export type CorridorPath = {
  /** Strength of the projection. Lower is a wider-angle, more dramatic rush. @default 30 */
  perspective?: number;
  /** Card width in world units. @default 18 */
  cardWidth?: number;
  /** Card height in world units. @default 25 */
  cardHeight?: number;
  /** Corner radius applied to each card. @default 0.4 */
  cardRadius?: number;
  /** On-screen card height at the waist, where a card is born. @default 2.6 */
  birthHeight?: number;
  /** On-screen card height as a card leaves the frame. @default 46 */
  exitHeight?: number;
  /**
   * Lateral offset at birth. Negative starts the card across the axis so the
   * centre never opens up — see note 3 above. @default -11
   */
  railBirth?: number;
  /** Lateral offset once the rails have finished opening. @default 44 */
  railExit?: number;
  /** How front-loaded the opening is. >1 opens early then holds. @default 3.3 */
  fan?: number;
  /** Y-rotation at birth, degrees. @default 6 */
  turnBirth?: number;
  /** Y-rotation at exit, degrees. @default 28 */
  turnExit?: number;
  /** Keyframe stops used to trace the curve. Raise only if motion looks faceted. @default 24 */
  stops?: number;
};

const PATH: Required<CorridorPath> = {
  perspective: 30,
  cardWidth: 18,
  cardHeight: 25,
  cardRadius: 0.4,
  birthHeight: 2.6,
  exitHeight: 46,
  railBirth: -11,
  railExit: 44,
  fan: 3.3,
  turnBirth: 6,
  turnExit: 28,
  stops: 24,
};

/** Sample the path once so the CSS keyframes trace the real curve. */
function keyframes(dir: 1 | -1, name: string, p: Required<CorridorPath>) {
  const steps: string[] = [];
  for (let s = 0; s <= p.stops; s++) {
    const u = s / p.stops;
    // Geometric in apparent size, so consecutive cards keep a constant size
    // ratio and the ribbon stays solid at both ends.
    const scale =
      (p.birthHeight / p.cardHeight) *
      Math.pow(p.exitHeight / p.birthHeight, u);
    const z = p.perspective * (1 - 1 / scale);
    const rail =
      p.railExit - (p.railExit - p.railBirth) * Math.pow(1 - u, p.fan);
    const turn = p.turnBirth + (p.turnExit - p.turnBirth) * u;
    steps.push(
      `${(u * 100).toFixed(2)}%{transform:translate3d(${(dir * rail).toFixed(
        2,
      )}cqw,0,${z.toFixed(2)}cqw) rotateY(${(-dir * turn).toFixed(2)}deg)}`,
    );
  }
  return `@keyframes ${name}{${steps.join("")}}`;
}

export type StreamImage = {
  src: string;
  /** Only used if you drop the decorative treatment; the corridor is aria-hidden. */
  alt?: string;
};

export type ImageStreamHeroProps = {
  /**
   * Images cycled onto the rails. Both rails run the same sequence, so the
   * corridor reads as one mirrored stream. Fewer than `cards` simply repeat.
   */
  images: StreamImage[];
  /**
   * Cards on each rail at once. More cards means a denser corridor, not a
   * faster one — spacing is derived from this and `speed`. Drop it far below
   * the default and consecutive cards grow too fast to stay overlapped near
   * the exit, which tears a gap in the ribbon.
   * @default 9
   */
  cards?: number;
  /**
   * Seconds for one card to travel the whole corridor.
   * @default 18
   */
  speed?: number;
  /**
   * Vertical placement of the corridor's axis, as a percentage of height.
   * @default 55
   */
  axis?: number;
  /** Override any part of the corridor geometry. Merged over the defaults. */
  path?: CorridorPath;
  /** Content rendered above the corridor. */
  children?: React.ReactNode;
  className?: string;
};

export function ImageStreamHero({
  images,
  cards = 9,
  speed = 18,
  axis = 55,
  path,
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & ImageStreamHeroProps) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const right = `ish-r-${id}`;
  const left = `ish-l-${id}`;
  const card = `ish-c-${id}`;

  const p = React.useMemo(() => ({ ...PATH, ...path }), [path]);

  const css = React.useMemo(
    () =>
      `${keyframes(1, right, p)}${keyframes(-1, left, p)}` +
      // Pausing rather than disabling keeps the corridor whole: every card is
      // already dropped mid-flight by its negative delay, so it freezes as a
      // finished still instead of collapsing onto the axis.
      `@media(prefers-reduced-motion:reduce){.${card}{animation-play-state:paused}}`,
    [right, left, card, p],
  );

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      {...props}
      style={{ containerType: "inline-size", ...props.style }}
    >
      <style>{css}</style>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          perspective: `${p.perspective}cqw`,
          perspectiveOrigin: `50% ${axis}%`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          {[right, left].map((name) =>
            Array.from({ length: cards }, (_, i) => {
              // Both rails walk the same sequence, so the left side mirrors
              // the right at every depth.
              const img = images[i % Math.max(images.length, 1)];
              return (
                <div
                  key={`${name}-${i}`}
                  className={cn(card, "absolute overflow-hidden")}
                  style={{
                    left: "50%",
                    top: `${axis}%`,
                    width: `${p.cardWidth}cqw`,
                    height: `${p.cardHeight}cqw`,
                    marginLeft: `${-p.cardWidth / 2}cqw`,
                    marginTop: `${-p.cardHeight / 2}cqw`,
                    borderRadius: `${p.cardRadius}cqw`,
                    animation: `${name} ${speed}s linear infinite`,
                    // Negative delay drops each card mid-flight, so the
                    // corridor is already full on the first frame.
                    animationDelay: `${-(i * speed) / cards}s`,
                    backfaceVisibility: "hidden",
                  }}
                >
                  {img ? (
                    <img
                      src={img.src}
                      alt={img.alt ?? ""}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : null}
                </div>
              );
            }),
          )}
        </div>
      </div>

      {children}
    </div>
  );
}

export default ImageStreamHero;


demo.tsx
// This is a file with a demo for your component
// That's what users will see in the preview
// Create new files in this directory to add more demos

import { ImageStreamHero } from "@/components/ui/image-stream-hero";

const CDN = "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev";
 
const IMAGES = [
  {
    src: `${CDN}/stock-images/767d99bb371a54d0d36751e8cecae43c.jpg`,
    alt: "Diver silhouetted inside a sunset seascape shaped like a profile",
  },
  {
    src: `${CDN}/gradients/hero_gradient/hero-gradients-01.png`,
    alt: "Soft multi-tone gradient wash",
  },
  {
    src: `${CDN}/stock-images/821d815affa6496c39cbdeeec7a84603.jpg`,
    alt: "Double-exposure portrait blended with a city skyline at dusk",
  },
  {
    src: `${CDN}/gradients/crimson_aura/crimson-aura-02.png`,
    alt: "Crimson aura gradient",
  },
  {
    src: `${CDN}/stock-images/937438c560ada1c83317f2c11b3454b0.jpg`,
    alt: "Motion-blurred side-profile portrait against a deep orange backdrop",
  },
  {
    src: `${CDN}/gradients/hue-flow/hue-flow-01.png`,
    alt: "Flowing hue gradient",
  },
  {
    src: `${CDN}/stock-images/98f89cb9994f5c382ab964062c4039db.jpg`,
    alt: "Figure holding a racket that dissolves into a swirling colourful cloud",
  },
  {
    src: `${CDN}/gradients/moon/moon-grade-03.png`,
    alt: "Moon-toned gradient",
  },
  {
    src: `${CDN}/stock-images/ddcbee38be8b7274e19e132d7ab35b53.jpg`,
    alt: "Hand gesture with a colourful cutout of a bird flying through the fingers",
  },
  {
    src: `${CDN}/gradients/hero_gradient/hero-gradients-03.png`,
    alt: "Layered hero gradient",
  },
  {
    src: `${CDN}/gradients/hue-flow/hue-flow-02.png`,
    alt: "Second flowing hue gradient",
  },
  {
    src: `${CDN}/gradients/moon/moon-grade-05.png`,
    alt: "Deep moon-toned gradient",
  },
];

// ONLY DEFAULT EXPORT WILL BE TREATED AS A DEMO
export default function DemoOne() {
  return (
    <ImageStreamHero
      images={IMAGES}
      className="h-[560px] w-full rounded-lg border border-border bg-background"
    >
      <div className="relative z-10 flex h-full flex-col items-center justify-between py-12 text-center">
        <div className="px-6">
          <h1 className="text-balance text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
            Your work,
            <br />
            front and centre.
          </h1>
        </div>
        <p className="max-w-md text-balance px-6 text-sm text-muted-foreground">
          A hero that leads with the images instead of describing them. Swap in
          your own and the corridor rebuilds around them.
        </p>
      </div>
    </ImageStreamHero>
  );
}

```

You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
cobe-globe-polaroids.tsx
"use client"

import { useEffect, useRef, useCallback } from "react"
import createGlobe from "cobe"

interface PolaroidMarker {
  id: string
  location: [number, number]
  image: string
  caption: string
  rotate: number
}

interface GlobePolaoridsProps {
  markers?: PolaroidMarker[]
  className?: string
  speed?: number
}

const defaultMarkers: PolaroidMarker[] = [
  { id: "polaroid-sf", location: [37.78, -122.44], image: "https://cdn.21st.dev/assets/mirror/c6/c6d80a573edd25cbf4156d5fa5ac1a92f3464d868610a66e42b6f2504ad20754.jpg", caption: "San Francisco", rotate: -5 },
  { id: "polaroid-nyc", location: [40.71, -74.01], image: "https://cdn.21st.dev/assets/mirror/df/dfb431480f9ad523c4d95d687e3ad9ab26527f92390df4e29f05e1d18d593915.jpg", caption: "New York", rotate: 4 },
  { id: "polaroid-tokyo", location: [35.68, 139.65], image: "https://cdn.21st.dev/assets/mirror/34/34ae66f2d60a75fff0dde6adb9e8bce7b7794c0013feec4db1bce28fb58aaacf.jpg", caption: "Tokyo", rotate: -3 },
  { id: "polaroid-sydney", location: [-33.87, 151.21], image: "https://cdn.21st.dev/assets/mirror/88/88b7dfb3a21786d682f68d5fea837cb3dc85344ade84f54c416b83353fabffce.jpg", caption: "Sydney", rotate: 6 },
  { id: "polaroid-paris", location: [48.86, 2.35], image: "https://cdn.21st.dev/assets/mirror/70/7068d8f556e9c004940e37c9af3712a1bb2e2d659db000344d6b1d422dfaa994.jpg", caption: "Paris", rotate: -4 },
  { id: "polaroid-london", location: [51.51, -0.13], image: "https://cdn.21st.dev/assets/mirror/22/227d573eee27dd0ee533cf260d68c6269d9c232c1def19ce5213de8d32cee45f.jpg", caption: "London", rotate: 3 },
]

export function GlobePolaroids({
  markers = defaultMarkers,
  className = "",
  speed = 0.003,
}: GlobePolaoridsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    isPausedRef.current = true
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        }
      }
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId: number
    let phi = 0

    function init() {
      const width = canvas.offsetWidth
      if (width === 0 || globe) return

      globe = createGlobe(canvas, {
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      width, height: width,
      phi: 0, theta: 0.2, dark: 0, diffuse: 1.5,
      mapSamples: 16000, mapBrightness: 9,
      baseColor: [1, 1, 1],
      markerColor: [0.4, 0.6, 0.9],
      glowColor: [0.94, 0.93, 0.91],
      markerElevation: 0,
      markers: markers.map((m) => ({ location: m.location, size: 0.02, id: m.id })),
      arcs: [], arcColor: [0.5, 0.7, 1],
      arcWidth: 0.5, arcHeight: 0.25, opacity: 0.7,
    })
    function animate() {
      if (!isPausedRef.current) phi += speed
      globe!.update({
        phi: phi + phiOffsetRef.current + dragOffset.current.phi,
        theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
      })
      animationId = requestAnimationFrame(animate)
    }
      animate()
      setTimeout(() => canvas && (canvas.style.opacity = "1"))
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect()
          init()
        }
      })
      ro.observe(canvas)
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (globe) globe.destroy()
    }
  }, [markers, speed])

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%", height: "100%", cursor: "grab", opacity: 0,
          transition: "opacity 1.2s ease", borderRadius: "50%", touchAction: "none",
        }}
      />
      {markers.map((m) => (
        <div
          key={m.id}
          style={{
            position: "absolute",
            // @ts-expect-error CSS Anchor Positioning
            positionAnchor: `--cobe-${m.id}`,
            bottom: "anchor(top)",
            left: "anchor(center)",
            translate: "-50% 0",
            marginBottom: 8,
            background: "#fff",
            padding: "6px 6px 24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.1)",
            transform: `rotate(${m.rotate}deg)`,
            pointerEvents: "none" as const,
            opacity: `var(--cobe-visible-${m.id}, 0)`,
            filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
            transition: "opacity 0.3s, filter 0.3s",
          }}
        >
          <img
            src={m.image}
            alt={m.caption}
            style={{ display: "block", width: 60, height: 60, objectFit: "cover" }}
          />
          <span style={{
            position: "absolute", bottom: 5, left: 0, right: 0,
            textAlign: "center", fontFamily: "system-ui, sans-serif",
            fontSize: "0.5rem", color: "#333", letterSpacing: "0.02em",
          }}>{m.caption}</span>
        </div>
      ))}
    </div>
  )
}


demo.tsx
"use client"

import { GlobePolaroids } from "@/components/ui/component"

export default function GlobePolaoridsDemo() {
  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-white p-8 overflow-hidden">
      <div className="w-full max-w-lg">
        <GlobePolaroids />
      </div>
    </div>
  )
}

```

Install NPM dependencies:
```bash
cobe
```

You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
drag-cards.tsx
import React, { useState, useEffect, useRef } from 'react';

// Card data with titles and image URLs
const travelDestinations = [
  {
    id: 1,
    title: 'Mountain Retreat',
    imageUrl: 'https://cdn.21st.dev/assets/mirror/fa/fa0337b1979f8a8e02e0952709e124857bcef76b8390efda21578c105d08f665.jpg',
  },
  {
    id: 2,
    title: 'Coastal Village',
    imageUrl: 'https://cdn.21st.dev/assets/mirror/08/0827678d3122085dca85615650425134040c7ea00552b0e2f1114f15cd183ec0.jpg',
  },
  {
    id: 3,
    title: 'Desert Adventure',
    imageUrl: 'https://cdn.21st.dev/assets/mirror/6f/6f88263780e9775d097743b5d4398f4273fc2c98bf07e6649cf80c74a79df682.jpg',
  },
  {
    id: 4,
    title: 'Lakeside Serenity',
    imageUrl: 'https://cdn.21st.dev/assets/mirror/bd/bdbd82a0e9a251de7a65af1b56f0a9b50c29acfc79a178755b0fbb6159d6368d.jpg',
  },
  {
    id: 5,
    title: 'Ancient Ruins',
    imageUrl: 'https://cdn.21st.dev/assets/mirror/f2/f2efa7ab06a28110f9fffd5afb88601f1ccf589f68ccc34cfd8aa1b1cb714eb3.jpg',
  },
  {
    id: 6,
    title: 'Canyon Exploration',
    imageUrl: 'https://cdn.21st.dev/assets/mirror/74/74f25c8c9c1251cec5d2e1231de961f83c2149c5d22ea3c4867f8dc53bb18a39.jpg',
  },
];

/**
 * A single draggable card component.
 * It manages its own position and handles drag events for mouse and touch.
 */
const DraggableCard = ({ id, title, imageUrl, initialPosition, rotation, containerRef, zIndex, onBringToFront }) => {
  // State to hold the card's position
  const [position, setPosition] = useState(initialPosition);
  // State to track dragging status
  const [isDragging, setIsDragging] = useState(false);
  // Ref to the card element
  const cardRef = useRef(null);
  // Ref to store the offset between mouse/touch point and card's top-left corner
  const dragOffset = useRef({ x: 0, y: 0 });

  // Common function to start dragging
  const handleDragStart = (clientX, clientY) => {
    if (!cardRef.current) return;
    
    onBringToFront(id);
    setIsDragging(true);

    const cardRect = cardRef.current.getBoundingClientRect();
    // Calculate and store the initial offset
    dragOffset.current = {
      x: clientX - cardRect.left,
      y: clientY - cardRect.top,
    };
    
    // Prevent text selection while dragging
    document.body.style.userSelect = 'none';
  };

  // Mouse down event handler
  const onMouseDown = (e) => {
    handleDragStart(e.clientX, e.clientY);
  };

  // Touch start event handler
  const onTouchStart = (e) => {
    handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
  };

  // Common function to handle the drag movement
  const handleDragMove = (clientX, clientY) => {
    if (!isDragging || !containerRef.current || !cardRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const cardRect = cardRef.current.getBoundingClientRect();

    // Calculate new position relative to the container
    let newX = clientX - containerRect.left - dragOffset.current.x;
    let newY = clientY - containerRect.top - dragOffset.current.y;

    // Constrain the card within the container boundaries
    newX = Math.max(0, Math.min(newX, containerRect.width - cardRect.width));
    newY = Math.max(0, Math.min(newY, containerRect.height - cardRect.height));

    setPosition({ x: newX, y: newY });
  };
  
  // Effect to add and clean up move/end event listeners
  useEffect(() => {
    const onMouseMove = (e) => handleDragMove(e.clientX, e.clientY);
    const onTouchMove = (e) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
    
    const handleDragEnd = () => {
      setIsDragging(false);
      // Re-enable text selection
      document.body.style.userSelect = '';
    };

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, containerRef]);


  return (
    <div
      ref={cardRef}
      className="absolute w-48 md:w-56 bg-white rounded-xl shadow-lg cursor-grab active:cursor-grabbing transition-all duration-300 hover:shadow-xl"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: zIndex,
        touchAction: 'none', // Prevents default touch behaviors like scrolling
        transform: `rotate(${rotation}deg)`, // Apply initial rotation
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      <img
        src={imageUrl}
        alt={title}
        className="w-full aspect-[2/3] object-cover rounded-t-xl pointer-events-none"
        // Fallback placeholder image
        onError={(e) => {
          e.target.onerror = null; 
          e.target.src="https://cdn.21st.dev/assets/mirror/5a/5add8deb1ff096d0c85713d606d816c2687240ea64d1f8c9c94e65d3ba8b1c04.svg";
        }}
      />
      <div className="p-4">
        <h3 className="text-center font-semibold text-gray-800">{title}</h3>
      </div>
    </div>
  );
};

export const CardDrag = () => {
  const containerRef = useRef(null);
  const [initialLayouts, setInitialLayouts] = useState([]);
  // State to manage z-index of cards
  const [cardZIndices, setCardZIndices] = useState({});

  // Initialize card positions and z-indices once the container is available
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const cardWidth = 224; // Corresponds to md:w-56

      // Define static layouts (position and rotation) for each card
      // to match the user's image.
      const layouts = [
        // Left side cards
        { id: 2, x: 80,  y: 100, rotation: -8 },
        { id: 3, x: 180, y: 300, rotation: 5 },
        { id: 6, x: 60,  y: 480, rotation: -3 },
        // Right side cards
        { id: 1, x: containerWidth - cardWidth - 100, y: 120, rotation: 8 },
        { id: 4, x: containerWidth - cardWidth - 200, y: 320, rotation: -6 },
        { id: 5, x: containerWidth - cardWidth - 90,  y: 520, rotation: 4 },
      ];

      // Match layouts to the travelDestinations array
      const sortedLayouts = travelDestinations.map(card => {
        const layout = layouts.find(l => l.id === card.id);
        return {
            position: { x: layout.x, y: layout.y },
            rotation: layout.rotation,
        };
      });

      setInitialLayouts(sortedLayouts);

      // Initialize z-indices, starting from a base value higher than the title
      const zIndices = {};
      travelDestinations.forEach((card, index) => {
        zIndices[card.id] = 20 + index; // Start z-indices from 20
      });
      setCardZIndices(zIndices);
    }
  }, []);

  // Function to bring a card to the front by giving it the highest z-index
  const bringToFront = (cardId) => {
    setCardZIndices(prevZIndices => {
      const maxZ = Math.max(...Object.values(prevZIndices));
      // Only update if the clicked card is not already on top
      if (prevZIndices[cardId] <= maxZ) {
        return {
          ...prevZIndices,
          [cardId]: maxZ + 1,
        };
      }
      return prevZIndices;
    });
  };


  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-white dark:bg-black overflow-hidden"
    >
      {/* Centered Title */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-10 p-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-400 opacity-40">Plan Your Next Adventure</h1>
          <p className="text-lg text-gray-600 mt-2 opacity-50">Discover and plan your perfect getaway.</p>
      </div>

      {/* Draggable Cards */}
      {initialLayouts.length > 0 && travelDestinations.map((card, index) => (
        <DraggableCard
          key={card.id}
          id={card.id}
          title={card.title}
          imageUrl={card.imageUrl}
          initialPosition={initialLayouts[index].position}
          rotation={initialLayouts[index].rotation}
          containerRef={containerRef}
          zIndex={cardZIndices[card.id] || 20}
          onBringToFront={bringToFront}
        />
      ))}
    </div>
  );
};

demo.tsx
import { CardDrag } from "@/components/ui/drag-cards";

export default function DemoOne() {
  return (
    <div className="w-full ">
      <CardDrag/>
    </div>
  );
}

```
You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
scroll-cards.tsx
"use client";
import {FC} from "react";

import Image from "next/image";

// Types
interface iCardItem {
	title: string;
	description: string;
	tag: string;
	src: string;
	link: string;
	color: string;
	textColor: string;
}

interface iCardProps extends Omit<iCardItem, "src" | "link" | "tag"> {
	i: number;
	src: string;
}

// Constants
const TOP_VALUES: Record<number, string> = {
	1: "1/2",
	2: "1/2",
	3: "1/2",
	4: "1/2",
};

// Components
const Card: FC<iCardProps> = ({
	title,
	description,
	color,
	textColor,
	i,
	src,
}) => {
	return (
		<div className="h-screen flex items-center justify-center sticky top-0 md:p-0 px-4">
			<div
				className="relative flex flex-col h-[300px] w-[700px] py-12 px-10 md:px-12
				rotate-0 md:h-[400px] md:w-[600px] items-center justify-center mx-auto 
				shadow-md pr-3 pl-3 pt-3 pb-4"
				style={{backgroundColor: color}}
			>
				<span className="font-bold relative text-5xl md:text-7xl mt-5">
					<span
						className="relative z-10 font-tiemposHeadline font-black tracking-tight"
						style={{color: textColor}}
					>
						{title}
					</span>
				</span>
				<div
					className="font-manrope text-lg md:text-2xl font-medium text-center mb-0 z-50 mt-2 lowercase tracking-wide"
					style={{lineHeight: 1.4, color: textColor}}
				>
					{description}
				</div>
				<div className="absolute inset-0 z-0">
					<Image
						className="w-full h-full object-cover"
						src={src}
						alt="Background"
						layout="fill"
					/>
				</div>
			</div>
		</div>
	);
};

/**
 * CardSlide component displays a series of cards in a vertical scroll layout
 * Each card contains a title, description, and decorative elements
 */
interface iCardSlideProps {
	items: iCardItem[];
}

const CardsParallax: FC<iCardSlideProps> = ({items}) => {
	return (
		<div className="min-h-screen">
			{items.map((project, i) => {
				return <Card key={`p_${i}`} {...project} i={i} />;
			})}
		</div>
	);
};

export {CardsParallax, type iCardItem};


demo.tsx
import {CardsParallax, type iCardItem} from "@/components/ui/scroll-cards";


const cardItems: iCardItem[] = [
	{
		title: "Everest Camp",
		description: "Experience the ultimate trek to the world's highest mountain",
		tag: "trekking",
		src: "https://cdn.21st.dev/assets/mirror/05/05368fb8d22fcb8abc3f9c0843ef1d31c7e30fc0771f1018bda42c7972d08d48.jpg",
		link: "#",
		color: "white",
		textColor: "white",
	},
	{
		title: "Annapurna",
		description: "Journey through the stunning landscapes of Nepal",
		src: "https://cdn.21st.dev/assets/mirror/5c/5caece9d06d43b4ccbbb9664d46ddfcddc56de6fa604cc8f120251416378fc66.jpg",
		tag: "hiking",
		link: "#",
		color: "green",
		textColor: "white",
	},
	{
		title: "Inca Trail",
		description: "Ancient paths leading to Machu Picchu",
		src: "https://cdn.21st.dev/assets/mirror/1c/1ccf77005133704782622927f27869facf75034d3b07c187bc115a2b6617da2f.jpg",
		tag: "adventure",
		link: "#",
		color: "white",
		textColor: "black",
	},
	{
		title: "Swiss Alps",
		description: "Discover the breathtaking beauty of European mountains",
		src: "https://cdn.21st.dev/assets/mirror/9a/9a810b81f107aed0d8f38fa9432a5d2a77f326cf44530d1d0b15d10660f702b4.jpg",
		tag: "mountains",
		link: "#",
		color: "white",
		textColor: "white",
	},
];

const DemoOne = () => {
  return (

			<CardsParallax items={cardItems} />
   
  );
};

export { DemoOne };

```

Install NPM dependencies:
```bash
next
```

You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
zoom-parallax.tsx
'use client';

import { useScroll, useTransform, motion } from 'framer-motion';
import { useRef } from 'react';

interface Image {
	src: string;
	alt?: string;
}

interface ZoomParallaxProps {
	/** Array of images to be displayed in the parallax effect max 7 images */
	images: Image[];
}

export function ZoomParallax({ images }: ZoomParallaxProps) {
	const container = useRef(null);
	const { scrollYProgress } = useScroll({
		target: container,
		offset: ['start start', 'end end'],
	});

	const scale4 = useTransform(scrollYProgress, [0, 1], [1, 4]);
	const scale5 = useTransform(scrollYProgress, [0, 1], [1, 5]);
	const scale6 = useTransform(scrollYProgress, [0, 1], [1, 6]);
	const scale8 = useTransform(scrollYProgress, [0, 1], [1, 8]);
	const scale9 = useTransform(scrollYProgress, [0, 1], [1, 9]);

	const scales = [scale4, scale5, scale6, scale5, scale6, scale8, scale9];

	return (
		<div ref={container} className="relative h-[300vh]">
			<div className="sticky top-0 h-screen overflow-hidden">
				{images.map(({ src, alt }, index) => {
					const scale = scales[index % scales.length];

					return (
						<motion.div
							key={index}
							style={{ scale }}
							className={`absolute top-0 flex h-full w-full items-center justify-center ${index === 1 ? '[&>div]:!-top-[30vh] [&>div]:!left-[5vw] [&>div]:!h-[30vh] [&>div]:!w-[35vw]' : ''} ${index === 2 ? '[&>div]:!-top-[10vh] [&>div]:!-left-[25vw] [&>div]:!h-[45vh] [&>div]:!w-[20vw]' : ''} ${index === 3 ? '[&>div]:!left-[27.5vw] [&>div]:!h-[25vh] [&>div]:!w-[25vw]' : ''} ${index === 4 ? '[&>div]:!top-[27.5vh] [&>div]:!left-[5vw] [&>div]:!h-[25vh] [&>div]:!w-[20vw]' : ''} ${index === 5 ? '[&>div]:!top-[27.5vh] [&>div]:!-left-[22.5vw] [&>div]:!h-[25vh] [&>div]:!w-[30vw]' : ''} ${index === 6 ? '[&>div]:!top-[22.5vh] [&>div]:!left-[25vw] [&>div]:!h-[15vh] [&>div]:!w-[15vw]' : ''} `}
						>
							<div className="relative h-[25vh] w-[25vw]">
								<img
									src={src || '/placeholder.svg'}
									alt={alt || `Parallax image ${index + 1}`}
									className="h-full w-full object-cover"
								/>
							</div>
						</motion.div>
					);
				})}
			</div>
		</div>
	);
}


demo.tsx
'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import Lenis from '@studio-freight/lenis'
import { ZoomParallax } from "@/components/ui/zoom-parallax";

export default function DefaultDemo() {

	React.useEffect( () => {
        const lenis = new Lenis()
       
        function raf(time: number) {
            lenis.raf(time)
            requestAnimationFrame(raf)
        }

        requestAnimationFrame(raf)
    },[])


	const images = [
		{
			src: 'https://cdn.21st.dev/assets/mirror/de/de2a384dfac96d1a31a641ba6667c56747b8138ba0f4e633dbea0e7051311479.jpg',
			alt: 'Modern architecture building',
		},
		{
			src: 'https://cdn.21st.dev/assets/mirror/bb/bbc200e370140ed6d4bc9dfd7b9de0957419ee0facd61f8698ed0e14281b13f5.jpg',
			alt: 'Urban cityscape at sunset',
		},
		{
			src: 'https://cdn.21st.dev/assets/mirror/96/9624bda260e246bd41ab7d26ac6d8e3ad427c62cb1bed10fe22f0aca7bd727c6.jpg',
			alt: 'Abstract geometric pattern',
		},
		{
			src: 'https://cdn.21st.dev/assets/mirror/e0/e09b97c0849e748eb1d19a8d23e341835806a6a384540bfd4f7ce88f97b97b51.jpg',
			alt: 'Mountain landscape',
		},
		{
			src: 'https://cdn.21st.dev/assets/mirror/28/28ab2843d2f3bb3b8439f0c198d9846be80044955263bff6ac49d89691dad55d.jpg',
			alt: 'Minimalist design elements',
		},
		{
			src: 'https://cdn.21st.dev/assets/mirror/96/96e261f67a4f180e273ca711f7b86abe72dd0fdc84dd75d9322b2d79baac46f0.jpg',
			alt: 'Ocean waves and beach',
		},
		{
			src: 'https://cdn.21st.dev/assets/mirror/85/8590b403bb542a124c7de796e9ecf5da86509818f2969e4d94af8c440953a852.jpg',
			alt: 'Forest trees and sunlight',
		},
	];

	return (
		<main className="min-h-screen w-full">
			<div className="relative flex h-[50vh] items-center justify-center">
				{/* Radial spotlight */}
				<div
					aria-hidden="true"
					className={cn(
						'pointer-events-none absolute -top-1/2 left-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 rounded-full',
						'bg-[radial-gradient(ellipse_at_center,--theme(--color-foreground/.1),transparent_50%)]',
						'blur-[30px]',
					)}
				/>
				<h1 className="text-center text-4xl font-bold">
					Scroll Down for Zoom Parallax
				</h1>
			</div>
			<ZoomParallax images={images} />
			<div className="h-[50vh]"/>
		</main>
	);
}

```

Install NPM dependencies:
```bash
framer-motion
```
