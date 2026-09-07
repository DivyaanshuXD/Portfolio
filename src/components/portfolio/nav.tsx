"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_ITEMS, PROFILE } from "./data";

/**
 * Nav — fixed header that smoothly matches the background of whatever
 * section sits behind it. Instead of snapping between discrete themes at
 * a single threshold, we compute the *fractional overlap* of the header
 * strip (top ~80px of viewport) with every section on the page and blend
 * their colors weighted by that overlap. That means:
 *
 *   - When you're 50% of the way through a dark section boundary, the
 *     header bg is exactly 50/50 blended with the previous light section.
 *   - Half-scrolls, 90%-scrolls, partial-scroll cases — all handled
 *     automatically because we sample the actual section rectangles.
 *   - No CSS color transition needed (and no "blocky" feel) because we
 *     update the color on every rAF-throttled scroll event.
 *
 * Mobile fix: at <768px the "HYDERABAD, IN" location string was getting
 * clipped at the right edge. Now uses smaller font on mobile (9px),
 * reduced tracking, whitespace-nowrap + truncate so it never clips.
 */

// Section color spec — must match the actual section bg colors exactly,
// otherwise the blended header won't visually disappear into the page.
// Light sections use the warm paper bg, dark sections use their deep ink.
type SectionSpec = { id: string; bg: [number, number, number]; isDark: boolean };
const SECTION_SPECS: SectionSpec[] = [
  { id: "hero", bg: [232, 223, 200], isDark: false },
  { id: "dna-section", bg: [6, 4, 3], isDark: true },
  { id: "about", bg: [232, 223, 200], isDark: false },
  { id: "transition-globe", bg: [0, 0, 0], isDark: true },
  { id: "work", bg: [20, 16, 12], isDark: true },
  { id: "capabilities", bg: [232, 223, 200], isDark: false },
  { id: "recognition", bg: [232, 223, 200], isDark: false },
  { id: "contact", bg: [10, 9, 7], isDark: true },
];

// Theme endpoints (used for text/accent/border cross-fade)
const LIGHT_THEME_COLORS = {
  text: [10, 9, 7] as [number, number, number],
  accent: [138, 101, 25] as [number, number, number], // #8a6519
  border: [10, 9, 7, 0.10] as [number, number, number, number],
};
const DARK_THEME_COLORS = {
  text: [232, 223, 200] as [number, number, number],
  accent: [184, 134, 42] as [number, number, number], // #b8862a
  border: [232, 223, 200, 0.10] as [number, number, number, number],
};

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function rgb(r: number, g: number, b: number) { return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`; }
function rgba(r: number, g: number, b: number, a: number) { return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`; }

type Theme = { bg: string; text: string; accent: string; border: string; isActive: string };

