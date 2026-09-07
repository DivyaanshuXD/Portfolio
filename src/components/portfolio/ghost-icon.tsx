"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * GhostIcon — a floating ghost-shaped icon button (sibling to the back-to-top
 * button at the bottom of the page). Clicking it dispatches the
 * `toggle-ghost-panel` window event, which the Spectral Ghost effect listens
 * for to slide the TweakPane panel in/out.
 *
 * Visibility rules (per user request):
 *   - ONLY visible while the user is in the Hero section
 *   - When the user scrolls past the hero (into DNA / About / etc.), the
 *     icon disappears with a "cool ass animation" — a pixelate-style
 *     scramble + fade + scale + slide-out, fully invisible elsewhere
 *   - When the user scrolls back up to the hero, the icon reappears with
 *     the reverse animation (un-pixelate + fade-in + scale + slide-in)
 *   - Hidden during the page loader (waits for `loader-done` event)
 *
 * Implementation:
 *   - IntersectionObserver tracks the hero section. When the hero's visible
 *     ratio drops below ~0.35, the icon exits; when it rises back above
 *     ~0.35, the icon enters.
 *   - The "pixelate" effect is achieved with an SVG filter (feMorphology
 *     dilate + erode). The filter's feMorphology radius is animated via
 *     a ref during the enter/exit transitions (radius 0 = clean, radius
 *     2.2 = pixelated chunks). Combined with scale + opacity + y-slide,
 *     it reads as a cool pixelate-out / pixelate-in.
 *   - The button stays clickable while visible.
 *   - On mobile (< 768px), the icon never appears — the TweakPane panel
 *     is also hidden on mobile, so the icon would be useless.
 */
const PIXELATE_FILTER_ID = "ghost-pixelate-filter";

