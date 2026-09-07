"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

/**
 * EasterEgg — triggers on the Konami code
 * (↑↑↓↓←→←→ B A) or by clicking the "dt." logo 5 times rapidly.
 * Reveals a hidden "dev panel" with credits.
 */
const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export default function EasterEgg() {
  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    let buf: string[] = [];
    let logoClicks = 0;
    let logoTimer: number | undefined;

    const onKey = (e: KeyboardEvent) => {
      buf.push(e.key);
      if (buf.length > KONAMI.length) buf.shift();
      if (buf.join(",").toLowerCase() === KONAMI.join(",").toLowerCase()) {
        setOpen(true);
        setUnlocked(true);
        buf = [];
      }
    };

    // Logo click handler — 5 rapid clicks
    const onLogoClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const logo = target.closest('a[href="#hero"]') as HTMLElement | null;
      if (!logo) return;
      e.preventDefault();
      logoClicks++;
      window.clearTimeout(logoTimer);
      logoTimer = window.setTimeout(() => {
        logoClicks = 0;
      }, 800);
      if (logoClicks >= 5) {
        setOpen(true);
        setUnlocked(true);
        logoClicks = 0;
      }
    };

    window.addEventListener("keydown", onKey);
    document.addEventListener("click", onLogoClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onLogoClick);
      window.clearTimeout(logoTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[200] grid place-items-center bg-[#0a0907]/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.85, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 20, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[480px] bg-[#e8dfc8] border border-[#0a0907]/15 p-8"
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-3 right-3 w-8 h-8 grid place-items-center hover:bg-[#0a0907]/5"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#a8421e] mb-2">
              ✦ Secret unlocked
            </div>
            <h3 className="display text-4xl text-[#0a0907] leading-tight mb-4">
              You found the
              <br />
              <span className="italic text-[#a8421e]">easter egg.</span>
            </h3>
            <p className="body-serif text-[#3d362d] text-sm leading-relaxed mb-5">
              Built with obsessive attention to detail — Three.js shaders, Framer Motion
              choreography, Lenis smooth scroll, and a custom GLSL sculpture. Every pixel
              earned.
            </p>
            <div className="border-t border-[#0a0907]/15 pt-4 space-y-1.5 font-mono text-[10px] tracking-[0.12em] uppercase text-[#3d362d]">
              <div className="flex justify-between">
                <span>Built by</span>
                <span className="text-[#0a0907]">Divyaanshu Tonk</span>
              </div>
              <div className="flex justify-between">
                <span>Stack</span>
                <span className="text-[#0a0907]">Next.js · R3F · Framer</span>
              </div>
              <div className="flex justify-between">
                <span>Edition</span>
                <span className="text-[#0a0907]">Vol. 01 — 2026</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span className="text-[#34503a]">Shipping</span>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-[#0a0907]/15 font-mono text-[9px] tracking-[0.15em] uppercase text-[#5e564a]">
              ↑↑↓↓←→←→ B A
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
