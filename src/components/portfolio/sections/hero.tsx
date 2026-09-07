"use client";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useRef, type MouseEvent } from "react";
import dynamic from "next/dynamic";
import { ArrowDown } from "lucide-react";
import { PROFILE } from "../data";

// Mount GhostEffect immediately (not deferred to loader-done) so Three.js
// initializes in the background DURING the loader animation (~480ms).
// The loader sits at z-[100] covering the hero, so the ghost is hidden
// while it initializes. By the time the loader wipes up, the ghost is
// ready and renders instantly — no pause/lag.
const GhostEffect = dynamic(() => import("../three/ghost-mount"), { ssr: false });

function MagneticDot() {
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 15 }), sy = useSpring(y, { stiffness: 300, damping: 15 });
  const onMove = (e: MouseEvent<HTMLSpanElement>) => { const r = e.currentTarget.getBoundingClientRect(); x.set((e.clientX - (r.left + r.width / 2)) * 0.6); y.set((e.clientY - (r.top + r.height / 2)) * 0.6); };
  const onLeave = () => { x.set(0); y.set(0); };
  return <motion.span onMouseMove={onMove} onMouseLeave={onLeave} style={{ x: sx, y: sy, display: "inline-block" }} data-cursor="hover" className="text-[#9a1f24] cursor-pointer" aria-hidden>.</motion.span>;
}

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);

  // Ghost mounts immediately — no waiting for loader-done.
  // The loader (z-[100]) covers the hero while Three.js initializes.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yName = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const yMeta = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const yCta = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const ghostOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7], [0.8, 0.6, 0.2]);

  return (
    <section id="hero" ref={ref} className="section-anchor relative min-h-[100svh] overflow-hidden bg-[#e8dfc8] pt-24">
      {/* GhostEffect mounts immediately — initializes during loader, hidden behind it */}
      <motion.div style={{ opacity: ghostOpacity }} className="absolute inset-0 z-[1]"><GhostEffect /></motion.div>
      <div className="absolute inset-0 pointer-events-none z-[2]" style={{ background: "radial-gradient(ellipse 90% 80% at 50% 50%, rgba(232,223,200,0.4) 0%, rgba(232,223,200,0.25) 40%, rgba(232,223,200,0.1) 70%, transparent 100%)" }} />
      <motion.div style={{ y: yMeta, opacity }} className="relative z-10 mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12 pt-8 lg:pt-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="flex items-center gap-3 mb-12 lg:mb-16 border-b border-[#0a0907]/15 pb-4">
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#4a3d2e]">Portfolio · Vol. 01</span>
          <span className="ml-auto font-mono text-[10px] tracking-[0.18em] uppercase text-[#4a3d2e]"><span className="inline-block w-1.5 h-1.5 rounded-full bg-[#9a1f24] mr-2 align-middle" />{PROFILE.location}</span>
        </motion.div>
        <motion.h1 style={{ y: yName }} className="display text-[#0a0907] leading-[0.82] font-black relative text-center tracking-[-0.05em]">
          {/* pb increased to 0.35em so the 'y' descender in "Divyaanshu"
              never gets clipped by the overflow-hidden reveal mask.
              At a 12rem font-size the descender extends ~0.28em below the
              line box; 0.35em padding gives comfortable headroom. */}
          <span className="block overflow-hidden pb-[0.35em]"><motion.span className="block" style={{ fontSize: "clamp(2.5rem, 14vw, 12rem)", fontWeight: 900 }} initial={{ y: "115%" }} animate={{ y: "0%" }} transition={{ delay: 0.3, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}>{PROFILE.firstName}</motion.span></span>
          <span className="block overflow-hidden pb-[0.15em]"><motion.span className="block" style={{ fontSize: "clamp(2.5rem, 14vw, 12rem)", fontWeight: 900, fontStyle: "italic" }} initial={{ y: "115%" }} animate={{ y: "0%" }} transition={{ delay: 0.5, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}>{PROFILE.lastName}<MagneticDot /></motion.span></span>
        </motion.h1>
        <motion.div style={{ y: yCta }} className="mt-12 lg:mt-16 max-w-[640px] mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#4a3d2e] mb-3">[01] {PROFILE.role}</div>
            <p className="body-serif text-lg lg:text-xl text-[#0a0907] max-w-[480px] mx-auto">{PROFILE.intro}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col sm:flex-row gap-2.5 justify-center mt-8">
            <a href="#work" data-cursor="hover" className="group flex items-center justify-between gap-3 px-5 py-4 bg-[#0a0907] text-[#e8dfc8] hover:bg-[#9a1f24] transition-colors duration-300 flex-1 sm:flex-none"><span className="font-mono text-[11px] tracking-[0.2em] uppercase">Selected Work</span><ArrowDown className="w-4 h-4 -rotate-45 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></a>
            <a href="#contact" data-cursor="hover" className="group flex items-center justify-between gap-3 px-5 py-4 border border-[#0a0907]/30 hover:border-[#0a0907] hover:bg-[#0a0907]/[0.04] transition-all flex-1 sm:flex-none"><span className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#0a0907]">Contact</span><ArrowDown className="w-4 h-4 text-[#0a0907] -rotate-45 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></a>
          </motion.div>
        </motion.div>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 1, ease: [0.16, 1, 0.3, 1] }} className="absolute bottom-0 left-0 right-0 z-10 border-t border-[#0a0907]/15 px-5 sm:px-8 lg:px-12 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] uppercase text-[#4a3d2e]"><span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full rounded-full bg-[#9a1f24] opacity-60 animate-ping" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#9a1f24]" /></span><span className="hidden sm:inline">{PROFILE.status}</span><span className="sm:hidden">Available</span></div>
        <motion.div animate={{ y: [0, 4, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase text-[#4a3d2e]">Scroll<ArrowDown className="w-3 h-3 text-[#8a6519]" /></motion.div>
      </motion.div>
      {/* Gold transition wipe */}
      <motion.div style={{ scaleY: useTransform(scrollYProgress, [0.7, 1], [0, 1]), opacity: useTransform(scrollYProgress, [0.7, 0.9], [0, 1]) }} className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8a6519] to-transparent origin-bottom z-20 pointer-events-none" />
    </section>
  );
}
