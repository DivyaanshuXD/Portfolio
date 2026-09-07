"use client";
import { useRef, useMemo, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Trophy, BadgeCheck, ChevronDown, Sparkles, Star } from "lucide-react";
import { AWARDS, CERTIFICATIONS, MARQUEE_WORDS } from "../data";

/**
 * Recognition — split layout design.
 *
 *  - Awards occupy the LEFT half — large dramatic trophy cards with
 *    oversized result badges, animated trophy hover, accent bar that
 *    grows on hover, subtle glow
 *  - Certifications + Internships occupy the RIGHT half — clean
 *    "credentials ledger" list with date ranges, kind chips
 *    (Cert / Internship), issuer badges, expandable summaries
 *  - Each side shows only the TOP 3 entries initially
 *  - A "View more" button on each side expands the rest with a
 *    staggered height + opacity animation
 *  - Filter pills have been removed — the split layout itself is the
 *    filter (left = awards, right = creds)
 *  - Stat row at the top with the headline numbers
 */

const TOP_N = 3;

// ─── Award card (LEFT side) ─────────────────────────────────────────
function AwardCard({ award, index }: { award: typeof AWARDS[number]; index: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.08, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="group relative border border-[#0a0907]/12 hover:border-[#a8421e]/40 bg-[#faf5e6]/30 hover:bg-[#faf5e6]/70 transition-all p-6 lg:p-7 overflow-hidden"
    >
      {/* Accent bar on the left edge — grows on hover */}
      <div
        className="absolute left-0 top-0 h-full w-[3px] transition-all duration-500 group-hover:w-1.5"
        style={{ background: award.accent, opacity: 0.7 }}
      />
      {/* Soft accent glow on hover */}
      <div
        className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-700"
        style={{ background: award.accent }}
      />

      <div className="relative grid grid-cols-12 gap-4 lg:gap-5 items-start">
        {/* Year + date — left column */}
        <div className="col-span-12 md:col-span-3">
          <div className="display text-5xl lg:text-6xl text-[#0a0907] leading-none tabular">
            {award.year}
          </div>
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#4a3d2e] mt-2">
            {award.date}
          </div>
        </div>
        {/* Title + context + stars — middle column */}
        <div className="col-span-12 md:col-span-6">
          <h3 className="display text-2xl lg:text-3xl text-[#0a0907] leading-tight mb-3">
            {award.title}
          </h3>
          <div className="font-mono text-[11px] tracking-[0.15em] uppercase text-[#4a3d2e] mb-3">
            {award.context}
          </div>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3].map((n) => (
              <Star key={n} className="w-3 h-3 fill-current" style={{ color: award.accent }} />
            ))}
          </div>
          {award.summary && (
            <p className="body-serif text-[14px] text-[#4a3d2e] leading-relaxed max-w-[420px]">
              {award.summary}
            </p>
          )}
        </div>
        {/* Result badge — right column with animated trophy on hover */}
        <div className="col-span-12 md:col-span-3 flex md:justify-end">
          <div
            className="relative inline-flex flex-col items-center gap-2 px-5 py-4 border-2 overflow-hidden"
            style={{ borderColor: award.accent, background: `${award.accent}08` }}
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.18 }}
              transition={{ duration: 0.5 }}
            >
              <Trophy className="w-5 h-5" style={{ color: award.accent }} />
            </motion.div>
            <div
              className="display text-3xl leading-none tabular"
              style={{ color: award.accent }}
            >
              {award.result}
            </div>
            <div
              className="font-mono text-[9px] tracking-[0.18em] uppercase"
              style={{ color: award.accent }}
            >
              {award.resultLabel}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Credential row (RIGHT side) ────────────────────────────────────
