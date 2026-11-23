import type { Transition, Variants } from "motion/react";

/**
 * The motion system — one house curve, a small vocabulary of presets.
 *
 * The design language is fades + short rises; springs are reserved for
 * thumbs, sheets and taps. Everything collapses under prefers-reduced-motion
 * (`MotionConfig reducedMotion="user"` in the workspace chrome, plus explicit
 * `useReducedMotion` gates at every call site that owns an entrance).
 *
 * Durations stay tiny (0.14–0.34s) and the curve mirrors `--ease-out-soft`
 * in globals.css, so JS-driven motion and CSS transitions read as one system.
 */

/** House curve — matches `--ease-out-soft` in globals.css. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** Durations aligned with the CSS `--dur-*` motion tokens. */
export const DUR = {
  quick: 0.14,
  enter: 0.22,
  view: 0.28,
  page: 0.34,
} as const;

/** Staggered list/panel reveal (parent + children variants). */
export function staggerContainer(stagger = 0.055, delay = 0): Variants {
  return {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: EASE } },
};

/** Springs — taps, sliding indicators, sheets. */
export const tapSpring: Transition = { type: "spring", stiffness: 400, damping: 17 };
export const saveBarSpring: Transition = { type: "spring", stiffness: 300, damping: 30 };
export const switchBounce: Transition = { type: "spring", stiffness: 500, damping: 20 };
export const sheetSpring: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 34,
  mass: 0.9,
};

/** Micro-interaction props for cards/rows. */
export const pressTap = {
  whileTap: { scale: 0.985 },
} as const;

/** SVG path draw-in (trend lines, sparklines, diagrams). */
export const drawPath = (duration = 1.1, delay = 0): Transition => ({
  duration,
  delay,
  ease: EASE,
});
