"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import { StampMark } from "@/components/brand/StampMark";
import { SearchPalette } from "@/components/features/search/SearchPalette";
import { ThemeToggle } from "./ThemeToggle";
import { NavIcon } from "./NavIcon";
import { cn } from "@/lib/utils";
import styles from "./Header.module.css";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  // The menu is tied to the page it was opened on, so navigating closes it without an effect.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Solid bar once the page has moved: a sentinel at the top avoids a scroll listener.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting), {
      rootMargin: "24px 0px 0px 0px",
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Mobile menu: a modal <dialog> gives focus trapping and Escape for free. Closing is animated by
  // marking it data-closing (CSS slides the panel out), then closing it when that has played.
  const closeTimer = useRef<number | undefined>(undefined);
  const finishClose = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    dialog?.removeAttribute("data-closing");
    setMenuPath(null);
  }, []);
  const closeMenu = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog?.open || dialog.hasAttribute("data-closing")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finishClose();
      return;
    }
    dialog.setAttribute("data-closing", "");
    closeTimer.current = window.setTimeout(finishClose, 220);
  }, [finishClose]);
  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  return (
    <>
      <div ref={sentinelRef} className={styles.sentinel} aria-hidden />
      <header className={cn(styles.header, scrolled && styles.scrolled)}>
        <div className={cn("wrap", styles.inner)}>
          <Link href="/" className={styles.brand} aria-label={`${siteConfig.name}, home`}>
            <StampMark className={styles.stamp} />
            <span className={styles.wordmark}>my postcards</span>
          </Link>

          <nav aria-label="Main" className={styles.desktopNav}>
            <ul role="list" className={styles.navList}>
              {siteConfig.navLinks.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={styles.navLink}
                      aria-current={active ? "page" : undefined}
                    >
                      <NavIcon name={link.icon} className={styles.navIcon} />
                      {link.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className={styles.actions}>
            <SearchPalette />
            <ThemeToggle />
            <button
              type="button"
              className={cn(styles.pill, styles.menuButton)}
              aria-label="Menu"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              onClick={() => {
                // Open in the same tick as the tap so the slide starts on the very next frame.
                window.clearTimeout(closeTimer.current);
                dialogRef.current?.removeAttribute("data-closing");
                if (!dialogRef.current?.open) dialogRef.current?.showModal();
                setMenuPath(pathname);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 8h16M4 16h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className={styles.menuLabel}>Menu</span>
            </button>
          </div>
        </div>
      </header>

      <dialog
        ref={dialogRef}
        id="site-menu"
        className={styles.menu}
        aria-label="Site menu"
        onClose={() => setMenuPath(null)}
        onCancel={(e) => {
          // Escape: slide out first, then close
          e.preventDefault();
          closeMenu();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeMenu();
        }}
      >
        <div className={styles.menuPanel}>
          <div className={styles.menuTop}>
            <span className={styles.wordmark}>my postcards</span>
            <button type="button" className={styles.pill} onClick={closeMenu}>
              Close
            </button>
          </div>
          <nav aria-label="Mobile">
            <ul role="list" className={styles.menuList}>
              {siteConfig.navLinks.map((link, i) => (
                <li key={link.href} style={{ "--i": i } as React.CSSProperties}>
                  <Link
                    href={link.href}
                    className={styles.menuLink}
                    aria-current={isActive(pathname, link.href) ? "page" : undefined}
                    onClick={closeMenu}
                  >
                    <span className={styles.menuTitle}>{link.title}</span>
                    <span className={styles.menuHint}>{link.hint}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className={styles.menuNote}>{siteConfig.tagline}</p>
          <div className="airmail-edge" aria-hidden />
        </div>
      </dialog>
    </>
  );
}
