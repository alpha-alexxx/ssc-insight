"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion";
import { formatNumber as n } from "@/lib/domain";
import { cn } from "@/lib/utils";

/**
 * The attempt-outcome donut: correct / incorrect / unattempted as three
 * stroked arcs around a centre figure, beside a plain legend that carries
 * the same counts. Hand-rolled SVG — the arcs animate their dash once on
 * mount and the ring colors are the fixed outcome tokens, identical in
 * every palette.
 */

const TONES = {
  correct: "var(--chart-correct)",
  incorrect: "var(--chart-incorrect)",
  unattempted: "var(--chart-skipped)",
} as const;

export type BreakdownCounts = {
  correct: number;
  incorrect: number;
  unattempted: number;
};

export function BreakdownDonut({
  counts,
  size = 168,
  thickness = 16,
  centerValue,
  centerLabel,
  className,
}: {
  counts: BreakdownCounts;
  size?: number;
  thickness?: number;
  /** The figure in the middle — usually the attempt rate. */
  centerValue?: string;
  centerLabel?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const total = counts.correct + counts.incorrect + counts.unattempted;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments =
    total > 0
      ? (["correct", "incorrect", "unattempted"] as const)
          .map((key) => ({ key, value: counts[key] }))
          .filter((segment) => segment.value > 0)
      : [];

  let offset = 0;

  return (
    <div
      className={cn("relative shrink-0", className)}
      role="img"
      aria-label={
        total > 0
          ? `${n(counts.correct)} correct, ${n(counts.incorrect)} incorrect, ${n(counts.unattempted)} unattempted`
          : "No questions recorded"
      }
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--rule-soft)"
          strokeWidth={thickness}
          opacity={total > 0 ? 0.35 : 1}
        />
        {segments.map((segment) => {
          const fraction = segment.value / total;
          const arc = (
            <motion.circle
              key={segment.key}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={TONES[segment.key]}
              strokeWidth={thickness}
              strokeLinecap="butt"
              strokeDasharray={`${fraction * circumference} ${circumference}`}
              strokeDashoffset={-offset * circumference}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              initial={
                reduced ? undefined : { strokeDasharray: `0 ${circumference}` }
              }
              animate={{
                strokeDasharray: `${fraction * circumference} ${circumference}`,
              }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
            />
          );
          offset += fraction;
          return arc;
        })}
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <p className="tabular-nums font-serif text-xl leading-none tracking-[-0.02em] text-ink">
          {centerValue ?? "—"}
        </p>
        {centerLabel ? (
          <p className="mt-0.5 text-[0.5625rem] uppercase tracking-[0.12em] text-muted">
            {centerLabel}
          </p>
        ) : null}
      </div>
    </div>
  );
}

const ROWS: { key: keyof BreakdownCounts; label: string }[] = [
  { key: "correct", label: "Correct" },
  { key: "incorrect", label: "Incorrect" },
  { key: "unattempted", label: "Unattempted" },
];

export function DonutLegend({
  counts,
  className,
}: {
  counts: BreakdownCounts;
  className?: string;
}) {
  const total = counts.correct + counts.incorrect + counts.unattempted;
  return (
    <ul className={cn("min-w-0 flex-1 space-y-1.5", className)}>
      {ROWS.map((row) => (
        <li key={row.key} className="flex items-center gap-2 text-xs">
          <span
            aria-hidden
            className="inline-block size-2.5 shrink-0 rounded-[2px]"
            style={{ background: TONES[row.key] }}
          />
          <span className="min-w-0 flex-1 text-muted">{row.label}</span>
          <span className="tabular-nums font-medium text-ink">
            {n(counts[row.key])}
          </span>
          <span className="tabular-nums w-10 text-right text-muted">
            {total ? `${Math.round((counts[row.key] / total) * 100)}%` : "—"}
          </span>
        </li>
      ))}
    </ul>
  );
}
