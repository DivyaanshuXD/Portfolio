"use client";
import { useEffect } from "react";
import Lenis from "lenis";

declare global { interface Window { __lenis?: Lenis; } }

/**
 * SmoothScroll — Lenis wrapper with the original configuration the user
 * preferred: duration 1.3, exponential ease-out, wheelMultiplier 1,
 * touchMultiplier 1.6, syncTouch. The user explicitly asked NOT to lower
 * the wheelMultiplier (the slowed-down version was reverted), so we keep
 * the original feel.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      syncTouch: true,
    });
    window.__lenis = lenis;
    let rafId: number;
    function raf(time: number) { lenis.raf(time); rafId = requestAnimationFrame(raf); }
    rafId = requestAnimationFrame(raf);
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!target) return;
      const id = target.getAttribute("href")?.slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -60, duration: 1.4 }); }
    };
    const handleScrollToTop = () => { lenis.scrollTo(0, { duration: 1.2 }); };
    document.addEventListener("click", handleAnchorClick);
    window.addEventListener("scroll-to-top", handleScrollToTop);
    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", handleAnchorClick);
      window.removeEventListener("scroll-to-top", handleScrollToTop);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);
  return <>{children}</>;
}
