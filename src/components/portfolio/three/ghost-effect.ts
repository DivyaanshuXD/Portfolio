/**
 * Spectral Ghost Effect — EXACT copy from CodePen/GitHub gist.
 * Only imports changed from esm.sh URLs to npm packages.
 * All effects preserved: analog decay, atmosphere, fireflies, particles, bloom, eyes, TweakPane GUI.
 */

import * as THREE from "three";
import { Pane } from "tweakpane";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

export function initGhostEffect(container: HTMLElement) {
  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 20;

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance", alpha: true, premultipliedAlpha: false, stencil: false, depth: true, preserveDrawingBuffer: false });
  // Cap pixel ratio at 2x — on 3x/4x displays, the extra pixels are
  // imperceptible but cost 9-16x more GPU work per frame.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = "0";
  renderer.domElement.style.left = "0";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.pointerEvents = "auto";
  renderer.domElement.style.background = "transparent";

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(new THREE.Vector2(container.clientWidth, container.clientHeight), 0.3, 1.25, 0.0);
  composer.addPass(bloomPass);

  // Analog Decay Shader
  const analogDecayShader = {
    uniforms: { tDiffuse: { value: null }, uTime: { value: 0.0 }, uResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) }, uAnalogGrain: { value: 0.4 }, uAnalogBleeding: { value: 1.0 }, uAnalogVSync: { value: 1.0 }, uAnalogScanlines: { value: 1.0 }, uAnalogVignette: { value: 1.0 }, uAnalogJitter: { value: 0.4 }, uAnalogIntensity: { value: 0.6 }, uLimboMode: { value: 0.0 } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime; uniform vec2 uResolution; uniform float uAnalogGrain; uniform float uAnalogBleeding; uniform float uAnalogVSync; uniform float uAnalogScanlines; uniform float uAnalogVignette; uniform float uAnalogJitter; uniform float uAnalogIntensity; uniform float uLimboMode; varying vec2 vUv; float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123); } float random(float x) { return fract(sin(x) * 43758.5453123); } float gaussian(float z, float u, float o) { return (1.0 / (o * sqrt(2.0 * 3.1415))) * exp(-(((z - u) * (z - u)) / (2.0 * (o * o)))); } vec3 grain(vec2 uv, float time, float intensity) { float seed = dot(uv, vec2(12.9898, 78.233)); float noise = fract(sin(seed) * 43758.5453 + time * 2.0); noise = gaussian(noise, 0.0, 0.5 * 0.5); return vec3(noise) * intensity; } void main() { vec2 uv = vUv; float time = uTime * 1.8; vec2 jitteredUV = uv; if (uAnalogJitter > 0.01) { float jitterAmount = (random(vec2(floor(time * 60.0))) - 0.5) * 0.003 * uAnalogJitter * uAnalogIntensity; jitteredUV.x += jitterAmount; jitteredUV.y += (random(vec2(floor(time * 30.0) + 1.0)) - 0.5) * 0.001 * uAnalogJitter * uAnalogIntensity; } if (uAnalogVSync > 0.01) { float vsyncRoll = sin(time * 2.0 + uv.y * 100.0) * 0.02 * uAnalogVSync * uAnalogIntensity; float vsyncChance = step(0.95, random(vec2(floor(time * 4.0)))); jitteredUV.y += vsyncRoll * vsyncChance; } vec4 color = texture2D(tDiffuse, jitteredUV); if (uAnalogBleeding > 0.01) { float bleedAmount = 0.012 * uAnalogBleeding * uAnalogIntensity; float offsetPhase = time * 1.5 + uv.y * 20.0; vec2 redOffset = vec2(sin(offsetPhase) * bleedAmount, 0.0); vec2 blueOffset = vec2(-sin(offsetPhase * 1.1) * bleedAmount * 0.8, 0.0); float r = texture2D(tDiffuse, jitteredUV + redOffset).r; float g = texture2D(tDiffuse, jitteredUV).g; float b = texture2D(tDiffuse, jitteredUV + blueOffset).b; color = vec4(r, g, b, color.a); } if (uAnalogGrain > 0.01) { vec3 grainEffect = grain(uv, time, 0.075 * uAnalogGrain * uAnalogIntensity); grainEffect *= (1.0 - color.rgb); color.rgb += grainEffect; } if (uAnalogScanlines > 0.01) { float scanlineFreq = 600.0 + uAnalogScanlines * 400.0; float scanlinePattern = sin(uv.y * scanlineFreq) * 0.5 + 0.5; float scanlineIntensity = 0.1 * uAnalogScanlines * uAnalogIntensity; color.rgb *= (1.0 - scanlinePattern * scanlineIntensity); float horizontalLines = sin(uv.y * scanlineFreq * 0.1) * 0.02 * uAnalogScanlines * uAnalogIntensity; color.rgb *= (1.0 - horizontalLines); } if (uAnalogVignette > 0.01) { vec2 vignetteUV = (uv - 0.5) * 2.0; float vignette = 1.0 - dot(vignetteUV, vignetteUV) * 0.3 * uAnalogVignette * uAnalogIntensity; color.rgb *= vignette; } if (uLimboMode > 0.5) { float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114)); color.rgb = vec3(gray); } gl_FragColor = color; }`
  };

  const analogDecayPass = new ShaderPass(analogDecayShader);
  composer.addPass(analogDecayPass);
  composer.addPass(new OutputPass());

  const params = {
    bodyColor: 0x0f2027, glowColor: "red", eyeGlowColor: "green", ghostOpacity: 0.88, ghostScale: 2.4,
    emissiveIntensity: 5.8, pulseSpeed: 1.6, pulseIntensity: 0.6,
    eyeGlowIntensity: 4.5, eyeGlowDecay: 0.95, eyeGlowResponse: 0.31,
    rimLightIntensity: 1.8, followSpeed: 0.075, wobbleAmount: 0.35, floatSpeed: 1.6, movementThreshold: 0.07,
    particleCount: 250, particleDecayRate: 0.005, particleColor: "red", createParticlesOnlyWhenMoving: true, particleCreationRate: 5,
    revealRadius: 5, fadeStrength: 0.1, baseOpacity: 0.0, revealOpacity: 0.0,
    fireflyGlowIntensity: 2.6, fireflySpeed: 0.04,
    analogIntensity: 0.6, analogGrain: 0.4, analogBleeding: 1.0, analogVSync: 1.0, analogScanlines: 1.0, analogVignette: 1.0, analogJitter: 0.4, limboMode: false
  };

  const fluorescentColors: Record<string, number> = { cyan: 0x00ffff, lime: 0x00ff00, magenta: 0xff00ff, yellow: 0xffff00, orange: 0xff4500, pink: 0xff1493, purple: 0x9400d3, blue: 0x0080ff, green: 0x00ff80, red: 0xff0040, teal: 0x00ffaa, violet: 0x8a2be2 };

  // Atmosphere
  const atmosphereMaterial = new THREE.ShaderMaterial({
    uniforms: { ghostPosition: { value: new THREE.Vector3(0, 0, 0) }, revealRadius: { value: params.revealRadius }, fadeStrength: { value: params.fadeStrength }, baseOpacity: { value: params.baseOpacity }, revealOpacity: { value: params.revealOpacity }, time: { value: 0 } },
    vertexShader: `varying vec2 vUv; varying vec3 vWorldPosition; void main() { vUv = uv; vec4 worldPos = modelMatrix * vec4(position, 1.0); vWorldPosition = worldPos.xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec3 ghostPosition; uniform float revealRadius; uniform float fadeStrength; uniform float baseOpacity; uniform float revealOpacity; uniform float time; varying vec2 vUv; varying vec3 vWorldPosition; void main() { float dist = distance(vWorldPosition.xy, ghostPosition.xy); float dynamicRadius = revealRadius + sin(time * 2.0) * 5.0; float reveal = smoothstep(dynamicRadius * 0.2, dynamicRadius, dist); reveal = pow(reveal, fadeStrength); float opacity = mix(revealOpacity, baseOpacity, reveal); gl_FragColor = vec4(0.001, 0.001, 0.002, opacity); }`,
    transparent: true, depthWrite: false
  });
  const atmosphere = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), atmosphereMaterial);
  atmosphere.position.z = -50; atmosphere.renderOrder = -100; scene.add(atmosphere);

  scene.add(new THREE.AmbientLight(0x0a0a2e, 0.08));

  const ghostGroup = new THREE.Group();
  scene.add(ghostGroup);

  const ghostGeometry = new THREE.SphereGeometry(2, 40, 40);
  const posArr = ghostGeometry.getAttribute("position").array;
  for (let i = 0; i < posArr.length; i += 3) {
    if (posArr[i + 1] < -0.2) { const x = posArr[i], z = posArr[i + 2]; posArr[i + 1] = -2.0 + Math.sin(x * 5) * 0.35 + Math.cos(z * 4) * 0.25 + Math.sin((x + z) * 3) * 0.15; }
  }
  ghostGeometry.computeVertexNormals();

  const ghostMaterial = new THREE.MeshStandardMaterial({ color: params.bodyColor, transparent: true, opacity: params.ghostOpacity, emissive: fluorescentColors[params.glowColor], emissiveIntensity: params.emissiveIntensity, roughness: 0.02, metalness: 0.0, side: THREE.DoubleSide, alphaTest: 0.1 });
  const ghostBody = new THREE.Mesh(ghostGeometry, ghostMaterial);
  ghostGroup.add(ghostBody);

  const rimLight1 = new THREE.DirectionalLight(0x4a90e2, params.rimLightIntensity);
  rimLight1.position.set(-8, 6, -4); scene.add(rimLight1);
  const rimLight2 = new THREE.DirectionalLight(0x50e3c2, params.rimLightIntensity * 0.7);
  rimLight2.position.set(8, -4, -6); scene.add(rimLight2);

  // Eyes
  function createEyes() {
    const eyeGroup = new THREE.Group(); ghostGroup.add(eyeGroup);
    const socketGeo = new THREE.SphereGeometry(0.45, 16, 16), socketMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const ls = new THREE.Mesh(socketGeo, socketMat); ls.position.set(-0.7, 0.6, 1.9); ls.scale.set(1.1, 1.0, 0.6); eyeGroup.add(ls);
    const rs = new THREE.Mesh(socketGeo, socketMat); rs.position.set(0.7, 0.6, 1.9); rs.scale.set(1.1, 1.0, 0.6); eyeGroup.add(rs);
    const eyeGeo = new THREE.SphereGeometry(0.3, 12, 12);
    const lMat = new THREE.MeshBasicMaterial({ color: fluorescentColors[params.eyeGlowColor], transparent: true, opacity: 0 });
    const le = new THREE.Mesh(eyeGeo, lMat); le.position.set(-0.7, 0.6, 2.0); eyeGroup.add(le);
    const rMat = new THREE.MeshBasicMaterial({ color: fluorescentColors[params.eyeGlowColor], transparent: true, opacity: 0 });
    const re = new THREE.Mesh(eyeGeo, rMat); re.position.set(0.7, 0.6, 2.0); eyeGroup.add(re);
    const ogGeo = new THREE.SphereGeometry(0.525, 12, 12);
    const logMat = new THREE.MeshBasicMaterial({ color: fluorescentColors[params.eyeGlowColor], transparent: true, opacity: 0, side: THREE.BackSide });
    const log = new THREE.Mesh(ogGeo, logMat); log.position.set(-0.7, 0.6, 1.95); eyeGroup.add(log);
    const rogMat = new THREE.MeshBasicMaterial({ color: fluorescentColors[params.eyeGlowColor], transparent: true, opacity: 0, side: THREE.BackSide });
    const rog = new THREE.Mesh(ogGeo, rogMat); rog.position.set(0.7, 0.6, 1.95); eyeGroup.add(rog);
    return { leftEye: le, rightEye: re, leftEyeMaterial: lMat, rightEyeMaterial: rMat, leftOuterGlow: log, rightOuterGlow: rog, leftOuterGlowMaterial: logMat, rightOuterGlowMaterial: rogMat };
  }
  const eyes = createEyes();

  // Fireflies
  const fireflies: THREE.Mesh[] = [];
  const fireflyGroup = new THREE.Group(); scene.add(fireflyGroup);
  for (let i = 0; i < 20; i++) {
    const ff = new THREE.Mesh(new THREE.SphereGeometry(0.02, 2, 2), new THREE.MeshBasicMaterial({ color: 0xffff44, transparent: true, opacity: 0.9 }));
    ff.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 20);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffff88, transparent: true, opacity: 0.4, side: THREE.BackSide }));
    ff.add(glow);
    ff.add(new THREE.PointLight(0xffff44, 0.8, 3, 2));
    ff.userData = { velocity: new THREE.Vector3((Math.random() - 0.5) * params.fireflySpeed, (Math.random() - 0.5) * params.fireflySpeed, (Math.random() - 0.5) * params.fireflySpeed), phase: Math.random() * Math.PI * 2, pulseSpeed: 2 + Math.random() * 3, glowMaterial: glow.material, fireflyMaterial: ff.material, light: ff.children[1] };
    fireflyGroup.add(ff); fireflies.push(ff);
  }

  // Particles
  const particles: THREE.Mesh[] = [];
  const particleGroup = new THREE.Group(); scene.add(particleGroup);
  const particlePool: THREE.Mesh[] = [];
  const particleGeometries = [new THREE.SphereGeometry(0.05, 6, 6), new THREE.TetrahedronGeometry(0.04, 0), new THREE.OctahedronGeometry(0.045, 0)];
  const particleBaseMaterial = new THREE.MeshBasicMaterial({ color: fluorescentColors[params.particleColor], transparent: true, opacity: 0, alphaTest: 0.1 });
  for (let i = 0; i < 100; i++) { const p = new THREE.Mesh(particleGeometries[Math.floor(Math.random() * 3)], particleBaseMaterial.clone()); p.visible = false; particleGroup.add(p); particlePool.push(p); }
  function createParticle() {
    let p: THREE.Mesh;
    if (particlePool.length > 0) { p = particlePool.pop()!; p.visible = true; }
    else if (particles.length < params.particleCount) { p = new THREE.Mesh(particleGeometries[Math.floor(Math.random() * 3)], particleBaseMaterial.clone()); particleGroup.add(p); }
    else return null;
    const c = new THREE.Color(fluorescentColors[params.particleColor]); c.offsetHSL(Math.random() * 0.1 - 0.05, 0, 0); p.material.color = c;
    p.position.copy(ghostGroup.position); p.position.z -= 0.8 + Math.random() * 0.6;
    p.position.x += (Math.random() - 0.5) * 3.5; p.position.y += (Math.random() - 0.5) * 3.5 - 0.8;
    const sv = 0.6 + Math.random() * 0.7; p.scale.set(sv, sv, sv);
    p.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
    p.userData = { life: 1.0, decay: Math.random() * 0.003 + params.particleDecayRate, rotationSpeed: { x: (Math.random() - 0.5) * 0.015, y: (Math.random() - 0.5) * 0.015, z: (Math.random() - 0.5) * 0.015 }, velocity: { x: (Math.random() - 0.5) * 0.012, y: (Math.random() - 0.5) * 0.012 - 0.002, z: (Math.random() - 0.5) * 0.012 - 0.006 } };
    p.material.opacity = Math.random() * 0.9; particles.push(p); return p;
  }

  // TweakPane GUI — hidden by default, opened via the floating ghost icon.
  // IMPORTANT: created with `expanded: true` so the title bar AND folder
  // contents are visible immediately. When the icon is clicked, the panel
  // slides in already expanded — no second click needed.
  // Mobile fix: hidden by default (display:none) and only shown when
  // window.innerWidth >= 768. Resize listener re-checks so it doesn't
  // linger on resize from desktop to mobile.
  const pane = new Pane({ title: "Spectral Ghost", expanded: true });
  const pe = pane.element;
  pe.style.cssText = "position:fixed;top:80px;right:20px;z-index:10000;background:rgba(10,9,7,0.94);border-radius:14px;padding:15px;backdrop-filter:blur(16px);border:1px solid rgba(184,134,42,0.4);pointer-events:auto;transition:opacity 0.35s cubic-bezier(0.16,1,0.3,1),transform 0.35s cubic-bezier(0.16,1,0.3,1);opacity:0;transform:translateX(16px) scale(0.96);display:none;max-height:75vh;overflow-y:auto;max-width:280px;box-shadow:0 16px 48px rgba(0,0,0,0.45);";

  let paneOpen = false;
  // Read the loader-done flag synchronously — if the loader has already wiped
  // away (e.g. GhostEffect mounted after the loader-done event fired), then
  // paneAllowed should start true so the icon click works immediately.
  const w = window as unknown as { __loaderDone?: boolean };
  let paneAllowed = !!w.__loaderDone;

  const setPaneVisible = (open: boolean) => {
    paneOpen = open;
    // Mobile check — never show on screens < 768px wide
    if (window.innerWidth < 768) { pe.style.display = "none"; return; }
    if (!paneAllowed) { pe.style.display = "none"; return; }
    if (open) {
      // Make sure the pane root is expanded when shown — re-expand in case
      // the user collapsed it before closing.
      try { pane.expanded = true; } catch { /* ignore */ }
      pe.style.display = "block";
      // Force reflow so the transition runs
      void pe.offsetWidth;
      pe.style.opacity = "1";
      pe.style.transform = "translateX(0) scale(1)";
      pe.style.pointerEvents = "auto";
    } else {
      pe.style.opacity = "0";
      pe.style.transform = "translateX(16px) scale(0.96)";
      pe.style.pointerEvents = "none";
      // Hide after the transition ends so it doesn't intercept clicks
      window.setTimeout(() => { if (!paneOpen) pe.style.display = "none"; }, 360);
    }
  };

  // Listen for toggle requests from the floating ghost icon
  const onTogglePane = () => setPaneVisible(!paneOpen);
  window.addEventListener("toggle-ghost-panel", onTogglePane);

  // Listen for loader-done — only allow the pane to appear after the loader is gone
  const onLoaderDone = () => {
    paneAllowed = true;
    window.dispatchEvent(new CustomEvent("ghost-pane-ready"));
  };
  // If loaderDone hasn't fired yet, listen for it. If it already has, we've
  // already set paneAllowed = true above.
  if (!paneAllowed) {
    window.addEventListener("loader-done", onLoaderDone);
  }

  // Resize listener — if the user shrinks the window below 768px while
  // the panel is open, hide it immediately (mobile fix).
  const onPaneResize = () => {
    if (window.innerWidth < 768) {
      pe.style.display = "none";
      pe.style.opacity = "0";
      pe.style.pointerEvents = "none";
    }
  };
  window.addEventListener("resize", onPaneResize);

  const colorOpts = Object.fromEntries(Object.keys(fluorescentColors).map(k => [k.charAt(0).toUpperCase() + k.slice(1), k]));

  // ─── Settings persistence via sessionStorage ────────────────────────
  // Saves the user's TweakPane settings so a normal refresh (F5) keeps
  // them. A hard refresh (Ctrl+Shift+R) clears them because the browser
  // bypasses the cache (transferSize > 0 on reload), which we detect and
  // use to clear the sessionStorage entry.
  const SETTINGS_KEY = "spectral-ghost-settings";
  const SAVEABLE_KEYS = ["glowColor", "emissiveIntensity", "baseOpacity"];

  // On load: detect hard refresh and clear if so
  const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  if (navEntry && navEntry.type === "reload" && navEntry.transferSize > 0) {
    // Hard refresh — browser bypassed cache. Clear saved settings.
    sessionStorage.removeItem(SETTINGS_KEY);
  }

  // Load saved settings and apply to params + materials
  try {
    const saved = sessionStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const savedParams = JSON.parse(saved);
      for (const key of SAVEABLE_KEYS) {
        if (key in savedParams) {
          (params as Record<string, unknown>)[key] = savedParams[key];
        }
      }
      // Apply loaded values to materials immediately
      if (savedParams.glowColor) {
        ghostMaterial.emissive.set(fluorescentColors[savedParams.glowColor as string]);
        particleBaseMaterial.color.set(fluorescentColors[savedParams.particleColor ?? savedParams.glowColor]);
      }
      if (savedParams.emissiveIntensity !== undefined) {
        ghostMaterial.emissiveIntensity = savedParams.emissiveIntensity;
      }
      if (savedParams.baseOpacity !== undefined) {
        atmosphereMaterial.uniforms.baseOpacity.value = savedParams.baseOpacity;
      }
    }
  } catch { /* ignore parse errors */ }

  // Debounced save function — saves to sessionStorage after 500ms of no changes
  let saveTimer: number | undefined;
  const saveSettings = () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      const toSave: Record<string, unknown> = {};
      for (const key of SAVEABLE_KEYS) {
        toSave[key] = (params as Record<string, unknown>)[key];
      }
      // Also save particleColor so it restores with the glow color
      toSave.particleColor = params.particleColor;
      try {
        sessionStorage.setItem(SETTINGS_KEY, JSON.stringify(toSave));
      } catch { /* ignore quota errors */ }
    }, 500);
  };

  // Only show Glow Effects + Base Darkness folders in the TweakPane (per
  // user request — they explicitly asked to limit the panel to these two
  // controls + the followSpeed=0.200 / baseDarkness=0.0 scroll-driven setup).
  const gf = pane.addFolder({ title: "Glow Effects", expanded: true });
  gf.addBinding(params, "glowColor", { label: "Glow Color", options: colorOpts }).on("change", (e: { value: string }) => {
    ghostMaterial.emissive.set(fluorescentColors[e.value]);
    params.particleColor = e.value; // sync particle color with glow color
    particleBaseMaterial.color.set(fluorescentColors[e.value]);
    saveSettings();
  });
  gf.addBinding(params, "emissiveIntensity", { label: "Ghost Glow", min: 1.0, max: 10.0, step: 0.1 }).on("change", (e: { value: number }) => {
    ghostMaterial.emissiveIntensity = e.value;
    saveSettings();
  });

  const rf = pane.addFolder({ title: "Base Darkness", expanded: true });
  rf.addBinding(params, "baseOpacity", { label: "Base Darkness", min: 0, max: 1, step: 0.05 }).on("change", (e: { value: number }) => {
    atmosphereMaterial.uniforms.baseOpacity.value = e.value;
    saveSettings();
  });

  // Base darkness is 0.0 from the start — no scroll-driven transition.
  // The user explicitly wants it at 0.0 always.

  // Resize
  let resizeTimeout: number | undefined;
  const onResize = () => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => {
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h); composer.setSize(w, h); bloomPass.setSize(w, h);
      analogDecayPass.uniforms.uResolution.value.set(w, h);
    }, 250);
  };
  window.addEventListener("resize", onResize);

  // Mouse tracking
  const mouse = new THREE.Vector2(), prevMouse = new THREE.Vector2(), mouseSpeed = new THREE.Vector2();
  let lastMouseUpdate = 0, isMouseMoving = false, mouseMovementTimer: number | undefined;
  const onMouseMove = (e: MouseEvent) => {
    const rect = container.getBoundingClientRect(), now = performance.now();
    if (now - lastMouseUpdate > 16) {
      prevMouse.x = mouse.x; prevMouse.y = mouse.y;
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseSpeed.x = mouse.x - prevMouse.x; mouseSpeed.y = mouse.y - prevMouse.y;
      isMouseMoving = true;
      if (mouseMovementTimer) clearTimeout(mouseMovementTimer);
      mouseMovementTimer = window.setTimeout(() => { isMouseMoving = false; }, 80);
      lastMouseUpdate = now;
    }
  };
  window.addEventListener("mousemove", onMouseMove);

  // ─── Visibility-based rendering pause ──────────────────────────────
  // When the hero section is not in view, skip the rAF render loop to
  // save GPU/CPU cycles. This eliminates the micro-lags caused by all
  // three Three.js canvases running simultaneously.
  let heroVisible = true;
  const heroEl = document.getElementById("hero");
  if (heroEl) {
    const heroObs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          heroVisible = entry.isIntersecting;
        }
      },
      { threshold: 0 }
    );
    heroObs.observe(heroEl);
  }

  // Animation
  let lastParticleTime = 0, time = 0, currentMovement = 0, lastFrameTime = 0, isInitialized = false, frameCount = 0, animId: number;

  function forceInitialRender() {
    for (let i = 0; i < 3; i++) composer.render();
    for (let i = 0; i < 10; i++) createParticle();
    composer.render(); isInitialized = true;
  }
  setTimeout(forceInitialRender, 100);

  function animate(timestamp: number) {
    animId = requestAnimationFrame(animate);
    if (!isInitialized) return;
    // Skip rendering when the hero section is not visible — saves GPU/CPU
    if (!heroVisible) { lastFrameTime = timestamp; return; }
    const deltaTime = timestamp - lastFrameTime; lastFrameTime = timestamp;
    if (deltaTime > 100) return;
    const ti = (deltaTime / 16.67) * 0.01; time += ti; frameCount++;

    atmosphereMaterial.uniforms.time.value = time;
    analogDecayPass.uniforms.uTime.value = time;
    analogDecayPass.uniforms.uLimboMode.value = params.limboMode ? 1.0 : 0.0;

    const targetX = mouse.x * 11, targetY = mouse.y * 7;
    const prevPos = ghostGroup.position.clone();
    ghostGroup.position.x += (targetX - ghostGroup.position.x) * params.followSpeed;
    ghostGroup.position.y += (targetY - ghostGroup.position.y) * params.followSpeed;
    atmosphereMaterial.uniforms.ghostPosition.value.copy(ghostGroup.position);

    const ma = prevPos.distanceTo(ghostGroup.position);
    currentMovement = currentMovement * params.eyeGlowDecay + ma * (1 - params.eyeGlowDecay);

    ghostGroup.position.y += Math.sin(time * params.floatSpeed * 1.5) * 0.03 + Math.cos(time * params.floatSpeed * 0.7) * 0.018 + Math.sin(time * params.floatSpeed * 2.3) * 0.008;

    const p1 = Math.sin(time * params.pulseSpeed) * params.pulseIntensity, breathe = Math.sin(time * 0.6) * 0.12;
    ghostMaterial.emissiveIntensity = params.emissiveIntensity + p1 + breathe;

    fireflies.forEach(f => {
      const ud = f.userData;
      const pulse = Math.sin(time + ud.phase * ud.pulseSpeed) * 0.4 + 0.6;
      ud.glowMaterial.opacity = params.fireflyGlowIntensity * 0.4 * pulse;
      ud.fireflyMaterial.opacity = params.fireflyGlowIntensity * 0.9 * pulse;
      ud.light.intensity = params.fireflyGlowIntensity * 0.8 * pulse;
      ud.velocity.x += (Math.random() - 0.5) * 0.001; ud.velocity.y += (Math.random() - 0.5) * 0.001; ud.velocity.z += (Math.random() - 0.5) * 0.001;
      ud.velocity.clampLength(0, params.fireflySpeed);
      f.position.add(ud.velocity);
      if (Math.abs(f.position.x) > 30) ud.velocity.x *= -0.5;
      if (Math.abs(f.position.y) > 20) ud.velocity.y *= -0.5;
      if (Math.abs(f.position.z) > 15) ud.velocity.z *= -0.5;
    });

    const md = new THREE.Vector2(targetX - ghostGroup.position.x, targetY - ghostGroup.position.y).normalize();
    ghostBody.rotation.z = ghostBody.rotation.z * 0.95 + -md.x * 0.035 * 0.05;
    ghostBody.rotation.x = ghostBody.rotation.x * 0.95 + md.y * 0.035 * 0.05;
    ghostBody.rotation.y = Math.sin(time * 1.4) * 0.05 * params.wobbleAmount;
    const sv = 1 + Math.sin(time * 2.1) * 0.025 * params.wobbleAmount + p1 * 0.015, sb = 1 + Math.sin(time * 0.8) * 0.012;
    ghostBody.scale.set(sv * sb, sv * sb, sv * sb);

    const isMoving = currentMovement > params.movementThreshold, tg = isMoving ? 1.0 : 0.0;
    const gs = isMoving ? params.eyeGlowResponse * 2 : params.eyeGlowResponse;
    const no = eyes.leftEyeMaterial.opacity + (tg - eyes.leftEyeMaterial.opacity) * gs;
    eyes.leftEyeMaterial.opacity = no; eyes.rightEyeMaterial.opacity = no;
    eyes.leftOuterGlowMaterial.opacity = no * 0.3; eyes.rightOuterGlowMaterial.opacity = no * 0.3;

    const nms = Math.sqrt(mouseSpeed.x * mouseSpeed.x + mouseSpeed.y * mouseSpeed.y) * 8;
    const scp = params.createParticlesOnlyWhenMoving ? currentMovement > 0.005 && isMouseMoving : currentMovement > 0.005;
    if (scp && timestamp - lastParticleTime > 100) {
      const pr = Math.min(params.particleCreationRate, Math.max(1, Math.floor(nms * 3)));
      for (let i = 0; i < pr; i++) createParticle();
      lastParticleTime = timestamp;
    }

    const ptu = Math.min(particles.length, 60);
    for (let i = 0; i < ptu; i++) {
      const idx = (frameCount + i) % particles.length;
      if (idx < particles.length) {
        const p = particles[idx];
        p.userData.life -= p.userData.decay; p.material.opacity = p.userData.life * 0.85;
        if (p.userData.velocity) { p.position.x += p.userData.velocity.x; p.position.y += p.userData.velocity.y; p.position.z += p.userData.velocity.z; p.position.x += Math.cos(time * 1.8 + p.position.y) * 0.0008; }
        if (p.userData.rotationSpeed) { p.rotation.x += p.userData.rotationSpeed.x; p.rotation.y += p.userData.rotationSpeed.y; p.rotation.z += p.userData.rotationSpeed.z; }
        if (p.userData.life <= 0) { p.visible = false; p.material.opacity = 0; particlePool.push(p); particles.splice(idx, 1); i--; }
      }
    }
    composer.render();
  }

  window.dispatchEvent(new MouseEvent("mousemove", { clientX: container.clientWidth / 2, clientY: container.clientHeight / 2 }));
  animate(0);

  return () => {
    cancelAnimationFrame(animId);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("mousemove", onMouseMove);
    // updateBaseDarkness removed — no scroll listener to clean up
    window.removeEventListener("toggle-ghost-panel", onTogglePane);
    window.removeEventListener("loader-done", onLoaderDone);
    window.removeEventListener("resize", onPaneResize);
    if (resizeTimeout) clearTimeout(resizeTimeout);
    if (mouseMovementTimer) clearTimeout(mouseMovementTimer);
    pane.dispose();
    renderer.dispose();
    if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
  };
}