export default function GhostIcon() {
  const [show, setShow] = useState(false);         // loader-done gate
  const [inHero, setInHero] = useState(true);       // is the user in the hero?
  const [active, setActive] = useState(false);       // is the panel open?
  const [pulse, setPulse] = useState(false);         // gentle bob
  const morphDilateRef = useRef<SVGFEMorphologyElement | null>(null);
  const morphErodeRef = useRef<SVGFEMorphologyElement | null>(null);

  // ─── 1. Wait for loader to be done before showing the icon ────────
  useEffect(() => {
    const w = window as unknown as { __loaderDone?: boolean };
    if (w.__loaderDone) {
      const id = window.setTimeout(() => setShow(true), 200);
      return () => window.clearTimeout(id);
    }
    const onLoaderDone = () => {
      window.setTimeout(() => setShow(true), 200);
    };
    window.addEventListener("loader-done", onLoaderDone);
    return () => window.removeEventListener("loader-done", onLoaderDone);
  }, []);

  // ─── 2. Track whether the user is in the hero section ─────────────
  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Also gate on desktop width — no icon on mobile because the
          // TweakPane panel is also hidden on mobile.
          const isDesktop = window.innerWidth >= 768;
          setInHero(entry.isIntersecting && entry.intersectionRatio > 0.35 && isDesktop);
        }
      },
      { threshold: [0, 0.2, 0.35, 0.5, 0.75, 1] }
    );
    obs.observe(hero);
    // Re-check on resize so the icon disappears if shrinking to mobile
    const onResize = () => {
      const isDesktop = window.innerWidth >= 768;
      if (!isDesktop) setInHero(false);
    };
    window.addEventListener("resize", onResize);
    return () => {
      obs.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // ─── 3. Track panel open state via the toggle echo ────────────────
  useEffect(() => {
    const onToggle = () => setActive((v) => !v);
    window.addEventListener("toggle-ghost-panel", onToggle);
    const pulseInterval = window.setInterval(() => setPulse((v) => !v), 2600);
    return () => {
      window.removeEventListener("toggle-ghost-panel", onToggle);
      window.clearInterval(pulseInterval);
    };
  }, []);

  // ─── 4. Auto-close the panel when leaving the hero (so it doesn't
  // linger on top of other sections) ──────────────────────────────────
  useEffect(() => {
    if (!inHero && active) {
      window.dispatchEvent(new CustomEvent("toggle-ghost-panel"));
    }
  }, [inHero, active]);

  // ─── 5. Animate the pixelate filter radius during enter/exit ──────
  // When the icon enters (becomes visible), pixelate goes from 2.2 → 0
  // (scrambled → clean). When it exits (becomes hidden), pixelate
  // goes from 0 → 2.2 (clean → scrambled). We drive the SVG filter
  // primitive's `radius` attribute via ref directly so it actually
  // changes the rendered shape, not just the opacity.
  useEffect(() => {
    const visible = show && inHero;
    const target = visible ? 0 : 2.2;
    const start = visible ? 2.2 : 0;
    const duration = 550; // ms — match the framer-motion transition
    const startTime = performance.now();
    let rafId = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const v = start + (target - start) * eased;
      if (morphDilateRef.current) {
        morphDilateRef.current.setAttribute("radius", v.toFixed(2));
      }
      if (morphErodeRef.current) {
        morphErodeRef.current.setAttribute("radius", v.toFixed(2));
      }
      if (t < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, inHero]);

  const onClick = () => {
    window.dispatchEvent(new CustomEvent("toggle-ghost-panel"));
  };

  const visible = show && inHero;

  return (
    <>
      {/* ─── Hidden SVG holding the pixelate filter definition ──────
          The filter is referenced by the inner ghost SVG via
          filter: url(#ghost-pixelate-filter). The feMorphology radii
          are mutated live via refs during the enter/exit transitions. */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <defs>
          <filter id={PIXELATE_FILTER_ID} x="-30%" y="-30%" width="160%" height="160%">
            {/* Dilate then erode creates chunky pixel blocks. The radius
                is animated via the refs above (0 = clean, 2.2 = chunky). */}
            <feMorphology
              ref={morphDilateRef}
              operator="dilate"
              radius="2.2"
              result="dilated"
            />
            <feMorphology
              ref={morphErodeRef}
              operator="erode"
              radius="2.2"
              in="dilated"
              result="pixelated"
            />
            {/* Add a slight glow during pixelation so the chunks read
                as "ghostly energy" dissolving/reforming. */}
            <feGaussianBlur in="pixelated" stdDeviation="0.3" result="blurred" />
            <feColorMatrix
              in="blurred"
              type="matrix"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 1 0"
            />
          </filter>
        </defs>
      </svg>

      <AnimatePresence mode="wait">
        {visible ? (
          <motion.button
            key="ghost-icon-visible"
            // ENTER animation: fade-in + scale-up + slide-in from below
            initial={{ opacity: 0, scale: 0.4, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.4, y: 24 }}
            transition={{
              duration: 0.55,
              ease: [0.16, 1, 0.3, 1],
            }}
            onClick={onClick}
            data-cursor="hover"
            aria-label="Toggle Spectral Ghost settings"
            title="Spectral Ghost"
            className="fixed bottom-[5.5rem] right-5 z-[60] w-12 h-12 grid place-items-center rounded-full transition-colors"
            style={{
              background: active ? "rgba(184, 134, 42, 0.95)" : "rgba(10, 9, 7, 0.85)",
              color: active ? "#0a0907" : "#e8dfc8",
              backdropFilter: "blur(8px)",
              border: active ? "1px solid rgba(184, 134, 42, 0.9)" : "1px solid rgba(184, 134, 42, 0.25)",
              mixBlendMode: "difference",
            }}
          >
            {/* Detailed flowing-sheet ghost — classic Casper silhouette.
                The SVG applies the pixelate filter. The filter's
                feMorphology radius is animated via the refs above, so
                during enter/exit the ghost silhouette breaks into
                chunky pixel blocks (dissolve/reform effect). */}
            <motion.svg
              animate={{ y: pulse ? [0, -1.8, 0] : [0, 0.6, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
              style={{ filter: `url(#${PIXELATE_FILTER_ID})` }}
            >
              {/* Ghost body — rounded top, wavy bottom (4 scallops) */}
              <path
                d="M12 2.2c-4.4 0-8 3.5-8 7.9v9.2c0 1.1 1.1 1.8 2.1 1.2c0.6-0.4 1.1-0.9 1.6-0.9c0.5 0 1 0.5 1.6 0.9c0.6 0.4 1.2 0.4 1.8 0c0.6-0.4 1.1-0.9 1.6-0.9c0.5 0 1 0.5 1.6 0.9c0.6 0.4 1.2 0.4 1.8 0c0.6-0.4 1.1-0.9 1.6-0.9c0.5 0 1 0.5 1.6 0.9c1 0.6 2.1-0.1 2.1-1.2v-9.2C20 5.7 16.4 2.2 12 2.2z"
                fill="currentColor"
              />
              {/* Two hollow eye sockets */}
              <circle cx="9" cy="9.5" r="1.4" fill="#0a0907" />
              <circle cx="15" cy="9.5" r="1.4" fill="#0a0907" />
              {/* Subtle mouth */}
              <ellipse cx="12" cy="13.5" rx="1.1" ry="1.6" fill="#0a0907" opacity="0.85" />
            </motion.svg>

            {/* Active dot — visible when the panel is open */}
            {active && (
              <span
                className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                style={{ background: "#e8dfc8", boxShadow: "0 0 8px rgba(232, 223, 200, 0.8)" }}
              />
            )}
          </motion.button>
        ) : null}
      </AnimatePresence>
    </>
  );
}
