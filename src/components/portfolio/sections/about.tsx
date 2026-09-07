"use client";

import { motion, useInView, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { PROFILE, STATS, EDUCATION } from "../data";

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const [display, setDisplay] = useState<string>("0");

  useEffect(() => {
    if (!inView) return;
    const isFloat = !Number.isInteger(value);
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        setDisplay(isFloat ? v.toFixed(2) : Math.round(v).toLocaleString("en-US"));
      },
      onComplete: () => {
        // Ensure final value is exact
        setDisplay(isFloat ? value.toFixed(2) : value.toLocaleString("en-US"));
      },
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref} className="tabular">
      {display}
      {suffix}
    </span>
  );
}

export default function About() {
  return (
    <section
      id="about"
      className="section-anchor relative bg-[#e8dfc8] py-24 lg:py-32 px-5 sm:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-[1400px]">
        {/* Section header */}
        <div className="flex items-baseline justify-between mb-16 lg:mb-24">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#a8421e]">
              01 — About
            </span>
            <span className="w-16 h-px bg-[#0a0907]/20" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left: massive statement + bio */}
          <div className="lg:col-span-7">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="display text-[#0a0907] text-[8vw] md:text-[5.5vw] lg:text-[4vw] leading-[0.95] tracking-[-0.035em]"
            >
              Software as
              <br />
              <span className="italic text-[#a8421e]">infrastructure</span> for
              <br />
              the future.
            </motion.h2>

            {/* Single bio paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="body-serif text-lg text-[#1a1612] leading-relaxed mt-12 lg:mt-16 max-w-[560px]"
            >
              {PROFILE.bio}
            </motion.p>
          </div>

          {/* Right: stats + education */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28 space-y-10">
              {/* Stats */}
              <div className="border-t border-[#0a0907]/12">
                {STATS.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-5% 0px" }}
                    transition={{ duration: 0.6, delay: i * 0.08 }}
                    className="group grid grid-cols-[1fr_auto] gap-4 items-baseline py-6 border-b border-[#0a0907]/12 hover:bg-[#0a0907]/[0.02] transition-colors"
                  >
                    <div>
                      <div className="font-display text-[#0a0907] text-lg leading-tight">
                        {s.label}
                      </div>
                      <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#5e564a] mt-1">
                        {s.sub}
                      </div>
                    </div>
                    <div className="display text-4xl lg:text-5xl text-[#a8421e] leading-none">
                      <Counter value={s.value} suffix={s.suffix} />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Education — minimal */}
              <div>
                <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#5e564a] mb-5">
                  Education
                </div>
                <div className="space-y-4">
                  {EDUCATION.map((ed) => (
                    <div key={ed.id} className="grid grid-cols-[1fr_auto] gap-3 pb-3 border-b border-[#0a0907]/8 last:border-0">
                      <div>
                        <div className="font-display text-[#0a0907] text-base leading-tight">
                          {ed.institution}
                        </div>
                        <div className="text-[#5e564a] text-sm mt-0.5">{ed.degree}</div>
                      </div>
                      <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#a8421e] text-right whitespace-nowrap">
                        {ed.period}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
