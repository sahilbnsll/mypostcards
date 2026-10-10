export type NavIconName = "gallery" | "trips" | "places" | "cafes" | "stories" | "visitors" | "about";

/** One thin-line drawing per page, on a 24 grid with a shared stroke so they read as a set. */
const DRAWINGS: Record<NavIconName, React.ReactNode> = {
  gallery: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="m21 16.5-5-5-8.5 8" />
    </>
  ),
  trips: (
    <>
      <rect x="3.5" y="7.5" width="17" height="12" rx="2.5" />
      <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3.5 13h17" />
    </>
  ),
  places: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3.2 3 3.2 15 0 18M12 3c-3.2 3-3.2 15 0 18" />
    </>
  ),
  cafes: (
    <>
      <path d="M5 9.5h11V14a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V9.5Z" />
      <path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M8.5 3.5c0 1.3 1 1.4 1 2.7M12.5 3.5c0 1.3 1 1.4 1 2.7" />
    </>
  ),
  stories: (
    <>
      <path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5Z" />
      <path d="M12 6.5v13" />
    </>
  ),
  visitors: (
    <>
      <path d="m4 20 1-4L16.5 4.5a2 2 0 0 1 3 3L8 19l-4 1Z" />
      <path d="m14.5 6.5 3 3" />
    </>
  ),
  about: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
    </>
  ),
};

export function NavIcon({ name, className }: { name: NavIconName; className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
    >
      {DRAWINGS[name]}
    </svg>
  );
}
