"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * WireGrid — rotating wireframe icosahedron, mouse-reactive,
 * scroll-driven camera push-through. Layered for depth.
 */

function WireLayer({
  progressRef,
  depth,
  scale,
  color,
  opacity,
}: {
  progressRef: React.MutableRefObject<number>;
  depth: number;
  scale: number;
  color: string;
  opacity: number;
}) {
  const meshRef = useRef<THREE.LineSegments>(null);
  const groupRef = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (!meshRef.current || !groupRef.current) return;
    const p = progressRef.current;
    pointer.current.x += (state.pointer.x - pointer.current.x) * 0.05;
    pointer.current.y += (state.pointer.y - pointer.current.y) * 0.05;
    meshRef.current.rotation.y += delta * (0.12 + p * 0.35);
    meshRef.current.rotation.x = pointer.current.y * 0.4 + delta * 0.03;
    meshRef.current.rotation.z = pointer.current.x * 0.2;
    const s = scale * (1 + p * 0.4);
    groupRef.current.scale.setScalar(s);
    groupRef.current.position.z = depth + p * 2;
  });

  const geometry = useRef<THREE.EdgesGeometry>(null!);
  if (!geometry.current) {
    const ico = new THREE.IcosahedronGeometry(1.5, 1);
    geometry.current = new THREE.EdgesGeometry(ico);
  }

  return (
    <group ref={groupRef}>
      <lineSegments ref={meshRef} geometry={geometry.current}>
        <lineBasicMaterial color={color} transparent opacity={opacity} />
      </lineSegments>
    </group>
  );
}

function Scene({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  useFrame((state) => {
    const p = progressRef.current;
    state.camera.position.z = 5 - p * 1.5;
    state.camera.position.x = state.pointer.x * 0.3;
    state.camera.position.y = state.pointer.y * 0.3;
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <WireLayer progressRef={progressRef} depth={0} scale={1} color="#a8421e" opacity={0.9} />
      <WireLayer progressRef={progressRef} depth={-1.5} scale={0.7} color="#e8dfc8" opacity={0.35} />
      <WireLayer progressRef={progressRef} depth={1.2} scale={1.3} color="#34503a" opacity={0.25} />
    </>
  );
}

export default function WireGrid() {
  const progressRef = useRef(0);
  const [mounted, setMounted] = useState(false);

  if (typeof window !== "undefined" && !mounted) {
    setMounted(true);
    const onScroll = () => {
      const el = document.getElementById("transition-globe");
      if (el) {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const p = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));
        progressRef.current = p;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <Scene progressRef={progressRef} />
      </Canvas>
    </div>
  );
}
