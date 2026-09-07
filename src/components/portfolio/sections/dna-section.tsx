"use client";
import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import * as THREE from "three";

/**
 * DNA Section — wavy shader background.
 *
 * The background is a full-screen RawShaderMaterial that renders an
 * animated wavy-line pattern using a fragment shader. The shader
 * creates horizontal sine-wave lines with RGB channel separation
 * (chromatic aberration) that gives a flowing, liquid-light effect.
 *
 * This is the EXACT shader from the user's reference code, adapted
 * to work inside a React component with R3F lifecycle.
 *
 * The "Ship to production." text overlays on top with a soft radial
 * backdrop for readability.
 */

// ─── Shaders (exact copy from user's reference) ──────────────────
const vertexShader = `
attribute vec3 position;

void main() {
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;
uniform vec2 resolution;
uniform float time;
uniform float xScale;
uniform float yScale;
uniform float distortion;

void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
  
  float d = length(p) * distortion;
  
  float rx = p.x * (1.0 + d);
  float gx = p.x;
  float bx = p.x * (1.0 - d);

  float r = 0.05 / abs(p.y + sin((rx + time) * xScale) * yScale);
  float g = 0.05 / abs(p.y + sin((gx + time) * xScale) * yScale);
  float b = 0.05 / abs(p.y + sin((bx + time) * xScale) * yScale);
  
  gl_FragColor = vec4(r, g, b, 1.0);
}
`;

export default function DNASection({ text, accent }: { text: string; accent?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const textOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  useEffect(() => {
    if (!canvasRef.current) return;

    // ─── Stage ──────────────────────────────────────────────────
    const renderParam = {
      clearColor: 0x000000,
      width: canvasRef.current.clientWidth,
      height: canvasRef.current.clientHeight,
    };

    const cameraParam = {
      left: -1, right: 1, top: 1, bottom: 1, near: 0, far: -1,
    };

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      cameraParam.left, cameraParam.right, cameraParam.top, cameraParam.bottom,
      cameraParam.near, cameraParam.far
    );

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(new THREE.Color(renderParam.clearColor));
    renderer.setSize(renderParam.width, renderParam.height);

    // ─── Mesh ────────────────────────────────────────────────────
    const uniforms = {
      resolution: { value: new THREE.Vector2(renderParam.width, renderParam.height) },
      time: { value: 0.0 },
      xScale: { value: 1.0 },
      yScale: { value: 0.5 },
      distortion: { value: 0.050 },
    };

    const position = [
      -1.0, -1.0, 0.0,
       1.0, -1.0, 0.0,
      -1.0,  1.0, 0.0,
       1.0, -1.0, 0.0,
      -1.0,  1.0, 0.0,
       1.0,  1.0, 0.0
    ];
    const positions = new THREE.BufferAttribute(new Float32Array(position), 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", positions);

    const material = new THREE.RawShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // ─── Visibility gate ────────────────────────────────────────
    let visible = false;
    const section = document.getElementById("dna-section");
    if (section) {
      const obs = new IntersectionObserver(
        (entries) => { for (const e of entries) visible = e.isIntersecting; },
        { threshold: 0 }
      );
      obs.observe(section);
      // Cleanup on unmount
      const disconnectObs = () => obs.disconnect();
    }

    // ─── Resize ────────────────────────────────────────────────
    const onResize = () => {
      if (!canvasRef.current) return;
      const w = canvasRef.current.clientWidth;
      const h = canvasRef.current.clientHeight;
      // OrthographicCamera doesn't have .aspect — set left/right/top/bottom
      // based on the canvas aspect ratio
      const aspect = w / h;
      camera.left = -1;
      camera.right = 1;
      camera.top = 1 / aspect;
      camera.bottom = -1 / aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      uniforms.resolution.value.set(w, h);
    };
    window.addEventListener("resize", onResize);

    // ─── RAF loop ───────────────────────────────────────────────
    let rafId: number;
    const raf = () => {
      rafId = requestAnimationFrame(raf);
      if (!visible) return;
      uniforms.time.value += 0.01;
      renderer.render(scene, camera);
    };
    rafId = requestAnimationFrame(raf);

    // ─── Cleanup ────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      if (disconnectObs) disconnectObs();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section ref={ref} id="dna-section" className="relative overflow-hidden min-h-[100vh] flex items-center justify-center bg-black">
      {/* Shader background canvas */}
      <motion.div style={{ opacity: bgOpacity }} className="absolute inset-0 z-0">
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      </motion.div>

      {/* Text layer — just the text with a soft radial backdrop */}
      <motion.div style={{ opacity: textOpacity }} className="relative z-10 mx-auto max-w-[1200px] px-6 text-center flex flex-col items-center">
        <div
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 40%, transparent 70%)",
          }}
        />
        <p
          className="display italic font-light text-4xl sm:text-5xl lg:text-7xl leading-[1.1] tracking-[-0.02em] text-[#e8dfc8] relative"
          style={{ textShadow: "0 4px 24px rgba(0,0,0,0.8), 0 0 60px rgba(0,0,0,0.6)" }}
        >
          {text.split(accent ?? "§").map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && accent && <span style={{ color: "#d4a73a" }}>{accent}</span>}
            </span>
          ))}
        </p>
      </motion.div>

      {/* Bottom gradient — blends into the cream About section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-20" style={{ background: "linear-gradient(to top, #e8dfc8, transparent)" }} />
    </section>
  );
}
