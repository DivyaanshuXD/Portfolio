"use client";
import { motion, useScroll, useTransform } from "framer-motion";

export default function AmbientBackground() {
  const { scrollYProgress } = useScroll();
  const gradientX = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const gradientY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const hueRotate = useTransform(scrollYProgress, [0, 1], [0, 15]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.1, 1.05]);
  return (
    <motion.div className="fixed inset-0 z-0 pointer-events-none" style={{
      background: `radial-gradient(ellipse 70% 60% at 20% 20%, rgba(184, 134, 42, 0.08), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(154, 31, 36, 0.05), transparent 60%), radial-gradient(ellipse 50% 40% at 50% 50%, rgba(212, 167, 58, 0.04), transparent 70%)`,
      x: gradientX, y: gradientY, scale, filter: useTransform(hueRotate, (h) => `hue-rotate(${h}deg)`),
    }} />
  );
}
