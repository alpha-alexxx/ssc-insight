"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { RoleAvatar, SOURCE_CHIPS } from "./role-avatar";

/**
 * The pre-answer indicator, shown only while the stream is alive but no
 * answer text has landed: `connecting` until the server says anything,
 * `thinking` while reasoning or keepalives arrive. The seconds clock is
 * honest — thinking models can spend a long first stretch producing nothing
 * visible, and hiding that wait reads as a hang. Callers pass `key={phase}`
 * so each phase mounts with its own clock.
 *
 * While thinking, the status line rotates through what the coach actually
 * reads server-side (the same four sources the answer's trace strip claims),
 * and the source chips pop in one by one — the wait narrates the work.
 */
const STATUS_LINES = [
  "Reading aggregate analytics…",
  "Scanning the latest 20 mocks…",
  "Cross-checking target progress…",
  "Comparing the subject profile…",
];

const STATUS_ROTATE_MS = 2400;

export function ThinkingIndicator({
  phase,
  className,
}: {
  phase: "connecting" | "thinking";
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [elapsed, setElapsed] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (phase !== "thinking" || reduced) return;
    const timer = window.setInterval(() => {
      setLineIndex((value) => (value + 1) % STATUS_LINES.length);
    }, STATUS_ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [phase, reduced]);

  const statusLine =
    phase === "connecting"
      ? "Connecting…"
      : STATUS_LINES[lineIndex];

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: EASE }}
      className={cn("flex items-start gap-2.5", className)}
      role="status"
      aria-live="polite"
    >
      <RoleAvatar role="ai" />
      <div className="min-w-0 max-w-[46rem] flex-1 rounded-2xl rounded-tl-sm border border-rule-soft bg-paper px-3.5 py-3">
        <div className="flex min-h-5 items-center gap-2.5">
          <span className="flex items-end gap-1" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="size-1.5 rounded-full bg-muted"
                animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: 0.9,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={statusLine}
              initial={reduced ? false : { opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -3 }}
              transition={{ duration: 0.18, ease: EASE }}
              className="text-[0.6875rem] text-muted"
            >
              {statusLine}
              {phase === "thinking" && elapsed > 0 ? (
                <span className="tabular-nums"> · {elapsed}s</span>
              ) : null}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5" aria-hidden="true">
          {SOURCE_CHIPS.map((chip, i) => (
            <motion.span
              key={chip.label}
              initial={reduced ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.24, delay: 0.12 + i * 0.14, ease: EASE }}
              className="inline-flex items-center gap-1 rounded-pill border border-rule-soft bg-canvas px-1.5 py-0.5 text-[0.5625rem] font-medium leading-4 text-muted"
            >
              <chip.icon size={9} aria-hidden className="text-accent" />
              {chip.label}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
