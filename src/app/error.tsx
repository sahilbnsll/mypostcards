"use client";

import { PageHead } from "@/components/ui/PageHead";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <PageHead title="That one didn’t arrive" lede="Something went wrong while loading the journal. Try again in a moment.">
      <p className="sample-note" role="alert" style={{ marginTop: "var(--s-5)" }}>
        {error.digest ? `Reference: ${error.digest}` : "No further detail is available."}
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          marginTop: "var(--s-3)",
          padding: "var(--s-3) var(--s-5)",
          border: "1px solid var(--ink)",
          borderRadius: "var(--radius-pill)",
          background: "transparent",
          fontFamily: "var(--font-display)",
          fontWeight: 600,
        }}
      >
        Try again
      </button>
    </PageHead>
  );
}
