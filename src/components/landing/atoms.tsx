"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * The landing's shared motion atoms — the ink-wash art, the falling-petal
 * ambience, the typed terminal line and a count-up figure.
 *
 * Hydration rule: nothing here reads Math.random(), the clock or layout
 * during render — petal fields are a fixed literal table and all motion
 * values start from constants that render identically on the server.
 */

/* ================================================================== InkArt */

/**
 * A generated ink wash that assimilates into its background — no frame, no
 * border. On paper it multiplies (the white field vanishes); in dark mode the
 * image is inverted and screened, so the strokes stay legible.
 *
 * The blend/filter classes sit on a wrapper div, not the img: a transformed
 * ancestor (a drift animation) isolates a blend applied deeper in its subtree,
 * so the blend must be applied above any transform the caller wraps around it.
 */
export function InkArt({
  src,
  width,
  height,
  tone = "paper",
  className,
}: {
  src: string;
  width: number;
  height: number;
  /** "ink" inverts the wash for use INSIDE a dark plate, whatever the theme. */
  tone?: "paper" | "ink";
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={
        tone === "ink"
          ? cn(
              "pointer-events-none mix-blend-screen opacity-25 [filter:invert(1)_sepia(0.35)_saturate(0.7)_brightness(0.95)]",
              className,
            )
          : cn("ink-art", className)
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- local ink-wash asset, decorative */}
      <img
        src={src}
        alt=""
        draggable={false}
        width={width}
        height={height}
        className="pointer-events-none h-auto w-full select-none"
      />
    </div>
  );
}

/**
 * InkArt that breathes — entrance rise plus a slow endless drift. The blend
 * lives on the OUTER motion div (the one that owns no infinite transform),
 * because any transformed ancestor would otherwise isolate the blend group
 * and show the wash's white field as a hard rectangle.
 */
export function FloatingInk({
  src,
  width,
  height,
  className,
  drift = 8,
  duration = 12,
  delay = 0,
}: {
  src: string;
  width: number;
  height: number;
  className?: string;
  drift?: number;
  duration?: number;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? undefined : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: EASE, delay }}
      className={cn("relative ink-art", className)}
    >
      <motion.div
        animate={reduced ? undefined : { y: [0, -drift, 0, drift, 0] }}
        transition={reduced ? undefined : { duration, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- local ink-wash asset, decorative */}
        <img
          src={src}
          alt=""
          draggable={false}
          width={width}
          height={height}
          className="pointer-events-none h-auto w-full select-none"
        />
      </motion.div>
    </motion.div>
  );
}

/* =================================================================== Petals */

type PetalSpec = {
  left: number;
  size: number;
  x: string;
  r: number;
  dur: number;
  delay: number;
  opacity: number;
  ink: boolean;
};

/**
 * The petal field — a fixed literal table (no randomness at render), sliced
 * by `count` so the hero stays light and the finale goes dense. Every petal
 * falls on its own CSS keyframe period; reduced motion freezes the whole
 * layer via the `.petal` guard in globals.css.
 */
