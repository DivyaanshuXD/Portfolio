"use client";

import { motion } from "framer-motion";

/**
 * ProjectVisual — an abstract SVG "preview" for each project.
 * Different visual per project ID. Mask-reveals on scroll into view.
 * Not real screenshots — abstract editorial representations.
 */

type Props = {
  projectId: string;
  accent: string;
  variant?: "light" | "dark";
};

export default function ProjectVisual({ projectId, accent, variant = "dark" }: Props) {
  const bg = variant === "dark" ? "#14110d" : "#e1d6ba";
  const fg = variant === "dark" ? "#e8dfc8" : "#0a0907";
  const muted = variant === "dark" ? "#5e564a" : "#7d7466";

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: bg }}>
      {projectId === "llmtap" && <LLMTapVisual accent={accent} fg={fg} muted={muted} />}
      {projectId === "raksetu" && <RaksetuVisual accent={accent} fg={fg} muted={muted} />}
      {projectId === "childsafe" && <ChildSafeVisual accent={accent} fg={fg} muted={muted} />}

      {/* Top label */}
      <div className="absolute top-3 left-3 font-mono text-[9px] tracking-[0.18em] uppercase z-10" style={{ color: muted }}>
        {projectId}.preview
      </div>
    </div>
  );
}

function LLMTapVisual({ accent, fg, muted }: { accent: string; fg: string; muted: string }) {
  // An abstract "trace list" — like the LLMTap dashboard
  const traces = [
    { model: "gpt-4o", status: "ok", latency: 240 },
    { model: "claude-3", status: "ok", latency: 180 },
    { model: "gemini", status: "streaming", latency: 0 },
    { model: "groq", status: "ok", latency: 95 },
    { model: "deepseek", status: "ok", latency: 320 },
  ];
  return (
    <div className="p-5 h-full flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: `${fg}20` }}>
        <div className="font-mono text-[10px] tracking-[0.15em] uppercase" style={{ color: fg }}>
          llmtap · live traces
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[9px]" style={{ color: accent }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} />
          REC
        </div>
      </div>
      {/* Trace rows */}
      <div className="flex-1 space-y-1.5">
        {traces.map((t, i) => (
          <motion.div
            key={t.model}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className="flex items-center gap-2 font-mono text-[10px]"
            style={{ color: fg }}
          >
            <span style={{ color: muted }}>→</span>
            <span className="w-16">{t.model}</span>
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: t.status === "streaming" ? accent : "#34503a",
              }}
            />
            {t.status === "streaming" ? (
              <span className="flex-1 text-[9px]" style={{ color: accent }}>
                streaming...
              </span>
            ) : (
              <span className="flex-1 text-[9px]" style={{ color: muted }}>
                {t.latency}ms · ${((t.latency / 1000) * 0.005).toFixed(4)}
              </span>
            )}
            {/* Latency bar */}
            <span className="h-1 w-12" style={{ background: `${fg}15` }}>
              <motion.span
                initial={{ width: 0 }}
                whileInView={{ width: `${(t.latency / 400) * 100}%` }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.08, duration: 0.6 }}
                className="block h-full"
                style={{ background: accent }}
              />
            </span>
          </motion.div>
        ))}
      </div>
      {/* Footer */}
      <div className="border-t pt-2 flex justify-between font-mono text-[9px]" style={{ borderColor: `${fg}20`, color: muted }}>
        <span>5 traces · 50+ models</span>
        <span>OTLP export: on</span>
      </div>
    </div>
  );
}

function RaksetuVisual({ accent, fg, muted }: { accent: string; fg: string; muted: string }) {
  return (
    <div className="p-5 h-full flex flex-col">
      {/* "Map" with donor dots */}
      <div className="flex-1 relative">
        <svg viewBox="0 0 200 120" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          {/* Stylized India silhouette — abstract */}
          <path
            d="M 60 20 Q 80 15 100 25 Q 130 30 140 50 Q 150 70 135 90 Q 120 110 100 115 Q 80 110 70 95 Q 55 80 60 60 Z"
            fill="none"
            stroke={muted}
            strokeWidth="0.5"
            strokeDasharray="2 2"
          />
          {/* Donor dots */}
          {[
            { x: 80, y: 35, delay: 0 },
            { x: 110, y: 45, delay: 0.3 },
            { x: 95, y: 70, delay: 0.6 },
            { x: 75, y: 80, delay: 0.9 },
            { x: 120, y: 75, delay: 1.2 },
            { x: 100, y: 95, delay: 1.5 },
          ].map((d, i) => (
            <motion.circle
              key={i}
              cx={d.x}
              cy={d.y}
              r="2"
              fill={accent}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.12 }}
            />
          ))}
          {/* Emergency request ripple */}
          <motion.circle
            cx="95"
            cy="55"
            r="3"
            fill="none"
            stroke={accent}
            strokeWidth="0.8"
            animate={{ r: [3, 18], opacity: [1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
          <circle cx="95" cy="55" r="3" fill={accent} />
        </svg>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 border-t pt-3" style={{ borderColor: `${fg}20` }}>
        <div>
          <div className="display text-xl leading-none" style={{ color: fg }}>95%</div>
          <div className="font-mono text-[8px] tracking-[0.1em] uppercase mt-1" style={{ color: muted }}>
            ML accuracy
          </div>
        </div>
        <div>
          <div className="display text-xl leading-none" style={{ color: fg }}>24/7</div>
          <div className="font-mono text-[8px] tracking-[0.1em] uppercase mt-1" style={{ color: muted }}>
            SMS pipeline
          </div>
        </div>
        <div>
          <div className="display text-xl leading-none" style={{ color: accent }}>PWA</div>
          <div className="font-mono text-[8px] tracking-[0.1em] uppercase mt-1" style={{ color: muted }}>
            Offline-ready
          </div>
        </div>
      </div>
    </div>
  );
}

function ChildSafeVisual({ accent, fg, muted }: { accent: string; fg: string; muted: string }) {
  return (
    <div className="p-5 h-full flex flex-col gap-3">
      <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: `${fg}20` }}>
        <div className="font-mono text-[10px] tracking-[0.15em] uppercase" style={{ color: fg }}>
          childsafe_o2 · sensor log
        </div>
        <div className="font-mono text-[9px]" style={{ color: accent }}>
          ARMED
        </div>
      </div>
      {/* Sensor readings */}
      <div className="flex-1 space-y-2">
        {[
          { label: "PIR motion", value: "DETECTED", color: accent },
          { label: "Interior temp", value: "47.2°C", color: fg },
          { label: "O2 level", value: "18.4%", color: fg },
          { label: "Ignition", value: "OFF", color: muted },
          { label: "Vent relay", value: "ENGAGED", color: accent },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-center justify-between font-mono text-[10px]"
          >
            <span style={{ color: muted }}>{s.label}</span>
            <span style={{ color: s.color }} className="tabular">
              {s.value}
            </span>
          </motion.div>
        ))}
      </div>
      {/* Alert state */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1 }}
        className="border-t pt-2 flex items-center gap-2 font-mono text-[10px]"
        style={{ borderColor: `${fg}20`, color: accent }}
      >
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="w-2 h-2 rounded-full"
          style={{ background: accent }}
        />
        GSM alert dispatched · SMS + voice
      </motion.div>
    </div>
  );
}
