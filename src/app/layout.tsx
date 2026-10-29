import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Bricolage_Grotesque, Newsreader, Reenie_Beanie } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { siteConfig } from "@/config/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MotionController } from "@/components/ui/MotionController";
import { Cursor } from "@/components/ui/Cursor";
import { JsonLd } from "@/components/ui/JsonLd";
import { TWITTER_HANDLE, siteJsonLd } from "@/lib/seo";
import "@/styles/globals.css";

// Display: a quirky variable grotesk with a width axis, set tight and lowercase for the wordmark.
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--f-display",
  axes: ["wdth"],
  display: "swap",
});

// Text: a serif drawn for reading on screen, with real italics for captions.
const text = Newsreader({
  subsets: ["latin"],
  variable: "--f-text",
  style: ["normal", "italic"],
  display: "swap",
});

// Hand: only the messages on the back of a postcard. Not preloaded; it is never above the fold.
const hand = Reenie_Beanie({
  subsets: ["latin"],
  weight: "400",
  variable: "--f-hand",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name}: a personal photo journal`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: ["photo journal", "travel photography", "digital postcards", "trips", "cafés", "food", "India", "Nepal"],
  authors: [{ name: siteConfig.author.name, url: siteConfig.author.website }],
  creator: siteConfig.author.name,
  publisher: siteConfig.author.name,
  category: "photography",
  formatDetection: { telephone: false, email: false, address: false },
  // Search engines may show full-size image previews: the photographs are the point of the site
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": [{ url: "/feed.xml", title: `${siteConfig.name}: new postcards and stories` }] },
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: siteConfig.url,
    title: "My Postcards: a personal photo journal",
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
    title: "My Postcards: a personal photo journal",
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { color: "#eceeea" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable} ${hand.variable}`} data-theme="light" suppressHydrationWarning>
      <head>
        {/* Applies the saved (or system) theme before first paint, so there is no flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.dataset.theme=localStorage.getItem("theme")==="dark"?"dark":"light"}catch(e){document.documentElement.dataset.theme="light"}`,
          }}
        />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main" className="page">
          {children}
        </main>
        <Footer />
        <JsonLd data={siteJsonLd()} />
        <Suspense fallback={null}>
          <MotionController />
          <Cursor />
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
