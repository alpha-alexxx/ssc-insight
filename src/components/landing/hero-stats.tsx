"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * The horizon figures — the hero-beams idea, on the house ledger.
 *
 * Three personal readings (latest mock, full-mock average, gap to the saved
 * target) roll up from zero once the row scrolls into view. The rolling
 * number is `aria-hidden`; screen readers get the final figure immediately,
 * before any animation, so nothing about the data depends on JavaScript.
 *
 * Under `prefers-reduced-motion` the row renders its final values at once.
 */

export type HeroStat = {
  /** Whole-number value to count up to. */
  value: number;
  /** Label under the figure. */
  label: string;
  /** Signed gap in marks: shown as −n / +n with a tone. */
  gap?: boolean;
  /** Optional `/ max` suffix in muted ink. */
  outOf?: number;
  /** Optional % suffix. */
  percent?: boolean;
  /** Fixed decimals in the painted figure (default 0). */
  decimals?: number;
};

const DURATION = 1500;

function Figure({ stat, p }: { stat: HeroStat; p: number }) {
  const digits = stat.decimals ?? 0;
  const final = stat.gap
    ? `${stat.value < 0 ? "−" : "+"}${Math.abs(stat.value).toFixed(digits)}`
    : `${stat.value.toFixed(digits)}${stat.percent ? "%" : ""}`;
  const rolling = stat.gap
    ? `${stat.value < 0 ? "−" : "+"}${(Math.abs(stat.value) * p).toFixed(digits)}`
    : `${(stat.value * p).toFixed(digits)}${stat.percent ? "%" : ""}`;
  return (
    <div className="min-w-0 px-2 py-1 text-center sm:px-4">
      <p
        className={`font-serif text-[1.65rem] leading-none tracking-[-0.02em] tabular-nums sm:text-[1.9rem] ${
          stat.gap
            ? stat.value < 0
              ? "text-foreground"
              : "text-success"
            : "text-foreground"
        }`}
        aria-hidden="true"
      >
        {rolling}
        {stat.outOf ? (
          <span className="ml-1 font-sans text-[0.5em] font-medium tracking-normal text-muted-foreground">
            / {stat.outOf}
          </span>
        ) : null}
      </p>
      <p className="mt-1.5 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        <span className="sr-only">{final} </span>
        {stat.label}
      </p>
    </div>
  );
}

export function HeroStats({ stats }: { stats: HeroStat[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [p, setP] = useState(0);
  // Reduced motion renders the final figures outright — never a count-up.
  const progress = reduced ? 1 : p;

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let begin = 0;
    function tick(now: number) {
      if (!begin) begin = now;
      const t = Math.min(1, (now - begin) / DURATION);
      setP(1 - Math.pow(1 - t, 4));
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div
      ref={ref}
      className="mx-auto grid max-w-2xl grid-cols-3 divide-x divide-border border-y border-border"
    >
      {stats.map((stat) => (
        <Figure key={stat.label} stat={stat} p={progress} />
      ))}
    </div>
  );
}
