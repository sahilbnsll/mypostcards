"use client";

/**
 * The last safety net: if the root layout itself fails, this replaces the whole page (so it has its
 * own html and body and cannot use the site's styles). It keeps the postcard look with plain inline
 * colours and always offers a way to try again.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <head>
        <title>That one didn’t arrive | My Postcards</title>
        <meta name="robots" content="noindex" />
      </head>
      <body style={{ margin: 0, minHeight: "100svh", display: "grid", placeItems: "center", background: "#eceeea", color: "#0f1a2b", fontFamily: "system-ui, sans-serif", padding: "1.5rem" }}>
        <main style={{ maxWidth: "30rem" }}>
          <div aria-hidden style={{ height: 10, marginBottom: 28, background: "repeating-linear-gradient(-45deg,#d8362b 0 11px,#f3f4f0 11px 22px,#1f4da6 22px 33px,#f3f4f0 33px 44px)" }} />
          <h1 style={{ margin: 0, fontSize: "2.25rem", letterSpacing: "-0.03em", lineHeight: 1.1 }}>That one didn’t arrive</h1>
          <p style={{ marginTop: 16, fontSize: "1.125rem", lineHeight: 1.5, color: "#2b3648" }}>Something went wrong while loading my postcards. Try again in a moment, or come back to the front page.</p>
          <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
            <button type="button" onClick={reset} style={{ padding: "0.75rem 1.4rem", border: "1px solid #0f1a2b", borderRadius: 999, background: "#0f1a2b", color: "#eceeea", fontWeight: 600, fontSize: "1rem", cursor: "pointer" }}>
              Try again
            </button>
            {/* A plain link, not next/link: the router may be what failed */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" style={{ padding: "0.75rem 1.4rem", border: "1px solid #0f1a2b", borderRadius: 999, color: "#0f1a2b", fontWeight: 600, textDecoration: "none" }}>
              Back to the front page
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
