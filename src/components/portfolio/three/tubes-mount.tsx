"use client";
import { useEffect, useRef } from "react";

export default function TubesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    let cleanup: (() => void) | undefined;
    const canvas = canvasRef.current;
    const updateSize = () => {
      const parent = canvas.parentElement;
      if (parent) { canvas.width = parent.clientWidth; canvas.height = parent.clientHeight; }
    };
    updateSize();
    import("./tubes-effect").then(({ initTubesCursor }) => {
      if (canvasRef.current) cleanup = initTubesCursor(canvasRef.current);
    });
    const onResize = () => updateSize();
    window.addEventListener("resize", onResize);
    return () => { cleanup?.(); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={canvasRef} id="tubes-canvas" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }} />;
}
