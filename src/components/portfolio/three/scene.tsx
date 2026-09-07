"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * ParticleField — a dense field of points that:
 * - Arranges itself on a 3D ring/wave lattice
 * - Rotates slowly
 * - Reacts to pointer position (parallax)
 * - Pulses color between ember and warm-white
 *
 * Pure GPU Points — cheap even on mobile.
 */
function ParticleField({ count = 4500 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const { viewport } = useThree();
  const pointer = useRef({ x: 0, y: 0 });

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const ember = new THREE.Color("#ff6a1a");
    const warm = new THREE.Color("#ffae5a");
    const bone = new THREE.Color("#f5efe6");

    for (let i = 0; i < count; i++) {
      // Distribute on a torus-like swirl with vertical wave
      const t = Math.random();
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.4 + Math.pow(Math.random(), 0.6) * 6.5;
      const height = (Math.random() - 0.5) * 7;

      positions[i * 3 + 0] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height + Math.sin(angle * 0.7 + t * 4) * 0.4;
      positions[i * 3 + 2] = Math.sin(angle) * radius - 2;

      // color mix: 60% ember, 30% warm, 10% bone
      const r = Math.random();
      const c = r < 0.6 ? ember.clone().lerp(warm, Math.random()) : bone.clone().lerp(warm, Math.random() * 0.4);
      colors[i * 3 + 0] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      sizes[i] = Math.random() * 1.6 + 0.3;
    }
    return { positions, colors, sizes };
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    // gentle rotation
    pointsRef.current.rotation.y += delta * 0.045;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.12) * 0.05;

    // pointer parallax
    pointer.current.x += (state.pointer.x - pointer.current.x) * 0.04;
    pointer.current.y += (state.pointer.y - pointer.current.y) * 0.04;
    pointsRef.current.position.x = pointer.current.x * 0.6;
    pointsRef.current.position.y = pointer.current.y * 0.4;

    // subtle scale breathing
    const s = 1 + Math.sin(state.clock.elapsedTime * 0.4) * 0.03;
    pointsRef.current.scale.setScalar(s);

    // update shader time uniform
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  // Custom shader for soft round particles
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: /* glsl */ `
        attribute float size;
        varying vec3 vColor;
        uniform float uTime;
        uniform float uPixelRatio;
        void main() {
          vColor = color;
          vec3 pos = position;
          pos.y += sin(uTime * 0.6 + pos.x * 0.4) * 0.06;
          pos.x += cos(uTime * 0.4 + pos.z * 0.3) * 0.06;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * uPixelRatio * (180.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vColor;
        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;
          float alpha = smoothstep(0.5, 0.0, d);
          alpha = pow(alpha, 1.5);
          gl_FragColor = vec4(vColor, alpha * 0.85);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });
  }, []);

  return (
    <points
      ref={pointsRef}
      material={material}
      onUpdate={(self) => {
        materialRef.current = self.material as THREE.ShaderMaterial;
      }}
    >
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
    </points>
  );
}

function WaveGrid() {
  // Subtle wireframe wave at the bottom of the scene for depth
  const ref = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(28, 14, 60, 30);
    return geo;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = Math.sin(x * 0.4 + t * 0.6) * 0.35 + Math.cos(y * 0.3 + t * 0.5) * 0.35;
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;
    ref.current.rotation.x = -Math.PI / 2.4;
    ref.current.position.y = -3.2;
    ref.current.position.z = -1;
  });

  return (
    <mesh ref={ref} geometry={geometry}>
      <meshBasicMaterial
        color="#ff6a1a"
        wireframe
        transparent
        opacity={0.12}
      />
    </mesh>
  );
}

export default function ThreeScene() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ParticleField count={4200} />
        <WaveGrid />
      </Canvas>
    </div>
  );
}
