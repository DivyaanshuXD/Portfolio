"use client";

import { useEffect } from "react";

/**
 * ScrollPalette — subtly shifts the paper background hue as the user
 * scrolls through sections. Creates a "living" feel without being garish.
 *
 * Each section gets a slightly different paper tint:
 * - Hero/About: warm cream (base)
 * - Work: slightly cooler (lapis-tinted)
 * - Capabilities: warmer (gold-tinted)
 * - Recognition: deeper (henna-tinted)
 * - Contact: darkest (ink-tinted)
 */
const SECTION_TINTS: Record<string, string> = {
  hero: "#e8dfc8",
  about: "#e8dfc8",
  work: "#0a0907", // dark section — handled by the section itself
  capabilities: "#e9ddc4", // slightly more golden
  recognition: "#e6dcc6", // slightly deeper
  contact: "#0a0907", // dark section
};

export default function ScrollPalette() {
  useEffect(() => {
    const sections = Object.keys(SECTION_TINTS)
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    const onScroll = () => {
      const viewportCenter = window.innerHeight * 0.4;
      let activeId = "hero";
      for (const s of sections) {
        const rect = s.getBoundingClientRect();
        if (rect.top < viewportCenter && rect.bottom > viewportCenter) {
          activeId = s.id;
          break;
        }
      }
      // Only apply tint to light sections; dark sections handle their own bg
      const tint = SECTION_TINTS[activeId];
      if (tint && activeId !== "work" && activeId !== "contact") {
        document.body.style.backgroundColor = tint;
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
