import Link from "next/link";
import { StampMark } from "@/components/brand/StampMark";
import { Photo } from "@/components/ui/Photo";
import type { Postcard } from "@/content/types";
import styles from "./LostPostcard.module.css";

/** Goes round the seal. Spaced out to fill the ring exactly (see textLength). */
const RING_TEXT = "MY POSTCARDS • LOST IN THE POST • TRY ANOTHER ROAD • ";

/**
 * The picture on the 404 page: a postcard that came back "return to sender", a seal that turns
 * slowly on its corner, and cancellation waves running off its edge. The postcard links to its own
 * page, so the way out is also a photograph. Motion is CSS only and stops for reduced motion.
 */
export function LostPostcard({ postcard }: { postcard: Postcard }) {
  return (
    <div className={styles.scene}>
      <div className={styles.seal} aria-hidden>
        <svg className={styles.ring} viewBox="0 0 140 140" focusable="false">
          <defs>
            <path id="lost-ring" d="M 70,70 m -52,0 a 52,52 0 1,1 104,0 a 52,52 0 1,1 -104,0" />
          </defs>
          <circle cx="70" cy="70" r="66" className={styles.disc} />
          <text className={styles.ringText}>
            <textPath href="#lost-ring" textLength="322" lengthAdjust="spacing">
              {RING_TEXT}
            </textPath>
          </text>
        </svg>
        <StampMark className={styles.sealStamp} />
      </div>

      <Link href={`/postcards/${postcard.slug}`} className={styles.print} aria-label={`Open the postcard: ${postcard.title}`}>
        <Photo image={postcard.image} ratio="3 / 2" sizes="(min-width: 30rem) 26rem, 92vw" priority className={styles.photo} />
        <span className={styles.note}>return to sender</span>
      </Link>

      <svg className={styles.waves} viewBox="0 0 112 64" aria-hidden focusable="false">
        <g fill="none" strokeWidth="2.4" strokeLinecap="round">
          <path d="M6 14q10-8 20 0t20 0 20 0 20 0 20 0" />
          <path d="M6 30q10-8 20 0t20 0 20 0 20 0 20 0" />
          <path d="M6 46q10-8 20 0t20 0 20 0 20 0 20 0" />
        </g>
      </svg>
    </div>
  );
}