function CredentialRow({ cert, index }: { cert: typeof CERTIFICATIONS[number]; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const isInternship = cert.kind === "internship";

  // Compute the date label — single date for certs, range for internships
  const dateLabel = (() => {
    const startMonth = cert.date ? new Date(cert.date + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }) : cert.year;
    if (isInternship && cert.dateEnd) {
      return `${startMonth} → ${cert.dateEnd}`;
    }
    return startMonth;
  })();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-5% 0px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        data-cursor="hover"
        aria-label={`Expand ${cert.title}`}
        className="w-full text-left transition-colors"
        style={{
          background: expanded
            ? "linear-gradient(90deg, rgba(184,134,42,0.10), transparent 70%)"
            : "transparent",
          padding: "0.875rem 0.5rem 0.875rem 0",
          margin: "-1px 0",
        }}
      >
        <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-start">
          {/* Issuer seal/badge with ornamental ring */}
          <div className="relative w-12 h-12 grid place-items-center shrink-0">
            <svg viewBox="0 0 48 48" className="absolute inset-0 w-full h-full" fill="none">
              <circle cx="24" cy="24" r="23" stroke="#8a6519" strokeWidth="0.6" strokeDasharray="2 3" opacity="0.55" />
              <circle cx="24" cy="24" r="19" stroke="#8a6519" strokeWidth="1" opacity="0.4" />
            </svg>
            <span className="font-display text-xs italic text-[#8a6519] relative z-10">
              {cert.badge}
            </span>
          </div>

          <div>
            {/* Kind chip + issuer */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[9px] tracking-[0.18em] uppercase border"
                style={{
                  color: isInternship ? "#34503a" : "#8a6519",
                  background: isInternship ? "rgba(52,80,58,0.10)" : "rgba(184,134,42,0.10)",
                  borderColor: isInternship ? "rgba(52,80,58,0.40)" : "rgba(184,134,42,0.40)",
                }}
              >
                {isInternship ? "Internship" : "Certification"}
              </span>
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#5e564a]">
                {cert.issuer}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-display text-base sm:text-lg text-[#0a0907] leading-tight mb-1">
              {cert.title}
            </h3>

            {/* Date label */}
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#5e564a] flex items-center gap-2">
              <span className="inline-block w-3 h-px bg-[#0a0907]/20" />
              {dateLabel}
              {cert.validUntil && (
                <span className="text-[#8a6519] normal-case tracking-[0.15em]">· Valid through {cert.validUntil}</span>
              )}
            </div>

            {/* Expandable summary */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden mt-3"
                >
                  <p className="body-serif text-[13px] text-[#4a3d2e] leading-relaxed pr-4 max-w-[420px]">
                    {cert.summary}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-1">
            <ChevronDown
              className={`w-4 h-4 text-[#8a6519] transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            />
          </div>
        </div>
      </button>
    </motion.div>
  );
}

// ─── "View more" button ─────────────────────────────────────────────
function ViewMoreButton({ onClick, expanded, hiddenCount }: { onClick: () => void; expanded: boolean; hiddenCount: number }) {
  if (hiddenCount === 0) return null;
  return (
    <motion.button
      onClick={onClick}
      data-cursor="hover"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="group w-full mt-4 flex items-center justify-center gap-2 py-3 border border-[#0a0907]/15 hover:border-[#a8421e]/50 hover:bg-[#a8421e]/[0.04] transition-all"
    >
      <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#5e564a] group-hover:text-[#a8421e] transition-colors">
        {expanded ? "Show less" : `View more (+${hiddenCount})`}
      </span>
      <motion.span
        animate={{ rotate: expanded ? 180 : 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <ChevronDown className="w-3.5 h-3.5 text-[#a8421e]" />
      </motion.span>
    </motion.button>
  );
}

// ─── Stat row ───────────────────────────────────────────────────────
const STATS = [
  { value: "3", label: "Awards", sub: "1st · 3rd · Finalist" },
  { value: "3", label: "Credentials", sub: "2 certs · 1 internship" },
  { value: "860+", label: "Teams out-built", sub: "IGNITE 2026" },
  { value: "2×", label: "Final rounds", sub: "Social · Hack-A-Cure" },
];

// ─── Main section ──────────────────────────────────────────────────
export default function Recognition() {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: marqueeRef, offset: ["start end", "end start"] });
  const marqueeX = useTransform(scrollYProgress, [0, 1], ["2%", "-8%"]);

  // View-more state for each side
  const [awardsExpanded, setAwardsExpanded] = useState(false);
  const [credsExpanded, setCredsExpanded] = useState(false);

  // Sort awards by date (most recent first)
  const sortedAwards = useMemo(
    () => [...AWARDS].sort((a, b) => (b.dateIso ?? "").localeCompare(a.dateIso ?? "")),
    []
  );
  // Sort credentials by date (most recent first)
  const sortedCreds = useMemo(
    () => [...CERTIFICATIONS].sort((a, b) => (b.dateEndIso ?? b.date ?? "").localeCompare(a.dateEndIso ?? a.date ?? "")),
    []
  );

  // Slice for top-N + overflow
  const visibleAwards = awardsExpanded ? sortedAwards : sortedAwards.slice(0, TOP_N);
  const hiddenAwardsCount = sortedAwards.length - TOP_N;
  const visibleCreds = credsExpanded ? sortedCreds : sortedCreds.slice(0, TOP_N);
  const hiddenCredsCount = sortedCreds.length - TOP_N;

  return (
    <section id="recognition" className="section-anchor relative bg-[#e8dfc8] py-24 lg:py-32 border-t border-[#0a0907]/10 overflow-hidden">
      {/* Marquee opener */}
      <div ref={marqueeRef} className="relative mb-20 lg:mb-28 py-8 border-y-2 border-[#0a0907]/15 overflow-hidden marquee-paused">
        <motion.div style={{ x: marqueeX }} className="flex gap-16 whitespace-nowrap w-max">
          {[...MARQUEE_WORDS, ...MARQUEE_WORDS, ...MARQUEE_WORDS].map((word, i) => (
            <span key={i} className="display text-7xl lg:text-9xl text-[#0a0907]/30 italic flex items-center gap-16 font-light">
              {word}
              <span className="text-[#8a6519] not-italic font-mono text-xl">✦</span>
            </span>
          ))}
        </motion.div>
      </div>

      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        {/* Section header */}
        <div className="flex items-baseline justify-between mb-12 lg:mb-16">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#8a6519]">04 — Recognition</span>
            <span className="w-16 h-px bg-[#0a0907]/20" />
          </div>
        </div>

        {/* Headline + intro */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
          <div className="lg:col-span-7">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="display text-[#0a0907] text-[12vw] md:text-[8vw] lg:text-[6vw] leading-[0.88] tracking-[-0.04em]"
            >
              Winning
              <br />
              isn't <span className="italic text-[#8a6519]">luck.</span>
            </motion.h2>
          </div>
          <div className="lg:col-span-5 flex items-end">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="body-serif text-lg text-[#2a2218] max-w-[420px]"
            >
              Three competitions. Three times the work held up against hundreds of teams — backed by industry credentials and a hands-on GCP internship.
            </motion.p>
          </div>
        </div>

        {/* Stat row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16 lg:mb-20">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-5% 0px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="group p-5 border-l-2 border-[#8a6519]/40 hover:border-[#8a6519] transition-colors"
            >
              <div className="display text-4xl lg:text-5xl text-[#8a6519] leading-none tabular">
                {s.value}
              </div>
              <div className="font-display text-sm text-[#0a0907] mt-2 leading-tight">{s.label}</div>
              <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#5e564a] mt-1">{s.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* The Split — Awards left, Credentials right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12">
          {/* LEFT: AWARDS */}
          <div className="lg:col-span-7">
            {/* Section heading */}
            <div className="flex items-baseline justify-between mb-6 pb-3 border-b-2 border-[#a8421e]/30">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#a8421e]" />
                <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#a8421e]">Awards</span>
              </div>
              <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#5e564a]">
                {sortedAwards.length} entries
              </span>
            </div>

            <AnimatePresence mode="popLayout">
              <motion.div layout className="space-y-5">
                {visibleAwards.map((a, i) => (
                  <AwardCard key={a.id} award={a} index={i} />
                ))}
              </motion.div>
            </AnimatePresence>

            <ViewMoreButton
              onClick={() => setAwardsExpanded((v) => !v)}
              expanded={awardsExpanded}
              hiddenCount={hiddenAwardsCount}
            />
          </div>

          {/* RIGHT: CREDENTIALS + INTERNSHIPS */}
          <div className="lg:col-span-5">
            {/* Parchment-style wrapper card */}
            <div className="relative p-6 lg:p-7 rounded-sm" style={{
              background: "linear-gradient(160deg, rgba(250,245,230,0.6), rgba(243,236,216,0.45) 50%, rgba(232,223,200,0.25))",
              boxShadow: "0 1px 0 rgba(255,255,255,0.4) inset, 0 12px 40px rgba(74,61,46,0.08)",
              border: "1px solid rgba(184,134,42,0.18)",
            }}>
              {/* Ornamental corner ticks */}
              <span className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#8a6519]/50" />
              <span className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#8a6519]/50" />
              <span className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#8a6519]/50" />
              <span className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#8a6519]/50" />

              {/* Section heading */}
              <div className="flex items-baseline justify-between mb-5 pb-3 border-b border-[#8a6519]/25">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-[#8a6519]" />
                  <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#8a6519]">Credentials</span>
                </div>
                <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#5e564a]">
                  {sortedCreds.length} entries
                </span>
              </div>

              {/* Hint line */}
              <div className="flex items-center gap-1.5 mb-3 font-mono text-[9px] tracking-[0.18em] uppercase text-[#5e564a]">
                <Sparkles className="w-3 h-3 text-[#8a6519]" />
                <span>Click any row to expand</span>
              </div>

              <AnimatePresence mode="popLayout">
                <motion.div layout>
                  {visibleCreds.map((c, i) => (
                    <CredentialRow key={c.id} cert={c} index={i} />
                  ))}
                </motion.div>
              </AnimatePresence>

              <ViewMoreButton
                onClick={() => setCredsExpanded((v) => !v)}
                expanded={credsExpanded}
                hiddenCount={hiddenCredsCount}
              />
            </div>
          </div>
        </div>

        {/* Footer caption */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 lg:mt-16 pt-8 border-t border-[#0a0907]/15 flex flex-col sm:flex-row items-start sm:items-baseline gap-3 sm:gap-6"
        >
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#5e564a]">
            {sortedAwards.length + sortedCreds.length} total entries · sorted most-recent first
          </div>
          <div className="hidden sm:block w-12 h-px bg-[#0a0907]/20" />
          <div className="body-serif italic text-base text-[#5e564a] max-w-[520px]">
            "Build the version that still runs at 3am on a Sunday when the on-call pager goes off."
          </div>
        </motion.div>
      </div>
    </section>
  );
}
