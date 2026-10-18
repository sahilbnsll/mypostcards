"use client";

import { useEffect, useId, useRef } from "react";
import type { PointerEvent } from "react";
import { setTheme, useTheme } from "./theme";
import styles from "./PullLamp.module.css";

/** Drawing size; the pull cord's motion and the button's position are in these units. */
const W = 480;
const H = 560;
const CORD_X = 350;
const CORD_TOP = 226;
const CORD_END = 329;
const REDUCED = "(prefers-reduced-motion: reduce)";

interface Engine {
  down(event: PointerEvent<HTMLButtonElement>): void;
  move(event: PointerEvent<HTMLButtonElement>): void;
  up(event: PointerEvent<HTMLButtonElement>, cancelled: boolean): void;
  /** Keyboard and assistive tech: a click with no pointer. */
  press(event: { detail: number }): void;
  /** The theme changed (from here or from the header button): move the light to match. */
  sync(): void;
}

/**
 * A desk lamp with a pull cord that switches the site between light and dark, adapted from the
 * pull-lamp reference and repainted in the postcard palette: an airmail-blue enamel shade with the
 * red-and-blue stripe round its rim, brass fittings, a warm pool of light when it is on. Drag the
 * cord down (or just tap it, or press Enter or Space) and the lamp swaps the theme, the same switch
 * as the header button. The cord's swing is a small spring written straight to the SVG, so it never
 * re-renders anything; with reduced motion the light changes and the cord stays still.
 */
