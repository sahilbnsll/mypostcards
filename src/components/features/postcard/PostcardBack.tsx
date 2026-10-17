import Link from "next/link";
import type { ReactNode } from "react";
import { Rating } from "@/components/ui/Rating";
import { Postmark, Stamp } from "@/components/ui/Stamp";
import { CATEGORY_BY_ID } from "@/content/categories";
import type { PostcardView } from "@/content/types";
import { cn, formatCoordinates, formatLocation, formatWhen } from "@/lib/utils";
import styles from "./PostcardBack.module.css";

interface PostcardBackProps {
  item: PostcardView;
  /** The viewer uses h2 (the page title is already on the page); the postcard page uses h1. */
  as?: "h1" | "h2";
  /** "page" sets the title larger for the postcard's own page. */
  variant?: "panel" | "page";
}

/**
 * The back of a postcard: title, caption, the handwritten note, the facts laid out like address
 * lines, and a stamp and postmark. Shared by the photo viewer and the postcard's own page.
 */
export function PostcardBack({ item, as: Heading = "h2", variant = "panel" }: PostcardBackProps) {
  return (
    <div className={cn(styles.back, variant === "page" && styles.page)}>
      <div className={styles.marks} aria-hidden>
        <Postmark
          className={styles.postmark}
          top={item.location.city ?? item.location.country ?? "my postcards"}
          // A stand-in photograph says "someday" (the line below the facts still says it is a sample)
          date={item.isSample ? "someday" : (item.takenOn?.slice(0, 4) ?? "kept")}
        />
        <Stamp className={styles.stamp} tone="blue" />
      </div>

      <Heading className={styles.title}>{item.title}</Heading>
      {item.caption && <p className={styles.caption}>{item.caption}</p>}
      {item.note && <p className={styles.note}>{item.note}</p>}

      <dl className={styles.facts}>
        <Fact label="Where" value={formatLocation(item.location)} />
        <Fact label="When" value={formatWhen(item)} />
        <Fact label="Kind" value={CATEGORY_BY_ID[item.category].label} />
        {item.artist && (
          <Fact
            label="Artist"
            value={
              item.artistUrl ? (
                <>
                  {item.artist}{" "}
                  <a href={item.artistUrl} target="_blank" rel="noopener noreferrer" className="text-link">
                    {handleOf(item.artistUrl)} ↗
                  </a>
                </>
              ) : (
                item.artist
              )
            }
          />
        )}
        {item.rating && <Fact label="My rating" value={<Rating value={item.rating} size="sm" />} />}
        {item.tripTitle && item.tripSlug && (
          <Fact label="Trip" value={<Link href={`/trips/${item.tripSlug}`} className="text-link">{item.tripTitle}</Link>} />
        )}
        {item.destinationName && item.destinationSlug && (
          <Fact label="Place" value={<Link href={`/destinations/${item.destinationSlug}`} className="text-link">{item.destinationName}</Link>} />
        )}
        {item.cafeName && item.cafeSlug && (
          <Fact label="Café" value={<Link href={`/cafes/${item.cafeSlug}`} className="text-link">{item.cafeName}</Link>} />
        )}
        {item.storyTitle && item.storySlug && (
          <Fact label="Story" value={<Link href={`/stories/${item.storySlug}`} className="text-link">{item.storyTitle}</Link>} />
        )}
        {item.location.coordinates && !item.location.approximate && (
          <Fact label="Coordinates" value={formatCoordinates(item.location.coordinates.lat, item.location.coordinates.lng)} />
        )}
        {item.camera && (
          <Fact
            label="Camera"
            value={[item.camera.body, item.camera.lens, item.camera.aperture, item.camera.shutterSpeed, item.camera.iso ? `ISO ${item.camera.iso}` : undefined].filter(Boolean).join(", ")}
          />
        )}
      </dl>

      {(item.credit || item.isSample) && (
        <p className={styles.credit}>
          {item.isSample ? "Sample photograph" : "Photo"}
          {item.credit ? ` via ${item.credit}` : ""}
          {item.isSample ? ". Not from my travels." : ""}
        </p>
      )}
    </div>
  );
}

/** "@name" for an Instagram or X link, otherwise the site's host name. */
function handleOf(url: string): string {
  try {
    const { hostname, pathname } = new URL(url);
    const name = pathname.split("/").filter(Boolean)[0];
    return name && /(^|\.)(instagram|x|twitter)\.com$/.test(hostname) ? `@${name}` : hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function Fact({ label, value }: { label: string; value?: ReactNode }) {
  if (!value) return null;
  return (
    <div className={styles.fact}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
