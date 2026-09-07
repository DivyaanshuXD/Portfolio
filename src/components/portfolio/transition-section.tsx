"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  EffectComposer,
  RenderPass,
  UnrealBloomPass,
  ShaderPass,
} from "three-stdlib";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { motion, useScroll, useTransform } from "framer-motion";
import * as THREE from "three";

/**
 * Transition Globe
 *
 * VISUAL SYSTEM
 * ─────────────────────────────────────────────────────────────────────
 *
 * Three actual geometric layers remain unchanged:
 *
 *   INNER  → aged ivory / primary structure
 *   MIDDLE → muted antique bronze
 *   OUTER  → deep oxblood-brown
 *
 * Each layer additionally receives a very subtle wider halo layer.
 * The halo is NOT used to make the geometry itself brighter. It is
 * intentionally wider and more transparent so bloom reads as light
 * surrounding the geometry instead of a thicker bright line.
 *
 * Particle field:
 *   - small tetrahedral fragments
 *   - weighted warm palette
 *   - independent orbital drift
 *   - tiny radial breathing
 *   - independent rotation
 *   - slow global rotation
 *
 * Existing component API, scroll behavior, interaction and post-processing
 * architecture are preserved for dependent files.
 */


/* ──────────────────────────────────────────────────────────────────────
 * PALETTE
 * ──────────────────────────────────────────────────────────────────── */

/*
 * The palette is intentionally low-saturation.
 *
 * Inner:
 *   aged ivory / parchment
 *
 * Middle:
 *   antique bronze
 *
 * Outer:
 *   deep oxblood-brown
 *
 * Glow variants are slightly lighter versions of the same hue family.
 * They are NOT separate neon colors.
 */

const PALETTE = {
  inner: 0xD8C7A8,
  innerGlow: 0xF1E5C9,

  middle: 0x96704A,
  middleGlow: 0xB38A60,

  outer: 0x4A2528,
  outerGlow: 0x6E3A3B,

  particleBronze: 0x806347,
  particleOxblood: 0x4A292B,
  particleIvory: 0xC8B895,
};


/* ──────────────────────────────────────────────────────────────────────
 * ATMOSPHERIC FOG
 * ──────────────────────────────────────────────────────────────────── */

function VolumetricFog({
  geometryRef,
}: {
  geometryRef: React.MutableRefObject<THREE.Group | null>;
}) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uGhostPos: { value: new THREE.Vector3(0, 0, 0) },

          // Kept broad enough to reveal the geometry naturally.
          uRevealRadius: { value: 8.0 },

          // Slightly softer falloff than the previous version.
          uFadeStrength: { value: 1.35 },

          // IMPORTANT:
          // The previous 0.45 made the entire black background too warm.
          // This is now atmospheric rather than visibly foggy.
          uBaseOpacity: { value: 0.16 },

          uRevealOpacity: { value: 0.0 },
        },

        vertexShader: `
          varying vec3 vWorldPosition;

          void main() {
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPos.xyz;

            gl_Position =
              projectionMatrix *
              modelViewMatrix *
              vec4(position, 1.0);
          }
        `,

        fragmentShader: `
          uniform vec3 uGhostPos;
          uniform float uRevealRadius;
          uniform float uFadeStrength;
          uniform float uBaseOpacity;
          uniform float uRevealOpacity;
          uniform float uTime;

          varying vec3 vWorldPosition;

          void main() {

            float dist = distance(
              vWorldPosition.xy,
              uGhostPos.xy
            );

            float dynamicRadius =
              uRevealRadius +
              sin(uTime * 0.5) * 1.0;

            float reveal =
              smoothstep(
                dynamicRadius * 0.18,
                dynamicRadius,
                dist
              );

            reveal = pow(reveal, uFadeStrength);

            float opacity =
              mix(
                uRevealOpacity,
                uBaseOpacity,
                reveal
              );

            /*
             * Very dark warm neutral.
             * This should be felt rather than seen.
             */
            gl_FragColor =
              vec4(
                0.020,
                0.015,
                0.012,
                opacity
              );
          }
        `,

        transparent: true,
        depthWrite: false,
      }),
    []
  );

  useFrame((state) => {
    material.uniforms.uTime.value =
      state.clock.elapsedTime;

    if (geometryRef.current) {
      material.uniforms.uGhostPos.value.copy(
        geometryRef.current.position
      );
    }
  });

  return (
    <mesh
      position={[0, 0, -5]}
      scale={[40, 20, 1]}
    >
      <planeGeometry args={[1, 1]} />
      <primitive
        object={material}
        attach="material"
      />
    </mesh>
  );
}


/* ──────────────────────────────────────────────────────────────────────
 * SMALL AMBIENT POINT PARTICLES
 * ──────────────────────────────────────────────────────────────────── */

