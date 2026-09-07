"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function SpiralAccent() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0.1, 0.18, 0.65, 0.72], [0, 0.35, 0.35, 0]);
  const rotate = useTransform(scrollYProgress, [0.1, 0.72], [0, 270]);
  const x = useTransform(scrollYProgress, [0.1, 0.72], ["5%", "-5%"]);
  return (
    <motion.div style={{ opacity, rotate, x }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[15] pointer-events-none mix-blend-multiply">
      <svg width="500" height="500" viewBox="0 0 500 500" fill="none" style={{ filter: "blur(0.5px)" }}>
        <g stroke="#b8862a" strokeWidth="1.2" fill="none" opacity="0.5">
          <path d="M 250 250 Q 300 200 350 250 Q 400 300 350 350 Q 300 400 250 350 Q 200 300 250 250" />
          <path d="M 250 250 Q 325 175 400 250 Q 475 325 400 400 Q 325 475 250 400 Q 175 325 250 250" opacity="0.7" />
          <path d="M 250 250 Q 350 150 450 250 Q 550 350 450 450 Q 350 550 250 450 Q 150 350 250 250" opacity="0.4" />
        </g>
        <g stroke="#8a6519" strokeWidth="1" fill="none" opacity="0.4">
          <path d="M 250 150 L 300 250 L 250 350 L 200 250 Z" />
          <path d="M 150 250 L 250 200 L 350 250 L 250 300 Z" />
          <circle cx="250" cy="250" r="70" />
          <circle cx="250" cy="250" r="110" opacity="0.5" />
        </g>
        <circle cx="250" cy="250" r="4" fill="#b8862a" opacity="0.7" />
      </svg>
    </motion.div>
  );
}
