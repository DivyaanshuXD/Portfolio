"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/**
 * Breath — plain typographic interlude for the second instance.
 * No DNA, no car, just text with ornamental dividers.
 */
export default function Breath({ text, accent, variant = "light" }: { text: string; accent?: string; variant?: "light" | "dark" }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 1, 1, 0]);

  const bg = variant === "dark" ? "#14100c" : "#e8dfc8";
  const fg = variant === "dark" ? "#e8dfc8" : "#0a0907";
  const ac = accent ?? "#b8862a";

  return (
    <section ref={ref} className="relative overflow-hidden py-32 lg:py-48" style={{ background: bg, color: fg }}>
      <motion.div style={{ y, opacity }} className="relative z-10 mx-auto max-w-[1200px] px-6 text-center flex min-h-[120px] items-center justify-center">
        <div>
          <div className="ornament-divider mb-8 max-w-[120px] mx-auto"><span className="text-lg">✦</span></div>
          <p className="display italic font-light text-3xl sm:text-4xl lg:text-6xl leading-[1.15] tracking-[-0.02em]">
            {text.split(accent ?? "§").map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && accent && <span style={{ color: ac }}>{accent}</span>}
              </span>
            ))}
          </p>
          <div className="ornament-divider mt-8 max-w-[120px] mx-auto"><span className="text-lg">✦</span></div>
        </div>
      </motion.div>
    </section>
  );
}
