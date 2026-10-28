import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Search engines are welcome everywhere except the data routes that only feed the search box
      { userAgent: "*", allow: "/", disallow: ["/api/", "/search-index.json"] },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
