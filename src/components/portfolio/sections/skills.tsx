"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { SKILL_CATEGORIES } from "../data";

export default function Capabilities() {
  const [active, setActive] = useState(SKILL_CATEGORIES[0].id);
  const activeCat = SKILL_CATEGORIES.find(c => c.id === active)!;
  return (
    <section id="capabilities" className="section-anchor relative bg-[#e8dfc8] py-24 lg:py-32 px-5 sm:px-8 lg:px-12 border-t border-[#0a0907]/10">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex items-baseline justify-between mb-16 lg:mb-20">
          <div className="flex items-center gap-4"><span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#8a6519]">03 — Capabilities</span><span className="w-16 h-px bg-[#0a0907]/20" /></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-5">
            <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="display text-[#0a0907] text-[10vw] md:text-[7vw] lg:text-[5vw] leading-[0.9] tracking-[-0.04em] mb-8">The<br /><span className="italic text-[#8a6519]">arsenal.</span></motion.h2>
            <p className="body-serif text-lg text-[#2a2218] max-w-[380px]">Seven domains. Thirty-five tools. One discipline.</p>
          </div>
          <div className="lg:col-span-7">
            <div className="border-t border-[#0a0907]/15">
              {SKILL_CATEGORIES.map(cat => {
                const isActive = cat.id === active;
                return (
                  <button key={cat.id} onClick={() => setActive(cat.id)} onMouseEnter={() => setActive(cat.id)} data-cursor="hover" className="group w-full flex items-baseline gap-4 sm:gap-6 py-5 border-b border-[#0a0907]/10 text-left transition-colors">
                    <span className={`font-mono text-[10px] tracking-[0.15em] transition-colors ${isActive ? "text-[#8a6519]" : "text-[#6b5d48] group-hover:text-[#8a6519]"}`}>{cat.index}</span>
                    <span className={`display leading-tight flex-1 transition-all duration-300 ${isActive ? "text-[#0a0907] text-2xl sm:text-3xl font-semibold" : "text-[#6b5d48] text-xl sm:text-2xl font-normal group-hover:text-[#0a0907]"}`}>{cat.label}</span>
                    <span className={`font-mono text-xs transition-all duration-300 ${isActive ? "text-[#8a6519] opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}>→</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-12 pt-8 border-t border-[#0a0907]/15">
              <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#8a6519] mb-6">{activeCat.label}</div>
              <motion.p key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="body-serif text-xl sm:text-2xl leading-[1.5] text-[#0a0907]">
                {activeCat.skills.map((skill, i) => (
                  <span key={skill.name}>
                    <span className="inline-block transition-colors" style={{ fontWeight: skill.weight > 0.9 ? 600 : skill.weight > 0.8 ? 500 : 400, opacity: skill.weight > 0.9 ? 1 : skill.weight > 0.85 ? 0.85 : 0.65 }}>{skill.name}</span>
                    {i < activeCat.skills.length - 1 && <span className="text-[#8a6519] mx-1">·</span>}
                  </span>
                ))}
              </motion.p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
