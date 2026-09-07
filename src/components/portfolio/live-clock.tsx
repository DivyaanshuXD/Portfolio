"use client";

import { useEffect, useState } from "react";

/**
 * LiveClock — Hyderabad local time in the corner. Feels alive.
 */
export default function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!now) return null;

  const time = now.toLocaleTimeString("en-US", {
    timeZone: "Asia/Kolkata",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const date = now.toLocaleDateString("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 hidden lg:flex flex-col items-center gap-0.5 font-mono text-[10px] tracking-[0.18em] uppercase mix-blend-difference">
      <div className="flex items-center gap-2 text-[#e8dfc8]">
        <span className="relative flex h-1 w-1">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#a8421e] opacity-60 animate-ping" />
          <span className="relative inline-flex rounded-full h-1 w-1 bg-[#a8421e]" />
        </span>
        <span className="tabular">{time}</span>
        <span className="opacity-60">IST</span>
      </div>
      <div className="text-[#e8dfc8] opacity-60 text-center">{date}</div>
    </div>
  );
}
