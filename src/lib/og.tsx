import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cacheLife } from "next/cache";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { siteConfig } from "@/config/site";
import { BRAND, stampMarkDataUri } from "@/lib/brand";

/** The size every share card is drawn at: 1200 by 630 is what Facebook, LinkedIn, X and WhatsApp all want. */
export const OG_SIZE = { width: 1200, height: 630 } as const;

/** A photograph as a small JPEG data URI, from public/ or the web. Null when it cannot be read. */
export async function photoDataUri(src: string): Promise<string | null> {
  "use cache";
  // Photographs never change under the same path, so each is prepared once at build time.
  cacheLife("max");
  try {
    const input = /^https?:\/\//.test(src) ? Buffer.from(await (await fetch(src)).arrayBuffer()) : await readFile(join(process.cwd(), "public", src));
    const jpeg = await sharp(input).rotate().resize({ width: 1000, withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch {
    return null;
  }
}

interface OgCardProps {
  /** Small line above the title: "Trip", "Place", "Café", "Story". */
  kind: string;
  title: string;
  /** One line under the title (dates, place, rating). */
  line?: string;
  /** What the card says in full, kept short. */
  blurb?: string;
  photo: string | null;
  /** Width over height of the photograph. */
  ratio: number;
}

/**
 * The share card for a trip, place, café or story: the photograph as a print on the left, the name
 * and a line about it on the right, and the airmail edge along the bottom, like the postcards' own.
 */
export function ogCard({ kind, title, line, blurb, photo, ratio }: OgCardProps) {
  const maxW = 560;
  const maxH = 470;
  const width = Math.round(Math.min(maxW, maxH * ratio));
  const height = Math.round(width / ratio);
  const size = title.length > 34 ? 52 : title.length > 22 ? 62 : 74;

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: BRAND.paper, color: BRAND.ink }}>
        <div style={{ display: "flex", flex: 1, alignItems: "center", padding: "0 72px", gap: 60 }}>
          {photo ? (
            <div style={{ display: "flex", padding: 16, background: BRAND.card, boxShadow: "0 24px 48px -16px rgba(15,26,43,0.45)", transform: "rotate(-2.5deg)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} width={width} height={height} alt="" style={{ objectFit: "cover" }} />
            </div>
          ) : null}
          <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
            <div style={{ display: "flex", fontSize: 26, fontWeight: 700, letterSpacing: 4, color: BRAND.red }}>{kind.toUpperCase()}</div>
            <div style={{ display: "flex", marginTop: 14, fontSize: photo ? size : 84, fontWeight: 800, lineHeight: 1.04, letterSpacing: -2 }}>{title}</div>
            {line ? <div style={{ display: "flex", marginTop: 20, fontSize: 30, color: "#526075" }}>{line}</div> : null}
            {blurb ? <div style={{ display: "flex", marginTop: 16, fontSize: 24, lineHeight: 1.35, color: "#3a465a" }}>{blurb}</div> : null}
            <div style={{ display: "flex", alignItems: "center", marginTop: 36, fontSize: 28, fontWeight: 800 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={stampMarkDataUri()} width={28} height={35} alt="" style={{ marginRight: 14 }} />
              {siteConfig.name.toLowerCase()}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", height: 14 }}>
          {Array.from({ length: 30 }, (_, i) => (
            <div key={i} style={{ display: "flex", flex: 1, background: i % 3 === 0 ? "#d8362b" : i % 3 === 1 ? "#fbfbf8" : "#1f4da6" }} />
          ))}
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