function AmbientParticles({
  count = 42,
}: {
  count?: number;
}) {
  const particlesRef = useRef<THREE.Points>(null);

  const { positions, sizes, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      /*
       * Keep these particles relatively close to the main object.
       * They act as tiny atmospheric dust rather than another particle
       * system competing with the tetrahedrons.
       */
      const radius =
        4.5 + Math.random() * 3.8;

      const theta =
        Math.random() * Math.PI * 2;

      const phi =
        Math.acos(2 * Math.random() - 1);

      positions[i * 3] =
        radius *
        Math.sin(phi) *
        Math.cos(theta);

      positions[i * 3 + 1] =
        radius *
        Math.sin(phi) *
        Math.sin(theta);

      positions[i * 3 + 2] =
        radius *
        Math.cos(phi);

      /*
       * Much smaller than before.
       */
      sizes[i] =
        0.014 +
        Math.random() * 0.025;

      phases[i] =
        Math.random() * Math.PI * 2;
    }

    return {
      positions,
      sizes,
      phases,
    };
  }, [count]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },

      vertexShader: `
        attribute float size;
        attribute float phase;

        uniform float uTime;

        varying float vAlpha;

        void main() {

          vec3 pos = position;

          float t = uTime;

          /*
           * Very small orbital drift.
           * The point field should feel alive, not animated.
           */
          float orbit =
            t * 0.045 +
            phase * 0.35;

          pos.x +=
            cos(orbit + position.z * 0.25) *
            0.055;

          pos.y +=
            sin(orbit * 0.82 + position.x * 0.2) *
            0.045;

          pos.z +=
            sin(orbit * 0.6 + position.y * 0.25) *
            0.035;

          /*
           * Gentle breathing in opacity.
           */
          vAlpha =
            0.12 +
            (
              0.10 *
              (0.5 + 0.5 * sin(
                t * 0.45 +
                phase
              ))
            );

          vec4 mvPosition =
            modelViewMatrix *
            vec4(pos, 1.0);

          gl_PointSize =
            size *
            (180.0 / -mvPosition.z);

          gl_Position =
            projectionMatrix *
            mvPosition;
        }
      `,

      fragmentShader: `
        varying float vAlpha;

        void main() {

          float d =
            distance(
              gl_PointCoord,
              vec2(0.5)
            );

          if (d > 0.5)
            discard;

          float alpha =
            smoothstep(
              0.5,
              0.0,
              d
            ) *
            vAlpha;

          /*
           * Muted bronze dust.
           * No additive white/yellow particle glow.
           */
          gl_FragColor =
            vec4(
              0.50,
              0.37,
              0.24,
              alpha
            );
        }
      `,

      transparent: true,
      depthWrite: false,

      /*
       * Additive blending is retained, but the actual particle
       * contribution is deliberately tiny.
       */
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useFrame((state) => {
    material.uniforms.uTime.value =
      state.clock.elapsedTime;

    if (particlesRef.current) {
      particlesRef.current.rotation.y +=
        0.0007;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />

        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />

        <bufferAttribute
          attach="attributes-phase"
          args={[phases, 1]}
        />
      </bufferGeometry>

      <primitive
        object={material}
        attach="material"
      />
    </points>
  );
}


/* ──────────────────────────────────────────────────────────────────────
 * TETRAHEDRON PARTICLE FIELD
 * ──────────────────────────────────────────────────────────────────── */

type FloatingParticle = {
  mesh: THREE.Mesh;

  /*
   * Original spherical position.
   */
  basePosition: THREE.Vector3;

  /*
   * Motion parameters.
   */
  phase: number;
  orbitSpeed: number;
  orbitRadius: number;
  radialAmplitude: number;
  verticalAmplitude: number;
  tangentialAmplitude: number;

  /*
   * Independent rotation.
   */
  rotationSpeed: THREE.Vector3;
};


function RotatingParticles({
  count = 140,
}: {
  count?: number;
}) {
  const groupRef =
    useRef<THREE.Group>(null);

  const particles = useMemo(() => {

    /*
     * One shared tetrahedron geometry.
     * This keeps the existing visual language while avoiding
     * creating 140 duplicate geometries.
     */
    const geometry =
      new THREE.TetrahedronGeometry(
        0.1,
        0
      );

    /*
     * Weighted palette.
     *
     * Roughly:
     *   70% muted bronze
     *   20% oxblood
     *   10% ivory
     *
     * This avoids the artificial:
     *   red → gold → cream → red → gold...
     * cycling from the previous implementation.
     */
    const materials = [
      new THREE.MeshBasicMaterial({
        color: PALETTE.particleBronze,
        transparent: true,
        opacity: 0.13,
        depthWrite: false,
      }),

      new THREE.MeshBasicMaterial({
        color: PALETTE.particleOxblood,
        transparent: true,
        opacity: 0.10,
        depthWrite: false,
      }),

      new THREE.MeshBasicMaterial({
        color: PALETTE.particleIvory,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
      }),
    ];

    const result: FloatingParticle[] = [];

    for (let i = 0; i < count; i++) {

      /*
       * Weighted random selection.
       */
      const roll = Math.random();

      let material: THREE.Material;

      if (roll < 0.70) {
        material = materials[0];
      } else if (roll < 0.90) {
        material = materials[1];
      } else {
        material = materials[2];
      }

      const mesh =
        new THREE.Mesh(
          geometry,
          material
        );

      /*
       * Spherical shell.
       *
       * Slightly tighter than the old 7–13 range.
       * The field should surround the geometry without becoming
       * an edge-to-edge particle explosion.
       */
      const direction =
        new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        ).normalize();

      const radius =
        6.8 +
        Math.random() * 4.8;

      const basePosition =
        direction
          .clone()
          .multiplyScalar(radius);

      mesh.position.copy(
        basePosition
      );

      mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      /*
       * IMPORTANT:
       *
       * The old particle scale was:
       *
       *   0.25 → 0.80
       *
       * on a 0.1-unit tetrahedron.
       *
       * That made the visible triangles too prominent.
       *
       * New:
       *
       *   0.055 → 0.22
       *
       * approximately 25–30% of the old maximum apparent size.
       */
      const scale =
        0.055 +
        Math.pow(Math.random(), 1.7) *
        0.165;

      mesh.scale.setScalar(
        scale
      );

      /*
       * Slow individual rotation.
       */
      const rotationSpeed =
        new THREE.Vector3(
          THREE.MathUtils.lerp(
            -0.14,
            0.14,
            Math.random()
          ),
          THREE.MathUtils.lerp(
            -0.20,
            0.20,
            Math.random()
          ),
          THREE.MathUtils.lerp(
            -0.12,
            0.12,
            Math.random()
          )
        );

      result.push({
        mesh,
        basePosition,

        phase:
          Math.random() *
          Math.PI *
          2,

        /*
         * Very slow orbital speed.
         */
        orbitSpeed:
          THREE.MathUtils.lerp(
            0.018,
            0.055,
            Math.random()
          ),

        /*
         * Tiny tangential movement.
         */
        orbitRadius:
          THREE.MathUtils.lerp(
            0.025,
            0.10,
            Math.random()
          ),

        /*
         * Radial breathing is deliberately tiny.
         */
        radialAmplitude:
          THREE.MathUtils.lerp(
            0.025,
            0.11,
            Math.random()
          ),

        verticalAmplitude:
          THREE.MathUtils.lerp(
            0.025,
            0.085,
            Math.random()
          ),

        tangentialAmplitude:
          THREE.MathUtils.lerp(
            0.025,
            0.09,
            Math.random()
          ),

        rotationSpeed,
      });
    }

    return {
      particles: result,
      geometry,
      materials,
    };
  }, [count]);

  useEffect(() => {
    return () => {
      particles.geometry.dispose();

      for (const material of particles.materials) {
        material.dispose();
      }
    };
  }, [particles]);

  useFrame((state, delta) => {
    if (!groupRef.current)
      return;

    const time =
      state.clock.elapsedTime;

    /*
     * Slow global rotation.
     *
     * This is deliberately much slower than the previous rigid
     * rotation because individual particles now have their own
     * movement.
     */
    groupRef.current.rotation.y -=
      delta * 0.018;

    groupRef.current.rotation.x -=
      delta * 0.004;

    for (const particle of particles.particles) {

      const {
        mesh,
        basePosition,
        phase,
        orbitSpeed,
        orbitRadius,
        radialAmplitude,
        verticalAmplitude,
        tangentialAmplitude,
        rotationSpeed,
      } = particle;

      const localTime =
        time * orbitSpeed +
        phase;

      /*
       * Radial breathing.
       */
      const radialOffset =
        Math.sin(
          localTime * 1.15
        ) *
        radialAmplitude;

      const direction =
        basePosition
          .clone()
          .normalize();

      /*
       * Tangent vectors generated from the spherical direction.
       *
       * This gives the particle a very small lateral/orbital drift
       * without destroying the spherical shell.
       */
      const tangentA =
        new THREE.Vector3(
          -direction.z,
          0,
          direction.x
        );

      if (tangentA.lengthSq() < 0.0001) {
        tangentA.set(
          1,
          0,
          0
        );
      }

      tangentA.normalize();

      const tangentB =
        new THREE.Vector3()
          .crossVectors(
            direction,
            tangentA
          )
          .normalize();

      const tangentOffset =
        tangentA
          .multiplyScalar(
            Math.sin(localTime) *
            orbitRadius *
            tangentialAmplitude
          )
          .add(
            tangentB.multiplyScalar(
              Math.cos(
                localTime * 0.73
              ) *
              orbitRadius *
              tangentialAmplitude
            )
          );

      /*
       * Slow vertical drift.
       */
      const verticalOffset =
        Math.sin(
          time * 0.18 +
          phase
        ) *
        verticalAmplitude;

      /*
       * Compose the final position.
       */
      mesh.position
        .copy(basePosition)
        .add(
          direction.multiplyScalar(
            radialOffset
          )
        )
        .add(tangentOffset);

      mesh.position.y +=
        verticalOffset;

      /*
       * Independent slow rotation.
       */
      mesh.rotation.x +=
        rotationSpeed.x * delta;

      mesh.rotation.y +=
        rotationSpeed.y * delta;

      mesh.rotation.z +=
        rotationSpeed.z * delta;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0, 0, -2]}
    >
      {particles.particles.map(
        (particle, index) => (
          <primitive
            key={index}
            object={particle.mesh}
          />
        )
      )}
    </group>
  );
}


