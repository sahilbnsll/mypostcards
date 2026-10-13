import Link from "next/link";
import type { ReactNode } from "react";

interface PageHeadProps {
  title: string;
  lede?: string;
  back?: { href: string; label: string };
  /** Something for a second column beside the text on wide screens (below it on narrow ones). */
  side?: ReactNode;
  children?: ReactNode;
}

/** The opening block of every inner page: a short title, one line of context, and an optional way back. */
export function PageHead({ title, lede, back, side, children }: PageHeadProps) {
  const text = (
    <>
      {back && (
        <Link href={back.href} className="back-link">
          <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden>
            <path d="M13 6H1.5M6 1 1 6l5 5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          {back.label}
        </Link>
      )}
      <h1>{title}</h1>
      {lede && <p className="lede">{lede}</p>}
      {children}
    </>
  );

  return (
    <header className="wrap page-head" data-split={side ? "" : undefined}>
      {side ? (
        <>
          <div className="page-head-main">{text}</div>
          <div className="page-head-side">{side}</div>
        </>
      ) : (
        text
      )}
    </header>
  );
}
