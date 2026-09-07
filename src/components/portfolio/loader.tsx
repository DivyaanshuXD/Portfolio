"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PROFILE } from "./data";

/**
 * Page loader — counts 0 → 100 with a quiet, editorial reveal.
 *
 * - Name uses Glitex (PutraCetol Studio, personal use) — strong modern
 *   display sans, intentionally different from the hero's Playfair Display
 *   italic to signal "intro is over, entering the real portfolio".
 * - NO overflow-hidden wrapper around the name. Previously the wrapper
 *   plus whitespace-nowrap was clipping "Tonk" off the right edge on
 *   mobile (390px viewport couldn't fit "Divyaanshu Tonk" at 14vw). Now
 *   we use a plain fade+rise animation that doesn't require any clipping
 *   mask, so the full name is always visible.
 * - Font size tuned with clamp() so it fits comfortably on every viewport
 *   without ever overflowing.
 * - Faster progress fill (~480ms) with a smoother ease-out curve so the
 *   initial fill doesn't feel laggy under heavy main-thread contention
 *   (the GhostEffect Three.js scene is initializing in parallel).
 * - Dispatches `loader-done` so the floating ghost icon knows it can
 *   safely appear after the wipe-up, and so the GhostEffect scene knows
 *   it can mount.
 * - Subtle ornamental accents (corner ticks, divider line) give the
 *   loading screen a finished, intentional feel rather than a blank panel.
 */
export default function Loader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // ─── Skip loader on repeat visits ────────────────────────────
    // Use localStorage (persists across sessions) to detect if the user
    // has already seen the loader. On normal refresh (Ctrl+R), the
    // flag exists so we skip the loader entirely — instant load.
    // On hard refresh (Ctrl+Shift+R), the browser bypasses cache
    // (transferSize > 0) which we detect and clear the flag, so the
    // loader shows again.
    const LOADER_KEY = "portfolio-loader-seen";
    const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const isHardRefresh = navEntry && navEntry.type === "reload" && navEntry.transferSize > 0;

    if (isHardRefresh) {
      // Hard refresh — clear the flag so loader shows
      localStorage.removeItem(LOADER_KEY);
    }

    // Check if we should skip the loader
    const hasSeenLoader = localStorage.getItem(LOADER_KEY);
    if (hasSeenLoader && !isHardRefresh) {
      // Skip loader — set done immediately, dispatch loader-done
      setDone(true);
      (window as unknown as { __loaderDone?: boolean }).__loaderDone = true;
      window.dispatchEvent(new CustomEvent("loader-done"));
      return;
    }

    // ─── Normal loader animation ─────────────────────────────────
    let rafId: number;
    const start = performance.now();
    // Shorter duration so the fill doesn't drag under heavy main-thread work.
    const duration = 480;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // Smoother ease-out cubic — feels faster at the start, gentle at the end
      const eased = 1 - Math.pow(1 - t, 2.2);
      const pct = Math.round(eased * 100);
      setProgress(pct);
      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        // Small dwell at 100% before the wipe-up so the user sees the bar full
        setTimeout(() => {
          setDone(true);
          (window as unknown as { __loaderDone?: boolean }).__loaderDone = true;
          window.dispatchEvent(new CustomEvent("loader-done"));
          // Mark that the user has seen the loader — next visit skips it
          localStorage.setItem(LOADER_KEY, "true");
        }, 260);
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{
            // Warm paper bg with a subtle vignette so the center name pops
            background:
              "radial-gradient(ellipse 80% 70% at 50% 45%, #efe7d1 0%, #e8dfc8 55%, #ddd2b7 100%)",
          }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Corner ticks — editorial frame */}
          <div className="absolute top-6 left-6 w-6 h-6 border-t border-l border-[#0a0907]/25" />
          <div className="absolute top-6 right-6 w-6 h-6 border-t border-r border-[#0a0907]/25" />
          <div className="absolute bottom-6 left-6 w-6 h-6 border-b border-l border-[#0a0907]/25" />
          <div className="absolute bottom-6 right-6 w-6 h-6 border-b border-r border-[#0a0907]/25" />

          <div className="relative flex flex-col items-center gap-10 px-6 w-full max-w-[640px]">
            {/* Eyebrow — location + year */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#3d362d] flex items-center gap-3"
            >
              <span className="w-6 h-px bg-[#0a0907]/25" />
              {PROFILE.location} · 2026
              <span className="w-6 h-px bg-[#0a0907]/25" />
            </motion.div>

            {/* Name — Glitex (PutraCetol Studio, personal use). NO
                overflow-hidden wrapper. The name uses clamp() for the
                font size so it always fits the viewport width with
                breathing room. The reveal is a fade + slight upward
                rise (no clipping needed). */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
              className="text-center leading-[1.0]"
              style={{
                // Prefer Glitex (installed locally via @font-face), fall
                // back to system sans. Glitex has only weight 400.
                fontFamily: "Glitex, var(--font-sans), system-ui, sans-serif",
                fontWeight: 400,
                color: "#0a0907",
                // clamp(min, preferred, max) — fits 360px to 1920px+ comfortably.
                // At 390px mobile: 1.6rem (~26px) — "Divyaanshu Tonk" ~210px wide, fits.
                // At 1440px desktop: ~6rem (96px) — plenty of presence.
                fontSize: "clamp(1.6rem, 7vw, 6rem)",
                letterSpacing: "0.02em",
              }}
            >
              {PROFILE.firstName}
              <span style={{ color: "#a8421e", fontStyle: "normal", fontWeight: 400, marginLeft: "0.18em" }}>
                {PROFILE.lastName}
              </span>
            </motion.h1>

            {/* Tiny role tag */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#5e564a] text-center"
            >
              {PROFILE.role}
            </motion.div>

            {/* Progress block */}
            <div className="w-full mt-2">
              <div className="flex justify-between items-center mb-2.5">
                <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-[#3d362d]">
                  Loading portfolio
                </span>
                <span className="font-mono text-[10px] text-[#0a0907] tabular">
                  {String(progress).padStart(3, "0")}%
                </span>
              </div>
              <div className="relative h-[2px] w-full bg-[#0a0907]/12 overflow-hidden">
                <motion.div
                  className="absolute left-0 top-0 h-full"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #a8421e 0%, #c4512a 60%, #d4a73a 100%)",
                  }}
                />
                {/* Subtle moving highlight at the progress edge */}
                {progress > 0 && progress < 100 && (
                  <div
                    className="absolute top-0 h-full w-12 opacity-50"
                    style={{
                      left: `${progress}%`,
                      transform: "translateX(-100%)",
                      background:
                        "linear-gradient(90deg, transparent, rgba(232,223,200,0.8), transparent)",
                    }}
                  />
                )}
              </div>
              {/* Tick marks under the bar */}
              <div className="flex justify-between mt-1.5 font-mono text-[7px] tracking-[0.15em] uppercase text-[#0a0907]/40">
                <span>00</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