/* ──────────────────────────────────────────────────────────────────────
 * POST PROCESSING
 * ──────────────────────────────────────────────────────────────────── */

function GhostPostProcessing() {
  const {
    gl,
    scene,
    camera,
    size,
  } = useThree();

  const composerRef =
    useRef<EffectComposer | null>(null);

  useEffect(() => {

    const composer =
      new EffectComposer(gl);

    composer.addPass(
      new RenderPass(
        scene,
        camera
      )
    );

    /*
     * BLOOM
     *
     * Previous:
     *
     *   strength  = 0.22
     *   radius    = 0.55
     *   threshold = 0.18
     *
     * Threshold 0.18 was still allowing too much of the scene to
     * participate in bloom.
     *
     * UnrealBloomPass uses threshold as a luminance gate for what
     * contributes to bloom. We therefore use a more selective
     * threshold and let the geometry remain visible through its
     * ordinary material rather than forcing the whole scene into
     * the bloom buffer.
     */
    const bloomPass =
      new UnrealBloomPass(
        new THREE.Vector2(
          size.width,
          size.height
        ),

        /*
         * Controlled strength.
         */
        0.24,

        /*
         * Medium-tight radius.
         */
        0.42,

        /*
         * Selective luminance threshold.
         */
        0.36
      );

    composer.addPass(
      bloomPass
    );

    /*
     * Analog treatment.
     *
     * Kept because it is part of the existing visual system,
     * but made slightly less intrusive so it does not muddy the
     * new palette.
     */
    const analogShader = {
      uniforms: {
        tDiffuse: {
          value: null,
        },

        uTime: {
          value: 0.0,
        },

        uResolution: {
          value: new THREE.Vector2(
            size.width,
            size.height
          ),
        },

        uAnalogGrain: {
          value: 0.20,
        },

        uAnalogBleeding: {
          value: 0.0,
        },

        uAnalogVSync: {
          value: 0.0,
        },

        uAnalogScanlines: {
          value: 0.28,
        },

        uAnalogVignette: {
          value: 0.48,
        },

        uAnalogJitter: {
          value: 0.0,
        },

        uAnalogIntensity: {
          value: 0.30,
        },

        uLimboMode: {
          value: 0.0,
        },
      },

      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;

          gl_Position =
            projectionMatrix *
            modelViewMatrix *
            vec4(position, 1.0);
        }
      `,

      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uTime;
        uniform vec2 uResolution;

        uniform float uAnalogGrain;
        uniform float uAnalogBleeding;
        uniform float uAnalogVSync;
        uniform float uAnalogScanlines;
        uniform float uAnalogVignette;
        uniform float uAnalogJitter;
        uniform float uAnalogIntensity;
        uniform float uLimboMode;

        varying vec2 vUv;


        float random(vec2 st) {
          return fract(
            sin(
              dot(
                st.xy,
                vec2(
                  12.9898,
                  78.233
                )
              )
            ) *
            43758.5453123
          );
        }


        float random(float x) {
          return fract(
            sin(x) *
            43758.5453123
          );
        }


        float gaussian(
          float z,
          float u,
          float o
        ) {
          return (
            1.0 /
            (
              o *
              sqrt(
                2.0 *
                3.1415
              )
            )
          ) *
          exp(
            -(
              (
                z - u
              ) *
              (
                z - u
              )
            ) /
            (
              2.0 *
              (
                o *
                o
              )
            )
          );
        }


        vec3 grain(
          vec2 uv,
          float time,
          float intensity
        ) {
          float seed =
            dot(
              uv,
              vec2(
                12.9898,
                78.233
              )
            );

          float noise =
            fract(
              sin(seed) *
              43758.5453 +
              time * 2.0
            );

          noise =
            gaussian(
              noise,
              0.0,
              0.25
            );

          return vec3(noise) *
            intensity;
        }


        void main() {

          vec2 uv = vUv;

          float time =
            uTime * 1.8;

          vec2 jitteredUV =
            uv;


          /*
           * Existing glitch timing retained.
           */
          float cycleTime =
            mod(
              uTime,
              2.0
            );

          float glitchActive =
            smoothstep(
              0.0,
              0.05,
              cycleTime
            ) *
            (
              1.0 -
              smoothstep(
                0.2,
                0.35,
                cycleTime
              )
            );


          if (
            uAnalogJitter > 0.01 &&
            glitchActive > 0.01
          ) {

            float ja =
              (
                random(
                  vec2(
                    floor(
                      time * 60.0
                    )
                  )
                ) -
                0.5
              ) *
              0.003 *
              uAnalogJitter *
              uAnalogIntensity *
              glitchActive;

            jitteredUV.x += ja;

            jitteredUV.y +=
              (
                random(
                  vec2(
                    floor(
                      time * 30.0
                    ) +
                    1.0
                  )
                ) -
                0.5
              ) *
              0.001 *
              uAnalogJitter *
              uAnalogIntensity *
              glitchActive;
          }


          if (
            uAnalogVSync > 0.01 &&
            glitchActive > 0.01
          ) {

            float vr =
              sin(
                time * 2.0 +
                uv.y * 100.0
              ) *
              0.02 *
              uAnalogVSync *
              uAnalogIntensity *
              glitchActive;

            float vc =
              step(
                0.95,
                random(
                  vec2(
                    floor(
                      time * 4.0
                    )
                  )
                )
              );

            jitteredUV.y +=
              vr * vc;
          }


          vec4 color =
            texture2D(
              tDiffuse,
              jitteredUV
            );


          /*
           * Color bleeding remains disabled by the uniform,
           * preserving the warm palette.
           */
          if (
            uAnalogBleeding > 0.01 &&
            glitchActive > 0.01
          ) {

            float ba =
              0.012 *
              uAnalogBleeding *
              uAnalogIntensity *
              glitchActive;

            float op =
              time * 1.5 +
              uv.y * 20.0;

            float r =
              texture2D(
                tDiffuse,
                jitteredUV +
                vec2(
                  sin(op) * ba,
                  0.0
                )
              ).r;

            float b =
              texture2D(
                tDiffuse,
                jitteredUV +
                vec2(
                  -sin(op * 1.1) *
                  ba *
                  0.8,
                  0.0
                )
              ).b;

            color =
              vec4(
                r,
                color.g,
                b,
                color.a
              );
          }


          /*
           * Fine film grain.
           */
          if (
            uAnalogGrain > 0.01
          ) {

            vec3 ge =
              grain(
                uv,
                time,
                0.075 *
                uAnalogGrain *
                uAnalogIntensity
              );

            ge *=
              (1.0 - color.rgb);

            color.rgb += ge;
          }


          /*
           * Extremely restrained scanlines.
           */
          if (
            uAnalogScanlines > 0.01
          ) {

            float sf =
              600.0 +
              uAnalogScanlines *
              400.0;

            float sp =
              sin(
                uv.y * sf
              ) *
              0.5 +
              0.5;

            float si =
              0.1 *
              uAnalogScanlines *
              uAnalogIntensity;

            color.rgb *=
              (
                1.0 -
                sp * si
              );

            float hl =
              sin(
                uv.y *
                sf *
                0.1
              ) *
              0.02 *
              uAnalogScanlines *
              uAnalogIntensity;

            color.rgb *=
              (
                1.0 -
                hl
              );
          }


          /*
           * Subtle vignette.
           */
          if (
            uAnalogVignette > 0.01
          ) {

            vec2 vu =
              (uv - 0.5) *
              2.0;

            float v =
              1.0 -
              dot(vu, vu) *
              0.3 *
              uAnalogVignette *
              uAnalogIntensity;

            color.rgb *= v;
          }


          if (
            uLimboMode > 0.5
          ) {

            float g =
              dot(
                color.rgb,
                vec3(
                  0.299,
                  0.587,
                  0.114
                )
              );

            color.rgb =
              vec3(g);
          }


          gl_FragColor =
            color;
        }
      `,
    };

    const analogPass =
      new ShaderPass(
        analogShader
      );

    composer.addPass(
      analogPass
    );

    composerRef.current =
      composer;

    return () => {
      composer.dispose();
    };
  }, [
    gl,
    scene,
    camera,
    size,
  ]);


  /* ────────────────────────────────────────────────────────────────
   * VISIBILITY-BASED RENDERING PAUSE
   * ────────────────────────────────────────────────────────────── */

  const transVisibleRef =
    useRef(false);

  useEffect(() => {

    const section =
      document.getElementById(
        "transition-globe"
      );

    if (!section)
      return;

    const obs =
      new IntersectionObserver(
        (entries) => {
          for (
            const entry of entries
          ) {
            transVisibleRef.current =
              entry.isIntersecting;
          }
        },
        {
          threshold: 0,
        }
      );

    obs.observe(section);

    return () =>
      obs.disconnect();

  }, []);


  useFrame(() => {

    /*
     * Keep the existing performance optimization.
     */
    if (
      !transVisibleRef.current
    ) {
      return;
    }

    const composer =
      composerRef.current;

    if (composer) {

      const passes =
        composer.passes;

      for (
        const pass of passes
      ) {

        if (
          pass instanceof ShaderPass &&
          pass.uniforms &&
          pass.uniforms.uTime
        ) {
          pass.uniforms.uTime.value +=
            0.016;
        }
      }

      composer.render();
    }
  }, 1);


  return null;
}


