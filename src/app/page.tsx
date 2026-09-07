"use client";

import SmoothScroll from "@/components/portfolio/smooth-scroll";
import CustomCursor from "@/components/portfolio/cursor";
import Loader from "@/components/portfolio/loader";
import Nav from "@/components/portfolio/nav";
import ScrollProgress from "@/components/portfolio/scroll-progress";
import LiveClock from "@/components/portfolio/live-clock";
import EasterEgg from "@/components/portfolio/easter-egg";
import GhostIcon from "@/components/portfolio/ghost-icon";
import Hero from "@/components/portfolio/sections/hero";
import About from "@/components/portfolio/sections/about";
import Projects from "@/components/portfolio/sections/projects";
import Capabilities from "@/components/portfolio/sections/skills";
import Recognition from "@/components/portfolio/sections/awards";
import Contact from "@/components/portfolio/sections/contact";
import DNASection from "@/components/portfolio/sections/dna-section";
import TransitionSection from "@/components/portfolio/transition-section";

export default function Page() {
  return (
    <SmoothScroll>
      <div className="paper-grain relative min-h-screen bg-[#e8dfc8] text-[#0a0907]">
        <Loader />
        <CustomCursor />

        <Nav />
        <ScrollProgress />
        <LiveClock />
        <EasterEgg />
        <GhostIcon />

        <main className="relative z-10">
          <Hero />
          <DNASection text="Ship to production." accent="Not to demo." />
          <About />
          <TransitionSection statement="Ideas become infrastructure." accent="#b8862a" />
          <Projects />
          <Capabilities />
          <Recognition />
          <Contact />
        </main>
      </div>
    </SmoothScroll>
  );
}
