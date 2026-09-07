"use client";
import { motion } from "framer-motion";
import { ArrowUpRight, Mail } from "lucide-react";
import dynamic from "next/dynamic";
import { PROFILE, SOCIAL_LINKS } from "../data";
import Magnetic from "../magnetic";

const TubesBackground = dynamic(() => import("../three/tubes-mount"), { ssr: false });

export default function Contact() {
  return (
    <section id="contact" className="section-anchor relative bg-[#0a0907] text-[#e8dfc8] py-24 lg:py-32 px-5 sm:px-8 lg:px-12 overflow-hidden">
      <TubesBackground />
      <div className="relative mx-auto max-w-[1400px] z-10">
        <div className="flex items-baseline justify-between mb-16 lg:mb-20">
          <div className="flex items-center gap-4"><span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#b8862a]">05 — Contact</span><span className="w-16 h-px bg-[#e8dfc8]/25" /></div>
        </div>
        <div className="text-center mb-16">
          <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="display text-[#e8dfc8] text-[14vw] md:text-[10vw] lg:text-[8vw] leading-[0.9] tracking-[-0.04em]">Let's build</motion.h2>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }} className="display italic text-[#b8862a] text-[14vw] md:text-[10vw] lg:text-[8vw] leading-[0.9] tracking-[-0.04em]">something legendary.</motion.div>
        </div>
        {/* Premium circular email CTA */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} className="flex justify-center mb-16">
          <Magnetic strength={0.15}>
            <a href={`mailto:${PROFILE.email}`} data-cursor-text="Email" className="group relative w-48 h-48 sm:w-56 sm:h-56 grid place-items-center">
              <svg className="absolute inset-0 w-full h-full animate-slow-spin" viewBox="0 0 200 200" fill="none"><circle cx="100" cy="100" r="98" stroke="#b8862a" strokeWidth="1" strokeDasharray="2 4" opacity="0.5" /></svg>
              <svg className="absolute inset-3 w-[calc(100%-24px)] h-[calc(100%-24px)]" viewBox="0 0 200 200" fill="none"><circle cx="100" cy="100" r="95" stroke="#b8862a" strokeWidth="1.5" opacity="0.6" /></svg>
              <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[#b8862a] text-xs">✦</span>
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[#b8862a] text-xs">✦</span>
              <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[#b8862a] text-xs">✦</span>
              <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[#b8862a] text-xs">✦</span>
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-[#b8862a] group-hover:bg-[#e8dfc8] transition-colors duration-500 grid place-items-center overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-br from-[#d4a73a] via-[#b8862a] to-[#8a6519] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative text-center"><Mail className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-[#e8dfc8] group-hover:text-[#b8862a] transition-colors duration-500" /><div className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-[#e8dfc8] group-hover:text-[#b8862a] transition-colors duration-500">Send Email</div></div>
              </div>
            </a>
          </Magnetic>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }} className="text-center mb-16">
          <a href={`mailto:${PROFILE.email}`} data-cursor="hover" className="font-display text-lg sm:text-xl italic text-[#c4b698] hover:text-[#e8dfc8] transition-colors link-underline">{PROFILE.email}</a>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-20">
          {SOCIAL_LINKS.map(link => (
            <a key={link.label} href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" data-cursor="hover" className="group p-4 border border-[#e8dfc8]/12 hover:border-[#b8862a]/60 hover:bg-[#b8862a]/5 transition-all">
              <div className="flex items-center justify-between mb-2"><span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#9a8a6e] group-hover:text-[#b8862a] transition-colors">{link.label}</span><ArrowUpRight className="w-3.5 h-3.5 text-[#9a8a6e] group-hover:text-[#e8dfc8] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" /></div>
              <div className="text-[#e8dfc8] text-xs truncate">{link.handle}</div>
            </a>
          ))}
        </motion.div>
        <footer className="border-t border-[#e8dfc8]/12 pt-8 pb-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#9a8a6e]">
            <span>© 2026 {PROFILE.name}</span>
            <span className="flex items-center gap-2"><span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full rounded-full bg-[#b8862a] opacity-60 animate-ping" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#b8862a]" /></span>{PROFILE.status}</span>
            <span className="text-[#9a8a6e]">Built with Next.js · Three.js · Framer Motion</span>
          </div>
        </footer>
      </div>
    </section>
  );
}