const PETALS: PetalSpec[] = [
  { left: 2, size: 11, x: "2vw", r: 140, dur: 15, delay: -2, opacity: 0.55, ink: false },
  { left: 7, size: 8, x: "-3vw", r: -120, dur: 18, delay: -9, opacity: 0.4, ink: true },
  { left: 13, size: 13, x: "3.5vw", r: 170, dur: 16, delay: -5, opacity: 0.6, ink: false },
  { left: 19, size: 9, x: "-2vw", r: -140, dur: 19, delay: -13, opacity: 0.45, ink: true },
  { left: 24, size: 12, x: "2.5vw", r: 150, dur: 14, delay: -8, opacity: 0.65, ink: false },
  { left: 30, size: 8, x: "-4vw", r: -110, dur: 20, delay: -3, opacity: 0.4, ink: false },
  { left: 36, size: 14, x: "3vw", r: 160, dur: 17, delay: -11, opacity: 0.55, ink: true },
  { left: 42, size: 10, x: "-2.5vw", r: -130, dur: 15, delay: -6, opacity: 0.6, ink: false },
  { left: 48, size: 12, x: "4vw", r: 145, dur: 18, delay: -15, opacity: 0.5, ink: false },
  { left: 54, size: 9, x: "-3.5vw", r: -150, dur: 16, delay: -4, opacity: 0.45, ink: true },
  { left: 60, size: 13, x: "2.5vw", r: 155, dur: 19, delay: -10, opacity: 0.6, ink: false },
  { left: 66, size: 8, x: "-2vw", r: -115, dur: 14, delay: -7, opacity: 0.4, ink: false },
  { left: 72, size: 11, x: "3.5vw", r: 135, dur: 17, delay: -1, opacity: 0.55, ink: true },
  { left: 78, size: 12, x: "-3vw", r: -165, dur: 20, delay: -12, opacity: 0.5, ink: false },
  { left: 84, size: 9, x: "2vw", r: 125, dur: 15, delay: -6, opacity: 0.45, ink: false },
  { left: 90, size: 13, x: "-4vw", r: 150, dur: 18, delay: -14, opacity: 0.6, ink: false },
  { left: 95, size: 10, x: "3vw", r: -140, dur: 16, delay: -3, opacity: 0.5, ink: true },
  { left: 40, size: 7, x: "4.5vw", r: 170, dur: 21, delay: -18, opacity: 0.35, ink: true },
  { left: 58, size: 15, x: "-2.5vw", r: 130, dur: 15, delay: -9, opacity: 0.65, ink: false },
  { left: 17, size: 7, x: "3vw", r: -155, dur: 22, delay: -16, opacity: 0.35, ink: false },
  { left: 69, size: 15, x: "-3.5vw", r: 120, dur: 21, delay: -7, opacity: 0.55, ink: false },
  { left: 87, size: 8, x: "4vw", r: -125, dur: 20, delay: -19, opacity: 0.4, ink: true },
  { left: 33, size: 10, x: "-4.5vw", r: 160, dur: 19, delay: -2, opacity: 0.5, ink: false },
  { left: 77, size: 14, x: "2vw", r: -135, dur: 17, delay: -11, opacity: 0.6, ink: false },
];

export function Petals({ count = 16, className }: { count?: number; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {PETALS.slice(0, Math.min(count, PETALS.length)).map((petal, index) => (
        <span
          key={index}
          className={cn("petal", petal.ink && "petal-ink")}
          style={
            {
              "--fall-left": `${petal.left}%`,
              "--fall-size": `${petal.size}px`,
              "--fall-x": petal.x,
              "--fall-r": `${petal.r}deg`,
              "--fall-dur": `${petal.dur}s`,
              "--fall-delay": `${petal.delay}s`,
              "--fall-opacity": petal.opacity,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/* ================================================================ TypedLine */

/**
 * A command typed in with CSS steps, then a blinking caret — the guard
 * screen's `.guard-type` pattern. Under reduced motion the full line shows.
 */
export function TypedLine({
  text,
  duration = 3,
  delay = 0,
  className,
  caretClassName,
}: {
  text: string;
  duration?: number;
  /** Seconds before typing starts (the CSS shorthand's delay, overridden). */
  delay?: number;
  className?: string;
  caretClassName?: string;
}) {
  return (
    <span
      className={cn(
        "guard-type motion-reduce:[animation:none] inline-block overflow-hidden whitespace-nowrap align-bottom",
        className,
      )}
      style={
        {
          "--guard-type-dur": `${duration}s`,
          "--guard-type-steps": text.length,
          "--guard-cmd-len": "100%",
          ...(delay > 0 ? { animationDelay: `${delay}s` } : null),
        } as CSSProperties
      }
    >
      {text}
      <span
        aria-hidden="true"
        className={cn(
          "guard-blink motion-reduce:[animation:none] ml-0.5 inline-block h-[1em] w-[0.5ch] translate-y-[0.14em]",
          caretClassName,
        )}
      />
    </span>
  );
}

/* ================================================================== CountUp */

/**
 * Counts up once when scrolled into view, then holds. The static final value
 * is the BASE state — the server renders it complete, and the count-up is a
 * progressive enhancement that only runs after hydration with motion allowed;
 * reduced motion reads the final value straight off render.
 */
export function CountUp({
  value,
  duration = 1.1,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const shown = reduced ? value : display;

  useEffect(() => {
    if (!inView || reduced) return;
    const controls = animate(0, value, {
      duration,
      ease: EASE,
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, reduced, value, duration]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {shown}
    </span>
  );
}
