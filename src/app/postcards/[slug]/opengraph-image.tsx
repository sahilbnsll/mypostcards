import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cacheLife } from "next/cache";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { getJournal } from "@/content";
import { EMPTY_SLUG, findBySlug, staticSlugs } from "@/content/selectors";
import { siteConfig } from "@/config/site";
import { formatLocation } from "@/lib/utils";
import { BRAND, stampMarkDataUri } from "@/lib/brand";

export const alt = "A postcard from My Postcards";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  return staticSlugs((await getJournal()).postcards);
}

/** The photo as a small JPEG data URI, from public/ or the web. Null if it cannot be read. */
async function photoDataUri(src: string): Promise<string | null> {
  "use cache";
  // Photographs never change under the same path, so this is prepared once at build time.
  cacheLife("max");
  try {
    const input = /^https?:\/\//.test(src)
      ? Buffer.from(await (await fetch(src)).arrayBuffer())
      : await readFile(join(process.cwd(), "public", src));
    const jpeg = await sharp(input).rotate().resize({ width: 1000, withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = slug === EMPTY_SLUG ? undefined : findBySlug((await getJournal()).postcards, slug);

  const title = card?.title ?? siteConfig.name;
  const where = card ? formatLocation(card.location, ["city", "country"]) : siteConfig.tagline;
  const photo = card ? await photoDataUri(card.image.src) : null;
  const ratio = card ? card.image.width / card.image.height : 1;

  // Fit the photo inside a 640 by 470 frame, whatever its shape.
  const maxW = 640;
  const maxH = 470;
  const width = Math.round(Math.min(maxW, maxH * ratio));
  const height = Math.round(width / ratio);

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#eceeea", color: "#0f1a2b" }}>
        <div style={{ display: "flex", flex: 1, alignItems: "center", padding: "0 72px", gap: 64 }}>
          {photo ? (
            <div
              style={{
                display: "flex",
                padding: 16,
                background: "#fbfbf8",
                boxShadow: "0 24px 48px -16px rgba(15,26,43,0.45)",
                transform: "rotate(-2.5deg)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} width={width} height={height} alt="" style={{ objectFit: "cover" }} />
            </div>
          ) : null}

          <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
            <div style={{ display: "flex", fontSize: photo ? 62 : 84, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2 }}>{title}</div>
            {where ? <div style={{ display: "flex", marginTop: 20, fontSize: 30, color: "#526075" }}>{where}</div> : null}
            <div style={{ display: "flex", alignItems: "center", marginTop: 44, fontSize: 30, fontWeight: 700, color: BRAND.green }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={stampMarkDataUri()} width={30} height={37} alt="" style={{ marginRight: 14 }} />
              mypostcards
            </div>
          </div>
        </div>
        {/* The airmail edge */}
        <div style={{ display: "flex", height: 14 }}>
          {Array.from({ length: 30 }, (_, i) => (
            <div key={i} style={{ display: "flex", flex: 1, background: i % 3 === 0 ? "#d8362b" : i % 3 === 1 ? "#fbfbf8" : "#1f4da6" }} />
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
