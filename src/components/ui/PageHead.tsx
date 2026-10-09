import Link from "next/link";
import type { ReactNode } from "react";

interface PageHeadProps {
  title: string;
  lede?: string;
  back?: { href: string; label: string };
  children?: ReactNode;
}

/** The opening block of every inner page: a short title, one line of context, and an optional way back. */
export function PageHead({ title, lede, back, children }: PageHeadProps) {
  return (
    <header className="wrap page-head">
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
    </header>
  );
}