export function PullLamp({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const light = useTheme() === "light";
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const cordRef = useRef<SVGPathElement>(null);
  const beadsRef = useRef<SVGPathElement>(null);
  const knobRef = useRef<SVGGElement>(null);
  const engine = useRef<Engine | null>(null);
  const lightOn = useRef(light);

  useEffect(() => {
    lightOn.current = light;
    engine.current?.sync();
  }, [light]);

  useEffect(() => {
    const root = rootRef.current;
    const button = buttonRef.current;
    if (!root || !button) return;
    const media = window.matchMedia(REDUCED);
    const s = { pull: 0, sway: 0, vel: 0, sideVel: 0, glow: lightOn.current ? 1 : 0, last: 0, frame: 0, moved: 0 };
    let drag: { id: number; x: number; y: number; scale: number } | null = null;

    const pose = () => {
      root.style.setProperty("--light", String(Math.max(0, Math.min(1, s.glow))));
      const x = CORD_X + s.sway;
      const y = CORD_END + s.pull;
      const d = `M${CORD_X} ${CORD_TOP} Q${CORD_X + s.sway * 0.22} ${277 + s.pull * 0.45} ${x} ${y}`;
      cordRef.current?.setAttribute("d", d);
      beadsRef.current?.setAttribute("d", d);
      knobRef.current?.setAttribute("transform", `translate(${s.sway} ${s.pull})`);
      button.style.left = `${(x / W) * 100}%`;
      button.style.top = `${((y + 3) / H) * 100}%`;
    };

    const tick = (now: number) => {
      const dt = s.last ? Math.min((now - s.last) / 1000, 0.025) : 0.016;
      s.last = now;
      if (!drag) {
        s.vel += (-s.pull * 220 - s.vel * 19) * dt;
        s.pull += s.vel * dt;
        s.sideVel += (-s.sway * 100 - s.sideVel * 9) * dt;
        s.sway += s.sideVel * dt;
      }
      const target = lightOn.current ? 1 : 0;
      s.glow += (target - s.glow) * (1 - Math.exp(-dt * 9));
      pose();
      const moving = Math.abs(s.pull) + Math.abs(s.vel) + Math.abs(s.sway) + Math.abs(s.sideVel) + Math.abs(target - s.glow) > 0.015;
      if (moving || drag) {
        s.frame = requestAnimationFrame(tick);
      } else {
        s.frame = 0;
        s.glow = target;
        s.pull = s.sway = 0;
        pose();
      }
    };

    const animate = () => {
      if (media.matches) {
        s.pull = s.sway = s.vel = s.sideVel = 0;
        s.glow = lightOn.current ? 1 : 0;
        pose();
        return;
      }
      if (!s.frame) {
        s.last = 0;
        s.frame = requestAnimationFrame(tick);
      }
    };

    const toggle = () => setTheme(lightOn.current ? "dark" : "light");

    engine.current = {
      down(event) {
        if (event.button !== 0) return;
        const rect = root.getBoundingClientRect();
        drag = { id: event.pointerId, x: event.clientX, y: event.clientY, scale: W / rect.width };
        button.setPointerCapture(event.pointerId);
        s.moved = 0;
      },
      move(event) {
        if (!drag || event.pointerId !== drag.id) return;
        const dx = (event.clientX - drag.x) * drag.scale;
        const dy = (event.clientY - drag.y) * drag.scale;
        s.moved = Math.max(s.moved, Math.hypot(dx, dy));
        if (media.matches) return;
        s.pull = Math.max(0, Math.min(65, dy));
        s.sway = Math.max(-24, Math.min(24, dx));
        pose();
      },
      up(event, cancelled) {
        if (!drag || event.pointerId !== drag.id) return;
        // A real pull, or a plain tap, flips the switch
        const flip = !cancelled && (s.pull > 16 || s.moved < 5);
        drag = null;
        if (button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId);
        if (flip) toggle();
        animate();
      },
      press(event) {
        if (event.detail === 0) toggle();
      },
      sync: animate,
    };
    pose();

    return () => {
      cancelAnimationFrame(s.frame);
      engine.current = null;
    };
  }, []);

  return (
    <div ref={rootRef} className={`${styles.lamp} ${className ?? ""}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.art} aria-hidden>
        <defs>
          <linearGradient id={`metal-${uid}`}>
            <stop stopColor="#4a3826" />
            <stop offset=".25" stopColor="#bf9c62" />
            <stop offset=".45" stopColor="#ffe4a5" />
            <stop offset=".6" stopColor="#a27d47" />
            <stop offset="1" stopColor="#49331f" />
          </linearGradient>
          <linearGradient id={`enamel-${uid}`} x1="0" y1="0" x2="1" y2=".85">
            <stop stopColor="#9db8ee" />
            <stop offset=".15" stopColor="#3a68c0" />
            <stop offset=".43" stopColor="#1f4687" />
            <stop offset=".73" stopColor="#10295c" />
            <stop offset="1" stopColor="#081a3f" />
          </linearGradient>
          <linearGradient id={`base-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#4a6cae" />
            <stop offset=".4" stopColor="#14306b" />
            <stop offset="1" stopColor="#081a3f" />
          </linearGradient>
          <linearGradient id={`beam-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#ffd892" stopOpacity=".24" />
            <stop offset="1" stopColor="#ffd892" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`pool-${uid}`}>
            <stop stopColor="#ffd997" stopOpacity=".6" />
            <stop offset=".55" stopColor="#ffd28a" stopOpacity=".17" />
            <stop offset="1" stopColor="#ffd28a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`under-${uid}`}>
            <stop stopColor="#fffde1" />
            <stop offset=".5" stopColor="#ffe6a2" />
            <stop offset="1" stopColor="#b17839" />
          </radialGradient>
          <radialGradient id={`shadow-${uid}`}>
            <stop stopColor="#000" stopOpacity=".5" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <filter id={`soft-${uid}`}>
            <feGaussianBlur stdDeviation="11" />
          </filter>
          {/* The airmail stripe, as a stroke that follows the shade's rim */}
          <pattern id={`stripe-${uid}`} width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="24" height="24" fill="#f3f4f0" />
            <rect width="6" height="24" fill="#d8362b" />
            <rect x="12" width="6" height="24" fill="#1f4da6" />
          </pattern>
        </defs>

        <ellipse cx="245" cy="496" rx="169" ry="29" fill={`url(#shadow-${uid})`} />
        <g className={styles.lit}>
          <path d="M91 216 10 487 Q240 547 470 487L389 216Z" fill={`url(#beam-${uid})`} />
          <ellipse cx="240" cy="487" rx="225" ry="60" fill={`url(#pool-${uid})`} />
        </g>

        <path d="M320 487 Q410 507 456 492" fill="none" stroke="#050d1e" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="240" cy="477" rx="112" ry="25" fill="#050d1e" />
        <path d="M128 468 Q132 447 240 445 Q346 447 352 468L351 478Q240 518 129 478Z" fill={`url(#base-${uid})`} />
        <ellipse cx="240" cy="467" rx="112" ry="23" fill={`url(#enamel-${uid})`} />
        <path d="M140 465Q240 433 340 465" fill="none" stroke="#d6e2ff" strokeOpacity=".22" strokeWidth="1.5" />
        <ellipse cx="240" cy="464" rx="28" ry="8" fill={`url(#metal-${uid})`} />
        <rect x="230" y="213" width="20" height="249" rx="8" fill={`url(#metal-${uid})`} />
        <path d="M233 225V451" stroke="#ffedc6" strokeOpacity=".35" />
        <rect x="220" y="208" width="40" height="42" rx="12" fill={`url(#metal-${uid})`} />

        <ellipse cx="240" cy="216" rx="153" ry="24" fill="#050d1e" />
        <ellipse className={styles.lit} cx="240" cy="224" rx="141" ry="23" fill="#ffcf77" filter={`url(#soft-${uid})`} />
        <ellipse className={styles.lit} cx="240" cy="220" rx="146" ry="18" fill={`url(#under-${uid})`} />

        <path d="M86 216C92 151 139 110 206 103Q240 99 274 103C341 110 388 151 394 216Q240 244 86 216Z" fill={`url(#enamel-${uid})`} />
        <path d="M102 188C123 140 159 118 208 113" fill="none" stroke="#d6e4ff" strokeOpacity=".32" strokeWidth="3" strokeLinecap="round" />
        <path d="M89 213Q240 243 391 213" fill="none" stroke={`url(#stripe-${uid})`} strokeWidth="9" />
        <path d="M87 215Q240 246 393 215" fill="none" stroke={`url(#metal-${uid})`} strokeWidth="2.5" />
        <ellipse cx="240" cy="102" rx="16" ry="5" fill={`url(#metal-${uid})`} />

        <path ref={cordRef} d={`M${CORD_X} ${CORD_TOP}Q${CORD_X} 274 ${CORD_X} ${CORD_END}`} fill="none" stroke={`url(#metal-${uid})`} strokeWidth="2.5" />
        <path
          ref={beadsRef}
          d={`M${CORD_X} ${CORD_TOP}Q${CORD_X} 274 ${CORD_X} ${CORD_END}`}
          fill="none"
          stroke="#e5ca97"
          strokeWidth="3.3"
          strokeLinecap="round"
          strokeDasharray=".1 5.5"
        />
        <g ref={knobRef}>
          <ellipse cx={CORD_X} cy="332" rx="7" ry="10" fill={`url(#metal-${uid})`} />
          <ellipse cx="348" cy="329" rx="1.5" ry="4" fill="#fff1c8" opacity=".65" />
        </g>
      </svg>

      <button
        ref={buttonRef}
        type="button"
        className={styles.handle}
        aria-label={light ? "Switch to dark theme" : "Switch to light theme"}
        onPointerDown={(event) => engine.current?.down(event)}
        onPointerMove={(event) => engine.current?.move(event)}
        onPointerUp={(event) => engine.current?.up(event, false)}
        onPointerCancel={(event) => engine.current?.up(event, true)}
        onClick={(event) => engine.current?.press(event)}
      />
    </div>
  );
}
