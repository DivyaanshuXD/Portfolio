"use client";

import { useRef, useState, type ReactNode, type MouseEvent } from "react";
import { motion } from "framer-motion";

/**
 * Magnetic — wraps any element and translates it toward the cursor when hovered.
 * Inner content can also be shifted slightly more for a parallax feel.
 */
export default function Magnetic({
  children,
  strength = 0.4,
  className = "",
  innerStrength = 0.2,
  as = "div",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
  innerStrength?: number;
  as?: "div" | "button" | "a";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [innerPos, setInnerPos] = useState({ x: 0, y: 0 });

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    setPos({ x: x * strength, y: y * strength });
    setInnerPos({ x: x * innerStrength, y: y * innerStrength });
  };

  const handleLeave = () => {
    setPos({ x: 0, y: 0 });
    setInnerPos({ x: 0, y: 0 });
  };

  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 250, damping: 18, mass: 0.6 }}
      className={className}
      data-cursor="hover"
    >
      <motion.div
        animate={{ x: innerPos.x, y: innerPos.y }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        {children}
      </motion.div>
    </MotionTag>
  );
}
