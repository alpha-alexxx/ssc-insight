"use client";

import * as React from "react";
import { motion, useReducedMotion, type Transition, type Variants } from "motion/react";
import { Button } from "@/components/button";

/**
 * Motion presets for Settings — the one documented exception to the
 * dashboard's "token-driven fades, never page-style transitions" rule
 * (see DESIGN.md). Every consumer gates on useReducedMotion(); the shell's
 * <MotionConfig reducedMotion="user"> backstops anything missed.
 */

export const pageEnter = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25, ease: "easeOut" },
} as const;

export const tabSwap = {
  initial: { opacity: 0, x: 8 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -8 },
  transition: { duration: 0.2 },
} as const;

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.18 } },
};

export const tapSpring: Transition = { type: "spring", stiffness: 400, damping: 17 };
export const saveBarSpring: Transition = { type: "spring", stiffness: 300, damping: 30 };
export const switchBounce: Transition = { type: "spring", stiffness: 500, damping: 20 };

/** Button with the spec's hover/tap micro-spring. Motion-safe by default:
 * under prefers-reduced-motion motion.create keeps the button but whileHover
 * transforms are disabled by MotionConfig's reducedMotion="user". */
export const MotionButton = motion.create(Button);

/** Stagger container for a settings panel's rows. Renders a plain div when
 * the user prefers reduced motion so nothing animates at all. */
export function Reveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
}
