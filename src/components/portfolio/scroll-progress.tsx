"use client";
import { useEffect, useState } from "react";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const [pct, setPct] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      setPct(Math.round(v * 100));
      setShowTop(v > 0.15);
      setShowIndicator(v > 0.04);
    });
  }, [scrollYProgress]);

  return (
    <>
      <motion.div className="fixed bottom-0 left-0 right-0 h-[2px] bg-[#b8862a] z-50 origin-left" style={{ scaleX }} />
      <div className={`fixed bottom-5 left-5 z-50 hidden sm:flex items-center gap-3 transition-opacity duration-500 mix-blend-difference ${showIndicator ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#e8dfc8]">Scroll</span>
        <span className="font-mono text-[11px] text-[#e8dfc8] tabular w-9">{String(pct).padStart(3, "0")}</span>
        <span className="w-8 h-px bg-[#e8dfc8]/40" />
      </div>
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => { try { if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.2 }); else window.scrollTo({ top: 0, behavior: "smooth" }); } catch { window.scrollTo(0, 0); } }}
            data-cursor="hover"
            aria-label="Scroll to top"
            className="fixed bottom-5 right-5 z-[60] w-12 h-12 grid place-items-center rounded-full bg-[#1a1410] text-[#e8dfc8] hover:bg-[#8a6519] transition-colors"
          >
            <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