export default function Nav() {
  const [active, setActive] = useState("hero");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>({
    bg: rgba(LIGHT_THEME_COLORS.text[0], LIGHT_THEME_COLORS.text[1], LIGHT_THEME_COLORS.text[2], 0.85),
    text: rgb(LIGHT_THEME_COLORS.text[0], LIGHT_THEME_COLORS.text[1], LIGHT_THEME_COLORS.text[2]),
    accent: rgb(LIGHT_THEME_COLORS.accent[0], LIGHT_THEME_COLORS.accent[1], LIGHT_THEME_COLORS.accent[2]),
    border: rgba(LIGHT_THEME_COLORS.border[0], LIGHT_THEME_COLORS.border[1], LIGHT_THEME_COLORS.border[2], LIGHT_THEME_COLORS.border[3]),
    isActive: "#8a6519",
  });

  // Cached section positions — refresh on resize and periodically to catch
  // lazy-loaded content (animations changing layout, fonts loading, etc.)
  const sectionCache = useRef<Record<string, { top: number; bottom: number; bg: [number, number, number]; isDark: boolean }>>({});

  const refreshSectionCache = useCallback(() => {
    const next: typeof sectionCache.current = {};
    for (const spec of SECTION_SPECS) {
      const el = document.getElementById(spec.id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      next[spec.id] = {
        top: rect.top + window.scrollY,
        bottom: rect.bottom + window.scrollY,
        bg: spec.bg,
        isDark: spec.isDark,
      };
    }
    sectionCache.current = next;
  }, []);

  useEffect(() => {
    refreshSectionCache();
    // Re-cache on resize (section heights change with viewport)
    window.addEventListener("resize", refreshSectionCache);
    // Re-cache periodically to catch async layout shifts (loader wipe, hero animations)
    const refreshInterval = window.setInterval(refreshSectionCache, 1500);
    // Initial refresh after a short delay so first paint has accurate positions
    const initialRefresh = window.setTimeout(refreshSectionCache, 400);
    return () => {
      window.removeEventListener("resize", refreshSectionCache);
      window.clearInterval(refreshInterval);
      window.clearTimeout(initialRefresh);
    };
  }, [refreshSectionCache]);

  // rAF-throttled scroll handler
  useEffect(() => {
    let rafId: number | null = null;
    let pending = false;

    const compute = () => {
      rafId = null;
      pending = false;
      const scrollY = window.scrollY;
      setScrolled(scrollY > 30);

      const cache = sectionCache.current;
      const headerHeight = 80; // approx header strip we want to blend against
      const stripTop = scrollY;
      const stripBottom = scrollY + headerHeight;

      // Determine active section (the one whose center is closest to the top of the viewport below the header)
      let bestTop = -Infinity;
      const allIds = Object.keys(cache);
      for (const id of allIds) {
        const s = cache[id];
        if (s.top - scrollY < headerHeight * 0.5 && s.top > bestTop) {
          bestTop = s.top;
        }
      }
      // Map "transition-globe"/"dna-section" — not in nav, so keep the previous
      // valid nav section as the active one for the underline indicator.
      const navIds = new Set(NAV_ITEMS.map((n) => n.id));
      let navActive = "hero";
      for (const id of Object.keys(cache)) {
        if (!navIds.has(id)) continue;
        const s = cache[id];
        if (s.top - scrollY < headerHeight * 0.5) navActive = id;
      }
      setActive(navActive);

      // Blend bg + darkRatio across all overlapping sections
      let r = 0, g = 0, b = 0, totalWeight = 0, darkWeight = 0;
      for (const id of allIds) {
        const s = cache[id];
        const overlapTop = Math.max(stripTop, s.top);
        const overlapBottom = Math.min(stripBottom, s.bottom);
        const overlap = Math.max(0, overlapBottom - overlapTop);
        if (overlap > 0) {
          r += s.bg[0] * overlap;
          g += s.bg[1] * overlap;
          b += s.bg[2] * overlap;
          if (s.isDark) darkWeight += overlap;
          totalWeight += overlap;
        }
      }
      if (totalWeight === 0) return;
      const bgR = r / totalWeight;
      const bgG = g / totalWeight;
      const bgB = b / totalWeight;
      const darkRatio = darkWeight / totalWeight;

      // Cross-fade text, accent, border between light and dark theme endpoints
      const textR = lerp(LIGHT_THEME_COLORS.text[0], DARK_THEME_COLORS.text[0], darkRatio);
      const textG = lerp(LIGHT_THEME_COLORS.text[1], DARK_THEME_COLORS.text[1], darkRatio);
      const textB = lerp(LIGHT_THEME_COLORS.text[2], DARK_THEME_COLORS.text[2], darkRatio);
      const accentR = lerp(LIGHT_THEME_COLORS.accent[0], DARK_THEME_COLORS.accent[0], darkRatio);
      const accentG = lerp(LIGHT_THEME_COLORS.accent[1], DARK_THEME_COLORS.accent[1], darkRatio);
      const accentB = lerp(LIGHT_THEME_COLORS.accent[2], DARK_THEME_COLORS.accent[2], darkRatio);
      const borderR = lerp(LIGHT_THEME_COLORS.border[0], DARK_THEME_COLORS.border[0], darkRatio);
      const borderG = lerp(LIGHT_THEME_COLORS.border[1], DARK_THEME_COLORS.border[1], darkRatio);
      const borderB = lerp(LIGHT_THEME_COLORS.border[2], DARK_THEME_COLORS.border[2], darkRatio);

      setTheme({
        bg: rgba(bgR, bgG, bgB, 0.85),
        text: rgb(textR, textG, textB),
        accent: rgb(accentR, accentG, accentB),
        border: rgba(borderR, borderG, borderB, 0.10),
        isActive: rgb(accentR, accentG, accentB),
      });
    };

    const onScroll = () => {
      if (pending) return;
      pending = true;
      rafId = requestAnimationFrame(compute);
    };

    onScroll(); // Initial compute
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
        // NO CSS color transition — the color is recomputed on every rAF scroll tick,
        // so it's already smooth. Adding a transition here would make it lag behind.
        style={{
          backgroundColor: scrolled ? theme.bg : "transparent",
          borderBottom: scrolled ? `1px solid ${theme.border}` : "1px solid transparent",
          backdropFilter: scrolled ? "blur(8px)" : "none",
        }}
      >
        <div className="mx-auto flex items-center justify-between px-5 sm:px-8 lg:px-12 py-4">
          <a href="#hero" data-cursor="hover" className="flex items-center gap-3 group">
            <span className="font-display text-2xl italic leading-none tracking-tight font-medium" style={{ color: theme.text }}>dt<span style={{ color: theme.accent }}>.</span></span>
            <span className="hidden sm:block w-px h-4" style={{ background: `${theme.text}30` }} />
            <span className="hidden sm:block font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: `${theme.text}99` }}>Portfolio / 2026</span>
          </a>
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item => {
              const isActive = active === item.id;
              return (
                <a key={item.id} href={`#${item.id}`} data-cursor="hover" className="group relative px-3 py-2 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors duration-500" style={{ color: isActive ? theme.accent : `${theme.text}99` }}>
                  <span className="opacity-50 mr-1.5">{item.index}</span>{item.label}
                  {isActive && <motion.span layoutId="nav-active" className="absolute -bottom-px left-3 right-3 h-px" style={{ background: theme.accent }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} />}
                </a>
              );
            })}
          </nav>
          {/* Mobile fix: "HYDERABAD, IN" was clipping at 320-375px. Smaller
              font on mobile (9px), reduced tracking (0.15em vs 0.18em),
              whitespace-nowrap + truncate so the string never overflows the
              right edge. */}
          <a href="#contact" data-cursor="hover" className="hidden lg:flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] uppercase transition-colors duration-500 whitespace-nowrap truncate" style={{ color: `${theme.text}99` }}>
            <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping" style={{ background: "#9a1f24" }} /><span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "#9a1f24" }} /></span>
            <span>Available</span>
          </a>
          <button onClick={() => setMenuOpen(v => !v)} data-cursor="hover" aria-label="Toggle menu" className="md:hidden w-10 h-10 grid place-items-center rounded-full border" style={{ borderColor: `${theme.text}30` }}>
            <div className="relative w-4 h-3">
              <motion.span animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 5 : 0 }} className="absolute left-0 right-0 top-0 h-px" style={{ background: theme.text }} />
              <motion.span animate={{ opacity: menuOpen ? 0 : 1 }} className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px" style={{ background: theme.text }} />
              <motion.span animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -5 : 0 }} className="absolute left-0 right-0 bottom-0 h-px" style={{ background: theme.text }} />
            </div>
          </button>
        </div>
      </motion.header>
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-40 md:hidden pt-24 px-6 flex flex-col" style={{ background: theme.bg, color: theme.text }}>
            {NAV_ITEMS.map((item, i) => (
              <motion.a key={item.id} href={`#${item.id}`} onClick={() => setMenuOpen(false)} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.05 }} className="flex items-baseline gap-4 py-5 border-b" style={{ borderColor: `${theme.text}15` }}>
                <span className="font-mono text-[10px] tracking-[0.2em]" style={{ color: theme.accent }}>{item.index}</span>
                <span className="font-display text-4xl">{item.label}</span>
              </motion.a>
            ))}
            <div className="mt-8 font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: `${theme.text}99` }}>{PROFILE.email}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
