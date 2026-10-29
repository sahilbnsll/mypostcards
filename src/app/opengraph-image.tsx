import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";
import { getJournal } from "@/content";
import { featuredFirst } from "@/content/selectors";
import { BRAND, stampMarkDataUri } from "@/lib/brand";
import { OG_SIZE, photoDataUri } from "@/lib/og";

export const alt = "My Postcards: postcards from Sahil";
export const size = OG_SIZE;
export const contentType = "image/png";

/** Where each of the three prints lies on the table, in pixels from the right-hand panel's corner. */
const PRINTS = [
  { left: 20, top: 150, w: 270, h: 330, r: -7 },
  { left: 190, top: 30, w: 330, h: 270, r: 4 },
  { left: 250, top: 240, w: 290, h: 290, r: -2 },
];

/**
 * The share card for the home page, the one that is passed around most: the name and the line on the
 * left, and three of the favourite photographs lying on the table like prints on the right, with the
 * airmail edge along the bottom. It changes when the favourites do.
 */
export default async function Image() {
  const { postcards } = await getJournal();
  const picks = featuredFirst(postcards).slice(0, 3);
  const photos = await Promise.all(picks.map((p) => photoDataUri(p.image.src)));

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: BRAND.paper, color: BRAND.ink }}>
        <div style={{ display: "flex", flex: 1, alignItems: "center", padding: "0 64px 0 76px" }}>
          <div style={{ display: "flex", flexDirection: "column", width: 520 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={stampMarkDataUri()} width={56} height={70} alt="" />
              <div style={{ display: "flex", marginLeft: 18, fontSize: 24, fontWeight: 700, letterSpacing: 4, color: BRAND.red }}>{siteConfig.descriptor.toUpperCase()}</div>
            </div>
            <div style={{ display: "flex", marginTop: 28, fontSize: 112, fontWeight: 800, letterSpacing: -5, lineHeight: 0.92 }}>my postcards</div>
            <div style={{ display: "flex", marginTop: 30, fontSize: 31, lineHeight: 1.35, color: BRAND.inkSoft }}>{siteConfig.tagline}</div>
            <div style={{ display: "flex", marginTop: 34, fontSize: 26, fontWeight: 700, color: BRAND.red }}>{siteConfig.subdomain}</div>
          </div>
          <div style={{ display: "flex", position: "relative", flex: 1, height: 540, marginLeft: 20 }}>
            {PRINTS.map((p, i) =>
              photos[i] ? (
                <div
                  key={i}
                  style={{ display: "flex", position: "absolute", left: p.left, top: p.top, padding: 12, background: BRAND.card, boxShadow: "0 22px 40px -14px rgba(15,26,43,0.5)", transform: `rotate(${p.r}deg)` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photos[i] as string} width={p.w} height={p.h} alt="" style={{ objectFit: "cover" }} />
                </div>
              ) : null,
            )}
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
