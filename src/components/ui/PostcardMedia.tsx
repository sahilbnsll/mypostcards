"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import type { Postcard } from "@/content/types";
import { Photo } from "./Photo";
import styles from "./PostcardMedia.module.css";

interface PostcardMediaProps {
  card: Pick<Postcard, "image" | "video">;
  /** Responsive `sizes` hint for the photograph (or the clip's poster frame). */
  sizes: string;
  priority?: boolean;
  eager?: boolean;
}

/**
 * The postcard's picture: a photograph, or, when the postcard has a clip, a silent looping video.
 * The clip starts by itself when the postcard is opened (it has no sound, so browsers allow it),
 * except with `prefers-reduced-motion`, and except a clip that keeps its sound, which only plays
 * when the visitor presses play: then it shows its poster frame and waits for the visitor
 * to press play. The controls are always there to pause it.
 */
export function PostcardMedia({ card, sizes, priority, eager }: PostcardMediaProps) {
  const { image, video } = card;
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    // A clip with sound waits to be played by the visitor: it never starts by itself
    if (!el || video?.sound || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.play().catch(() => {
      // The browser refused autoplay: the poster and the play button are still there.
    });
  }, [video?.src, video?.sound]);

  if (!video) return <Photo image={image} sizes={sizes} priority={priority} eager={eager} />;
  return (
    <span className={styles.frame} style={{ "--photo-ratio": image.width / image.height, backgroundColor: image.color } as CSSProperties}>
      <video
        ref={ref}
        className={styles.video}
        src={video.src}
        poster={image.src}
        controls
        muted={!video.sound}
        playsInline
        loop={!video.sound}
        preload="metadata"
        aria-label={`${video.sound ? "Video, with sound" : "Video, no sound"}. ${image.alt}`}
      />
    </span>
  );
}

/** A small "video" mark for thumbnails of postcards that carry a clip. Decorative; the tile's label says "video". */
export function PlayBadge({ className }: { className?: string }) {
  return (
    <span className={`${styles.badge} ${className ?? ""}`} aria-hidden>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
        <path d="M3 1.5v9L10.5 6 3 1.5Z" />
      </svg>
    </span>
  );
}
