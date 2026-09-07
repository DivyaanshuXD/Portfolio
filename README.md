# Divyaanshu Tonk — Portfolio

A cinematic, editorial-style portfolio built with Next.js 16, React Three Fiber, and Framer Motion.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19** + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui**
- **Three.js** via `@react-three/fiber` + `@react-three/drei`
- **Framer Motion** for animation
- **Lenis** for smooth scroll
- **TweakPane** for the Spectral Ghost control panel

## Local development

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Production build

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Vercel auto-detects Next.js — no extra config needed
4. Click **Deploy**

The `next.config.ts` is already Vercel-friendly (no `output: "standalone"`).

## Structure

```
src/
├── app/
│   ├── layout.tsx          # Fonts + metadata
│   ├── page.tsx            # Section composition
│   └── globals.css         # Tailwind + theme + Glitex @font-face + TweakPane gold theme
└── components/
    └── portfolio/
        ├── sections/       # Hero, DNA, About, Transition, Projects, Capabilities, Recognition, Contact
        ├── three/          # Three.js effects (Ghost, Tubes, Sculpture)
        ├── loader.tsx      # Loading screen with Glitex font
        ├── nav.tsx         # Scroll-aware header with blended colors
        ├── ghost-icon.tsx  # Floating settings button (hero-only, pixelate animation)
        └── ...
public/
└── fonts/
    ├── Glitex.ttf          # Loader display font
    └── Glitex.otf
```

## Features

- **Cinematic loader** with Glitex display font, gradient progress bar, corner ticks
- **Spectral Ghost** Three.js scene in the hero — floating ghost with eyes, particles, fireflies
- **DNA double helix** section — two slim carbon-fiber strands with continuous roll + horizontal flow + sinusoidal wave
- **Transition globe** — three nested icosahedron wireframes in antique gold / smoky bronze-amber / deep burnt orange on deep cinematic fog
- **Scroll-aware nav** that smoothly blends its background color across sections
- **Floating ghost icon** (hero-only) that pixelates in/out with SVG filter animation
- **Custom cursor** with spring-follow ring + dot
- **Smooth scroll** via Lenis
- **Live clock** (IST), scroll progress, back-to-top, easter egg

## Fonts

- **Glitex** by PutraCetol Studio (loaded from `/public/fonts/`) — used for the loader name display. Personal-use license; purchase a commercial license at [putracetol.com](https://putracetol.com/) if used commercially.
- **Playfair Display** (Google Fonts) — main display serif
- **Fraunces**, **Space Grotesk**, **JetBrains Mono** (Google Fonts) — body / sans / mono

## License

Personal portfolio. Glitex font is personal-use only (see above).
