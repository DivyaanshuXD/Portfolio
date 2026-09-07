"use client";
import { useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Github, Globe, ChevronDown } from "lucide-react";
import { PROJECTS, type Project } from "../data";
import ProjectVisual from "../project-visual";

function CaseCard({ project, index }: { project: Project; index: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-6% 0px" }}
      transition={{ duration: 0.7, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="relative border-b border-[#e8dfc8]/10 last:border-0 group"
    >
      <div className="grid grid-cols-12 gap-4 lg:gap-8 py-10 lg:py-14">
        <div className="col-span-12 lg:col-span-7">
          <div className="flex items-center gap-4 mb-4">
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase" style={{ color: project.accent }}>{project.index}</div>
            <span className="w-8 h-px" style={{ background: `${project.accent}55` }} />
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#9a8a6e]">{project.category} · {project.year}</div>
          </div>
          <button onClick={() => setExpanded(v => !v)} data-cursor="hover" className="text-left w-full" aria-expanded={expanded}>
            <h3 className="display text-[#e8dfc8] text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[0.88] tracking-[-0.04em] transition-colors font-medium inline-block" style={{ color: expanded ? project.accent : undefined }}>{project.name}</h3>
          </button>
          <div className="font-display italic text-xl lg:text-2xl text-[#c4b698] mt-3">{project.tagline}</div>
          <button onClick={() => setExpanded(v => !v)} data-cursor="hover" className="mt-4 font-mono text-[10px] tracking-[0.15em] uppercase text-[#9a8a6e] hover:text-[#c4b698] transition-colors flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: project.accent }} />
            {expanded ? "Hide details" : "View engineering details"}
            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
        <div className="col-span-12 lg:col-span-5">
          <div className="relative aspect-[4/3] border overflow-hidden" style={{ borderColor: `${project.accent}40` }}>
            <ProjectVisual projectId={project.id} accent={project.accent} variant="dark" />
            <div className="absolute top-3 right-3 flex gap-1.5">
              {project.link && <a href={project.link} target="_blank" rel="noreferrer" data-cursor="hover" aria-label={`${project.name} live site`} className="w-9 h-9 grid place-items-center bg-[#14100c]/80 border border-[#e8dfc8]/20 hover:bg-[#b8862a] hover:border-[#b8862a] text-[#e8dfc8] hover:text-[#14100c] backdrop-blur-sm transition-all"><Globe className="w-4 h-4" /></a>}
              {project.repo && <a href={project.repo} target="_blank" rel="noreferrer" data-cursor="hover" aria-label={`${project.name} repository`} className="w-9 h-9 grid place-items-center bg-[#14100c]/80 border border-[#e8dfc8]/20 hover:bg-[#b8862a] hover:border-[#b8862a] text-[#e8dfc8] hover:text-[#14100c] backdrop-blur-sm transition-all"><Github className="w-4 h-4" /></a>}
            </div>
          </div>
          <p className="text-[#c4b698] text-sm leading-relaxed mt-5">{project.description}</p>
          {project.metrics && <div className="mt-4 grid grid-cols-3 gap-3">{project.metrics.map(m => <div key={m.label} className="border-t border-[#e8dfc8]/15 pt-2.5"><div className="font-display text-2xl text-[#e8dfc8] leading-none">{m.value}</div><div className="font-mono text-[9px] tracking-[0.12em] uppercase text-[#9a8a6e] mt-1.5">{m.label}</div></div>)}</div>}
          <div className="mt-4 flex flex-wrap gap-1.5">{project.stack.map(s => <span key={s} className="font-mono text-[10px] tracking-[0.05em] text-[#c4b698] px-2 py-0.5 border border-[#e8dfc8]/12">{s}</span>)}</div>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
            <div className="grid grid-cols-12 gap-4 lg:gap-8 pb-10 lg:pb-14">
              <div className="col-span-12 lg:col-span-7" />
              <div className="col-span-12 lg:col-span-5">
                <div className="font-mono text-[10px] tracking-[0.22em] uppercase mb-4 flex items-center gap-2" style={{ color: project.accent }}><span className="w-6 h-px" style={{ background: project.accent }} />Engineering highlights</div>
                <div className="space-y-3">{project.highlights.map((h, i) => <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }} className="border-l-2 pl-3 py-1" style={{ borderColor: project.accent }}><div className="font-mono text-[9px] tracking-[0.15em] uppercase mb-1" style={{ color: project.accent }}>{String(i + 1).padStart(2, "0")}</div><p className="text-[#e8dfc8] text-sm leading-relaxed">{h}</p></motion.div>)}</div>
                <div className="mt-6 flex gap-3">
                  {project.link && <a href={project.link} target="_blank" rel="noreferrer" data-cursor="hover" className="inline-flex items-center gap-2 px-4 py-2.5 text-sm transition-colors" style={{ background: project.accent, color: "#14100c" }}><Globe className="w-3.5 h-3.5" />Visit live site</a>}
                  {project.repo && <a href={project.repo} target="_blank" rel="noreferrer" data-cursor="hover" className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#e8dfc8]/20 hover:border-[#e8dfc8]/40 text-[#e8dfc8] text-sm transition-colors"><Github className="w-3.5 h-3.5" />View code</a>}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Projects() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const headerY = useTransform(scrollYProgress, [0, 0.3], [0, -20]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0.4]);
  return (
    <section id="work" ref={ref} className="section-anchor relative bg-[#14100c] text-[#e8dfc8] py-24 lg:py-32 px-5 sm:px-8 lg:px-12 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(184, 134, 42, 0.08), transparent 60%)" }} />
      <motion.div style={{ y: headerY, opacity: headerOpacity }} className="relative mx-auto max-w-[1400px] mb-16 lg:mb-20">
        <div className="flex items-baseline justify-between mb-10">
          <div className="flex items-center gap-4"><span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#b8862a]">02 — Selected Work</span><span className="w-16 h-px bg-[#e8dfc8]/25" /></div>
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#9a8a6e]">03 projects · 2024–2025</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          <div className="lg:col-span-8"><motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="display text-[#e8dfc8] text-[10vw] md:text-[7vw] lg:text-[5vw] leading-[0.9] tracking-[-0.04em] font-medium">Three systems,<br /><span className="text-[#b8862a] italic font-light">shipped to production.</span></motion.h2></div>
          <div className="lg:col-span-4"><p className="text-[#c4b698] text-base leading-relaxed max-w-[360px]">Real systems. Deployed, used, validated. Click a project to expand details.</p></div>
        </div>
      </motion.div>
      <div className="mx-auto max-w-[1400px] border-t border-[#e8dfc8]/15">{PROJECTS.map((p, i) => <CaseCard key={p.id} project={p} index={i} />)}</div>
      <div className="mx-auto max-w-[1400px] mt-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="font-display text-3xl text-[#e8dfc8]">More experiments on GitHub.</div>
        <a href="https://github.com/DivyaanshuXD" target="_blank" rel="noreferrer" data-cursor="hover" className="group flex items-center gap-3 px-6 py-4 border border-[#e8dfc8]/20 hover:border-[#b8862a] hover:bg-[#b8862a] text-[#e8dfc8] hover:text-[#14100c] transition-all"><Github className="w-4 h-4" /><span className="font-mono text-[11px] tracking-[0.22em] uppercase">@DivyaanshuXD</span><ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></a>
      </div>
    </section>
  );
}
