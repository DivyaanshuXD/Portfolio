"use client";

import { motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

/**
 * SplitText — splits a string into words and animates them in
 * with staggered upward reveal.
 */
export function SplitText({
  text,
  className = "",
  delay = 0,
  stagger = 0.06,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "span" | "h1" | "h2" | "h3" | "p";
}) {
  const words = text.split(" ");
  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
  const word: Variants = {
    hidden: { y: "110%", opacity: 0 },
    visible: {
      y: "0%",
      opacity: 1,
      transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const MotionTag = motion[Tag] as typeof motion.span;
  return (
    <MotionTag
      className={className}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-12% 0px" }}
    >
      {words.map((w, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden align-baseline pb-[0.12em] -mb-[0.12em]"
        >
          <motion.span className="inline-block" variants={word}>
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}

/**
 * SplitChars — splits a string into individual characters and animates
 * each one with a stagger. Great for hero names.
 * Each char is wrapped in an overflow-hidden mask for a clean reveal.
 */
export function SplitChars({
  text,
  className = "",
  charClassName = "",
  delay = 0,
  stagger = 0.04,
  duration = 0.9,
  ease = [0.16, 1, 0.3, 1] as const,
  whileInView = false,
}: {
  text: string;
  className?: string;
  charClassName?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  ease?: readonly number[];
  whileInView?: boolean;
}) {
  const chars = Array.from(text);
  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
  const char: Variants = {
    hidden: { y: "115%" },
    visible: {
      y: "0%",
      transition: { duration, ease: ease as unknown as number[] },
    },
  };

  return (
    <motion.span
      className={className}
      variants={container}
      initial="hidden"
      {...(whileInView
        ? { whileInView: "visible", viewport: { once: true, margin: "-10% 0px" } }
        : { animate: "visible" })}
    >
      {chars.map((c, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden align-bottom"
          style={{ lineHeight: "inherit" }}
        >
          <motion.span
            className={`inline-block ${charClassName}`}
            variants={char}
            style={{ willChange: "transform" }}
          >
            {c === " " ? "\u00A0" : c}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/**
 * FadeUp — simple fade-up wrapper.
 */
export function FadeUp({
  children,
  className = "",
  delay = 0,
  y = 28,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
