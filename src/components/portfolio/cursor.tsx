"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Custom cursor — dot + ring with spring physics.
 * - Dot tracks pointer 1:1 (no lag)
 * - Ring lags behind with spring easing, grows on interactive hover
 * - Uses refs for hot-path state to avoid re-rendering on every mousemove
 * - mix-blend-mode: difference for visibility on any background
 * - Restores native cursor on touch devices
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [enabled, setEnabled] = useState(false);

  // Hot-path state in refs — no re-renders
  const hovering = useRef(false);
  const label = useRef("");

  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!canHover) return;
    const id = window.setTimeout(() => setEnabled(true), 0);
    document.documentElement.classList.add("custom-cursor-active");

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: mouse.x, y: mouse.y };
    let rafId: number;
    let isDown = false;

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      // Dot follows instantly
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouse.x - 3}px, ${mouse.y - 3}px, 0)`;
      }

      // Detect interactive target — guard against non-Element targets (fake MouseEvents)
      const target = e.target;
      if (!target || typeof (target as HTMLElement).closest !== "function") {
        hovering.current = false;
        if (label.current) { label.current = ""; if (labelRef.current) labelRef.current.textContent = ""; }
        ringRef.current?.classList.remove("cursor-hover", "cursor-text");
        return;
      }
      const textEl = (target as HTMLElement).closest("[data-cursor-text]") as HTMLElement | null;
      const interactiveEl = (target as HTMLElement).closest(
        'a, button, [data-cursor], [role="button"], input, textarea, select',
      ) as HTMLElement | null;

      const wasHovering = hovering.current;
      if (textEl) {
        const newLabel = textEl.dataset.cursorText || "";
        if (newLabel !== label.current) {
          label.current = newLabel;
          if (labelRef.current) labelRef.current.textContent = newLabel;
        }
        hovering.current = false;
        ringRef.current?.classList.remove("cursor-hover");
        ringRef.current?.classList.add("cursor-text");
      } else if (interactiveEl) {
        hovering.current = true;
        if (label.current) {
          label.current = "";
          if (labelRef.current) labelRef.current.textContent = "";
        }
        ringRef.current?.classList.add("cursor-hover");
        ringRef.current?.classList.remove("cursor-text");
      } else {
        hovering.current = false;
        if (label.current) {
          label.current = "";
          if (labelRef.current) labelRef.current.textContent = "";
        }
        ringRef.current?.classList.remove("cursor-hover", "cursor-text");
      }
      // Force a class sync if state changed (for the ring size transition)
      if (wasHovering !== hovering.current) {
        // classList already handles it
      }
    };

    const onDown = () => {
      isDown = true;
    };
    const onUp = () => {
      isDown = false;
    };

    const tick = () => {
      // Spring-follow ring
      ring.x += (mouse.x - ring.x) * 0.16;
      ring.y += (mouse.y - ring.y) * 0.16;
      if (ringRef.current) {
        const baseSize = hovering.current ? 64 : 32;
        const size = isDown ? baseSize * 0.82 : baseSize;
        ringRef.current.style.transform = `translate3d(${ring.x - size / 2}px, ${ring.y - size / 2}px, 0)`;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    // Hide cursor when leaving window
    const onLeave = () => {
      if (dotRef.current) dotRef.current.style.opacity = "0";
      if (ringRef.current) ringRef.current.style.opacity = "0";
    };
    const onEnter = () => {
      if (dotRef.current) dotRef.current.style.opacity = "1";
      if (ringRef.current) ringRef.current.style.opacity = "1";
    };
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    return () => {
      window.clearTimeout(id);
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
      document.documentElement.classList.remove("custom-cursor-active");
    };
    // Empty deps — effect runs once, refs handle mutable state
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring">
        <span ref={labelRef} className="cursor-label" />
      </div>
    </>
  );
}
