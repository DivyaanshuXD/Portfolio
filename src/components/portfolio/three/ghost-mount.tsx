"use client";
import { useEffect, useRef } from "react";

export default function GhostEffect() {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    let cleanup: (() => void) | undefined;
    import("./ghost-effect").then(({ initGhostEffect }) => {
      if (containerRef.current) cleanup = initGhostEffect(containerRef.current);
    });
    return () => { cleanup?.(); };
  }, []);
  return <div ref={containerRef} className="absolute inset-0 z-[1]" style={{ overflow: "hidden" }} />;
}
