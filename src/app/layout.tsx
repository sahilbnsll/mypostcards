import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Bricolage_Grotesque, Newsreader, Reenie_Beanie } from "next/font/google";
import { siteConfig } from "@/config/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MotionController } from "@/components/ui/MotionController";
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
  authors: [{ name: siteConfig.author.name, url: siteConfig.author.website }],
  creator: siteConfig.author.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#eceeea",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable} ${hand.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main" className="page">
          {children}
        </main>
        <Footer />
        <Suspense fallback={null}>
          <MotionController />
        </Suspense>
      </body>
    </html>
  );
}