/* ──────────────────────────────────────────────────────────────────────
 * MAIN SECTION
 * ──────────────────────────────────────────────────────────────────── */

export default function TransitionSection({
  statement,
  accent: _accent,
}: {
  statement: string;
  accent: string;
}) {
  const ref =
    useRef<HTMLDivElement>(null);

  const progressRef =
    useRef(0);

  const geometryRef =
    useRef<THREE.Group | null>(null);


  useEffect(() => {

    const onScroll = () => {

      const el =
        document.getElementById(
          "transition-globe"
        );

      if (el) {

        const rect =
          el.getBoundingClientRect();

        const vh =
          window.innerHeight;

        const p =
          Math.max(
            0,
            Math.min(
              1,
              (
                vh -
                rect.top
              ) /
              (
                vh +
                rect.height
              )
            )
          );

        progressRef.current =
          p;
      }
    };

    window.addEventListener(
      "scroll",
      onScroll,
      {
        passive: true,
      }
    );

    onScroll();

    return () =>
      window.removeEventListener(
        "scroll",
        onScroll
      );

  }, []);


  const {
    scrollYProgress,
  } =
    useScroll({
      target: ref,
      offset: [
        "start end",
        "end start",
      ],
    });


  const textOpacity =
    useTransform(
      scrollYProgress,
      [0, 0.3, 0.7, 1],
      [0, 1, 1, 0]
    );


  const textY =
    useTransform(
      scrollYProgress,
      [0, 1],
      [30, -30]
    );


  return (
    <section
      id="transition-globe"
      ref={ref}
      className="
        section-anchor
        relative
        bg-black
        text-[#e8dfc8]
        min-h-[100vh]
        flex
        items-center
        justify-center
        overflow-hidden
      "
    >

      <div className="absolute inset-0">

        <Canvas
          camera={{
            position: [
              0,
              0,
              8,
            ],
            fov: 50,
          }}

          dpr={[1, 2]}

          gl={{
            antialias: true,
            alpha: true,
            premultipliedAlpha: false,
          }}

          onCreated={({
            gl,
          }) => {

            gl.setClearColor(
              0x000000,
              0
            );

            /*
             * Retained.
             *
             * UnrealBloomPass expects tone mapping to be enabled.
             */
            gl.toneMapping =
              THREE.ACESFilmicToneMapping;

            /*
             * Slightly restrained exposure.
             */
            gl.toneMappingExposure =
              0.84;
          }}
        >

          {/* Atmospheric background */}
          <VolumetricFog
            geometryRef={
              geometryRef
            }
          />


          {/* ─────────────────────────────────────────────────────
           * NEUTRAL FILL LIGHT
           *
           * These lights are deliberately restrained.
           * They establish spatial separation rather than trying
           * to manufacture the glow.
           * ─────────────────────────────────────────────────── */}

          <ambientLight
            intensity={0.075}
            color={0xffffff}
          />

          <directionalLight
            position={[
              0,
              4,
              4,
            ]}
            intensity={0.32}
            color={0xfff4df}
          />

          <directionalLight
            position={[
              0,
              -4,
              4,
            ]}
            intensity={0.18}
            color={0xffffff}
          />


          {/* Three existing geometric layers */}
          <GoldGeometryWithRef
            progressRef={
              progressRef
            }
            geometryRef={
              geometryRef
            }
          />


          {/* Tiny atmospheric dust */}
          <AmbientParticles
            count={42}
          />


          {/* Floating tetrahedron field */}
          <RotatingParticles
            count={140}
          />


          {/* Bloom + analog treatment */}
          <GhostPostProcessing />

        </Canvas>

      </div>


      {/* Existing text overlay */}
      <motion.div
        style={{
          y: textY,
          opacity: textOpacity,
        }}
        className="
          relative
          z-10
          max-w-[900px]
          px-6
          text-center
        "
      >
        <p
          className="
            display
            italic
            font-light
            text-4xl
            sm:text-5xl
            lg:text-6xl
            leading-[1.15]
            tracking-[-0.02em]
            text-[#e8dfc8]
          "
        >
          {statement}
        </p>
      </motion.div>


      {/* Existing bottom transition */}
      <div
        className="
          absolute
          bottom-0
          left-0
          right-0
          h-32
          pointer-events-none
          z-20
        "
        style={{
          background:
            "linear-gradient(to top, #14100c, transparent)",
        }}
      />

    </section>
  );
}


/* ──────────────────────────────────────────────────────────────────────
 * THREE-LAYER WIREFRAME GEOMETRY
 * ──────────────────────────────────────────────────────────────────── */

function GoldGeometryWithRef({
  progressRef,
  geometryRef,
}: {
  progressRef: React.MutableRefObject<number>;
  geometryRef: React.MutableRefObject<THREE.Group | null>;
}) {

  const groupRef =
    useRef<THREE.Group>(null);

  /*
   * Each actual geometry layer gets its own group.
   *
   * This allows the primary line and its subtle halo to rotate
   * together as one object.
   */
  const innerLayerRef =
    useRef<THREE.Group>(null);

  const midLayerRef =
    useRef<THREE.Group>(null);

  const outerLayerRef =
    useRef<THREE.Group>(null);

  const pointer =
    useRef({
      x: 0,
      y: 0,
    });


  /* ──────────────────────────────────────────────────────────────
   * GEOMETRY
   *
   * THESE NUMBERS ARE PRESERVED.
   *
   * Do not change the three geometric shapes merely to solve the
   * lighting problem.
   * ─────────────────────────────────────────────────────────── */

  const geometries =
    useMemo(() => {

      const ico1 =
        new THREE.IcosahedronGeometry(
          2.5,
          1
        );

      const ico2 =
        new THREE.IcosahedronGeometry(
          3.5,
          0
        );

      const ico3 =
        new THREE.IcosahedronGeometry(
          1.8,
          3
        );


      const edgesInner =
        new THREE.EdgesGeometry(
          ico3
        );

      const edgesMid =
        new THREE.EdgesGeometry(
          ico2
        );

      const edgesOuter =
        new THREE.EdgesGeometry(
          ico1
        );


      /*
       * LineSegmentsGeometry is intentionally retained.
       * It is the correct companion to LineSegments2/LineMaterial
       * for controllable screen-space line widths.
       */

      const innerLineGeo =
        new LineSegmentsGeometry();

      innerLineGeo.setPositions(
        edgesInner.attributes
          .position
          .array as Float32Array
      );


      const midLineGeo =
        new LineSegmentsGeometry();

      midLineGeo.setPositions(
        edgesMid.attributes
          .position
          .array as Float32Array
      );


      const outerLineGeo =
        new LineSegmentsGeometry();

      outerLineGeo.setPositions(
        edgesOuter.attributes
          .position
          .array as Float32Array
      );


      return {
        outer: outerLineGeo,
        mid: midLineGeo,
        inner: innerLineGeo,
      };

    }, []);


  /* ──────────────────────────────────────────────────────────────
   * ANIMATION
   * ─────────────────────────────────────────────────────────── */

  useFrame(
    (state, delta) => {

      if (!groupRef.current)
        return;


      const p =
        progressRef.current;


      /*
       * Existing scroll entrance preserved.
       */

      const entryProgress =
        THREE.MathUtils.smoothstep(
          p,
          0,
          0.4
        );

      groupRef.current.position.y =
        THREE.MathUtils.lerp(
          6,
          0,
          entryProgress
        );


      const scaleProgress =
        THREE.MathUtils.smoothstep(
          p,
          0.1,
          0.5
        );

      groupRef.current.scale.setScalar(
        THREE.MathUtils.lerp(
          0.3,
          1.0,
          scaleProgress
        )
      );


      /*
       * EXISTING THREE-LAYER MOTION PRESERVED.
       *
       * Inner is fastest.
       * Middle opposes it.
       * Outer is slowest.
       */

      if (
        innerLayerRef.current
      ) {

        innerLayerRef.current.rotation.y +=
          delta * 0.30;

        innerLayerRef.current.rotation.x +=
          delta * 0.15;
      }


      if (
        midLayerRef.current
      ) {

        midLayerRef.current.rotation.y -=
          delta * 0.20;

        midLayerRef.current.rotation.z +=
          delta * 0.10;
      }


      if (
        outerLayerRef.current
      ) {

        outerLayerRef.current.rotation.y +=
          delta * 0.10;

        outerLayerRef.current.rotation.x -=
          delta * 0.08;
      }


      /*
       * Mouse response preserved.
       */
      pointer.current.x +=
        (
          state.pointer.x -
          pointer.current.x
        ) *
        0.04;

      pointer.current.y +=
        (
          state.pointer.y -
          pointer.current.y
        ) *
        0.04;


      groupRef.current.rotation.x =
        pointer.current.y *
        0.2;

      groupRef.current.rotation.z =
        pointer.current.x *
        0.1;


      geometryRef.current =
        groupRef.current;
    }
  );


  /* ──────────────────────────────────────────────────────────────
   * PRIMARY LINE MATERIALS
   * ─────────────────────────────────────────────────────────── */

  const innerLineMat =
    useMemo(() => {

      const mat =
        new LineMaterial({
          color:
            PALETTE.inner,

          linewidth:
            1.45,

          transparent:
            true,

          opacity:
            0.72,

          worldUnits:
            false,

          alphaToCoverage:
            true,
        });

      mat.resolution.set(
        window.innerWidth,
        window.innerHeight
      );

      return mat;

    }, []);


  const midLineMat =
    useMemo(() => {

      const mat =
        new LineMaterial({
          color:
            PALETTE.middle,

          linewidth:
            1.70,

          transparent:
            true,

          opacity:
            0.63,

          worldUnits:
            false,

          alphaToCoverage:
            true,
        });

      mat.resolution.set(
        window.innerWidth,
        window.innerHeight
      );

      return mat;

    }, []);


  const outerLineMat =
    useMemo(() => {

      const mat =
        new LineMaterial({
          color:
            PALETTE.outer,

          linewidth:
            1.65,

          transparent:
            true,

          opacity:
            0.31,

          worldUnits:
            false,

          alphaToCoverage:
            true,
        });

      mat.resolution.set(
        window.innerWidth,
        window.innerHeight
      );

      return mat;

    }, []);


  /* ──────────────────────────────────────────────────────────────
   * GLOW / HALO MATERIALS
   *
   * These are NOT simply brighter copies.
   *
   * They are:
   *
   *   - wider
   *   - transparent
   *   - same hue family
   *   - rendered behind the sharp line
   *
   * Their purpose is to provide a soft source for bloom and a subtle
   * atmospheric halo.
   * ─────────────────────────────────────────────────────────── */

  const innerGlowMat =
    useMemo(() => {

      const mat =
        new LineMaterial({
          color:
            PALETTE.innerGlow,

          linewidth:
            4.2,

          transparent:
            true,

          opacity:
            0.12,

          worldUnits:
            false,

          depthWrite:
            false,

          alphaToCoverage:
            true,
        });

      mat.resolution.set(
        window.innerWidth,
        window.innerHeight
      );

      return mat;

    }, []);


  const midGlowMat =
    useMemo(() => {

      const mat =
        new LineMaterial({
          color:
            PALETTE.middleGlow,

          linewidth:
            4.6,

          transparent:
            true,

          opacity:
            0.065,

          worldUnits:
            false,

          depthWrite:
            false,

          alphaToCoverage:
            true,
        });

      mat.resolution.set(
        window.innerWidth,
        window.innerHeight
      );

      return mat;

    }, []);


  const outerGlowMat =
    useMemo(() => {

      const mat =
        new LineMaterial({
          color:
            PALETTE.outerGlow,

          linewidth:
            4.0,

          transparent:
            true,

          opacity:
            0.035,

          worldUnits:
            false,

          depthWrite:
            false,

          alphaToCoverage:
            true,
        });

      mat.resolution.set(
        window.innerWidth,
        window.innerHeight
      );

      return mat;

    }, []);


  /* ──────────────────────────────────────────────────────────────
   * UPDATE LINE RESOLUTION
   * ─────────────────────────────────────────────────────────── */

  useEffect(() => {

    const onResize = () => {

      const width =
        window.innerWidth;

      const height =
        window.innerHeight;


      innerLineMat.resolution.set(
        width,
        height
      );

      midLineMat.resolution.set(
        width,
        height
      );

      outerLineMat.resolution.set(
        width,
        height
      );


      innerGlowMat.resolution.set(
        width,
        height
      );

      midGlowMat.resolution.set(
        width,
        height
      );

      outerGlowMat.resolution.set(
        width,
        height
      );
    };


    window.addEventListener(
      "resize",
      onResize
    );

    return () =>
      window.removeEventListener(
        "resize",
        onResize
      );

  }, [
    innerLineMat,
    midLineMat,
    outerLineMat,
    innerGlowMat,
    midGlowMat,
    outerGlowMat,
  ]);


  /* ──────────────────────────────────────────────────────────────
   * CREATE PRIMARY LINES
   * ─────────────────────────────────────────────────────────── */

  const innerLines =
    useMemo(
      () =>
        new LineSegments2(
          geometries.inner,
          innerLineMat
        ),
      [
        geometries.inner,
        innerLineMat,
      ]
    );


  const midLines =
    useMemo(
      () =>
        new LineSegments2(
          geometries.mid,
          midLineMat
        ),
      [
        geometries.mid,
        midLineMat,
      ]
    );


  const outerLines =
    useMemo(
      () =>
        new LineSegments2(
          geometries.outer,
          outerLineMat
        ),
      [
        geometries.outer,
        outerLineMat,
      ]
    );


  /* ──────────────────────────────────────────────────────────────
   * CREATE HALO LINES
   * ─────────────────────────────────────────────────────────── */

  const innerGlowLines =
    useMemo(
      () =>
        new LineSegments2(
          geometries.inner,
          innerGlowMat
        ),
      [
        geometries.inner,
        innerGlowMat,
      ]
    );


  const midGlowLines =
    useMemo(
      () =>
        new LineSegments2(
          geometries.mid,
          midGlowMat
        ),
      [
        geometries.mid,
        midGlowMat,
      ]
    );


  const outerGlowLines =
    useMemo(
      () =>
        new LineSegments2(
          geometries.outer,
          outerGlowMat
        ),
      [
        geometries.outer,
        outerGlowMat,
      ]
    );


  /*
   * Render ordering:
   *
   * glow first
   * primary line second
   *
   * This keeps the sharp structure visually dominant.
   */

  outerGlowLines.renderOrder = 1;
  midGlowLines.renderOrder = 2;
  innerGlowLines.renderOrder = 3;

  outerLines.renderOrder = 4;
  midLines.renderOrder = 5;
  innerLines.renderOrder = 6;


  /* ──────────────────────────────────────────────────────────────
   * LIGHTING
   *
   * Much weaker than before.
   *
   * The lines themselves provide the visual identity.
   * The lights simply prevent the surrounding scene from feeling
   * completely dead.
   * ─────────────────────────────────────────────────────────── */

  return (
    <group ref={groupRef}>

      {/* OUTER */}
      <group ref={outerLayerRef}>
        <primitive
          object={outerGlowLines}
        />

        <primitive
          object={outerLines}
        />
      </group>


      {/* MIDDLE */}
      <group ref={midLayerRef}>
        <primitive
          object={midGlowLines}
        />

        <primitive
          object={midLines}
        />
      </group>


      {/* INNER */}
      <group ref={innerLayerRef}>
        <primitive
          object={innerGlowLines}
        />

        <primitive
          object={innerLines}
        />
      </group>


      {/*
       * Keep these point lights very restrained.
       *
       * They no longer carry the responsibility for "glow".
       */}
      <pointLight
        color="#D8C7A8"
        intensity={0.30}
        distance={5}
      />

      <pointLight
        color="#96704A"
        intensity={0.18}
        distance={8}
      />

      <pointLight
        color="#4A2528"
        intensity={0.08}
        distance={12}
      />

    </group>
  );
}