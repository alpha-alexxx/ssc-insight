"use client";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * In-place content swap: a short fade + 4px rise when `swapKey` changes.
 *
 * Deliberately has no `AnimatePresence` and no height/layout animation — an
 * exit animation would collapse a tall panel and jump the scroll position,
 * which is worse than an instant swap. Use it where content genuinely
 * replaces other content (a new plan day, a new analytics scope), never for
 * ordinary re-renders. Under `prefers-reduced-motion` the content simply
 * appears, and `MotionConfig reducedMotion="user"` in the shell backstops it.
 *
 * The motion spec is fixed (the dual-style axis is gone — Hairline's own
 * interaction feel is the only motion language).
 */
const SWAP_MOTION = { duration: 0.18, ease: "easeOut" } as const;

export function Swap({
  swapKey,
  children,
  className,
}: {
  swapKey: string;
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  // Stay on the same element either way so SSR and client markup agree;
  // `initial={false}` simply skips the entrance when motion is unwanted.
  return (
    <motion.div
      key={swapKey}
      className={className}
      initial={reduced ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SWAP_MOTION}
    >
      {children}
    </motion.div>
  );
}
