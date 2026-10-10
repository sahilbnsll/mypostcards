import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";
import { BRAND, logoDataUri } from "@/lib/brand";

export const alt = "My Postcards: postcards from Sahil";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = await logoDataUri();
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: BRAND.cream, color: BRAND.ink, alignItems: "center", padding: "0 80px", gap: 56 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={460} height={378} alt="" />
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, letterSpacing: -2, lineHeight: 1, color: BRAND.green }}>mypostcards</div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 21, letterSpacing: 3.5, whiteSpace: "nowrap", color: BRAND.ink }}>{siteConfig.descriptor.toUpperCase()}</div>
          <div style={{ display: "flex", marginTop: 52, fontSize: 28, color: BRAND.clay }}>{siteConfig.subdomain}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
