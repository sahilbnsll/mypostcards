"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import { Stamp } from "@/components/ui/Stamp";
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
  const navRef = useRef<HTMLUListElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
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

  // One underline that slides to the hovered link and returns to the current page.
  const moveIndicator = useCallback((target: HTMLElement | null) => {
    const nav = navRef.current;
    const indicator = indicatorRef.current;
    if (!nav || !indicator) return;
    if (!target) {
      indicator.style.opacity = "0";
      return;
    }
    const navBox = nav.getBoundingClientRect();
    const box = target.getBoundingClientRect();
    indicator.style.opacity = "1";
    indicator.style.width = `${box.width}px`;
    indicator.style.transform = `translateX(${box.left - navBox.left}px)`;
  }, []);

  const settleIndicator = useCallback(() => {
    const current = navRef.current?.querySelector<HTMLElement>('[aria-current="page"]') ?? null;
    moveIndicator(current);
  }, [moveIndicator]);

  useLayoutEffect(() => {
    settleIndicator();
    // Only animate the underline after its first placement, so it never slides in from the left.
    const frame = requestAnimationFrame(() => {
      if (indicatorRef.current) indicatorRef.current.dataset.ready = "true";
    });
    const nav = navRef.current;
    if (!nav) return;
    const observer = new ResizeObserver(settleIndicator);
    observer.observe(nav);
    document.fonts?.ready.then(settleIndicator);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [pathname, settleIndicator]);

  // Mobile menu: a modal <dialog> gives focus trapping and Escape for free.
  const closeMenu = useCallback(() => setMenuPath(null), []);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (menuOpen && !dialog.open) dialog.showModal();
    if (!menuOpen && dialog.open) dialog.close();
  }, [menuOpen]);

  return (
    <>
      <div ref={sentinelRef} className={styles.sentinel} aria-hidden />
      <header className={cn(styles.header, scrolled && styles.scrolled)}>
        <div className={cn("wrap", styles.inner)}>
          <Link href="/" className={styles.brand} aria-label={`${siteConfig.name}, home`}>
            <Stamp className={styles.stamp} tone="red" />
            <span className={styles.wordmark}>my postcards</span>
          </Link>

          <nav aria-label="Main" className={styles.desktopNav}>
            <ul role="list" className={styles.navList} ref={navRef} onPointerLeave={settleIndicator}>
              {siteConfig.navLinks.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={styles.navLink}
                      aria-current={active ? "page" : undefined}
                      onPointerEnter={(e) => moveIndicator(e.currentTarget)}
                      onFocus={(e) => moveIndicator(e.currentTarget)}
                      onBlur={settleIndicator}
                    >
                      {link.title}
                    </Link>
                  </li>
                );
              })}
              <span ref={indicatorRef} className={styles.indicator} aria-hidden />
            </ul>
          </nav>

          <button
            type="button"
            className={cn(styles.pill, styles.menuButton)}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(pathname)}
          >
            Menu
          </button>
        </div>
      </header>

      <dialog
        ref={dialogRef}
        className={styles.menu}
        aria-label="Site menu"
        onClose={closeMenu}
        onCancel={closeMenu}
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
                    {link.title}
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
