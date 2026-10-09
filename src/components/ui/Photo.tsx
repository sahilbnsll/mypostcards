import Image from "next/image";
import type { CSSProperties } from "react";
import type { ImageAsset } from "@/content/types";
import { cn } from "@/lib/utils";
import styles from "./Photo.module.css";

interface PhotoProps {
  image: ImageAsset;
  /** Responsive `sizes` hint. Always set it: it decides which file the browser downloads. */
  sizes: string;
  /** Above-the-fold hero imagery only. Everything else lazy-loads. */
  priority?: boolean;
  /** Load immediately without a preload hint (images that appear on interaction). */
  eager?: boolean;
  /** Override the frame's aspect ratio (crops with object-fit). Defaults to the photo's own. */
  ratio?: number | string;
  /** Focal point for crops, as CSS object-position. */
  position?: string;
  className?: string;
  imageClassName?: string;
  /** Decorative duplicates (e.g. the colour layer of a bloom) pass an empty alt. */
  decorative?: boolean;
}

/**
 * A photograph in a frame whose size is known before the file arrives (no layout shift), tinted
 * with the photo's average colour while it loads.
 */
export function Photo({
  image,
  sizes,
  priority = false,
  eager = false,
  ratio,
  position,
  className,
  imageClassName,
  decorative = false,
}: PhotoProps) {
  const aspect = ratio ?? image.width / image.height;
  return (
    <span
      className={cn(styles.frame, className)}
      style={{ "--photo-ratio": aspect, backgroundColor: image.color } as CSSProperties}
    >
      <Image
        src={image.src}
        alt={decorative ? "" : image.alt}
        fill
        sizes={sizes}
        fetchPriority={priority ? "high" : undefined}
        loading={priority || eager ? "eager" : "lazy"}
        draggable={false}
        className={cn(styles.image, imageClassName)}
        style={position ? { objectPosition: position } : undefined}
      />
    </span>
  );
}
