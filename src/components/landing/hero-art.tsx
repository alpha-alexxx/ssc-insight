"use client";
import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { totals } from "@/lib/domain";
import { shortDate } from "@/lib/format";
import {
  LANDING_FULL_MOCKS,
  LANDING_LATEST,
  LANDING_SUMMARY,
} from "./fixtures";
import { MockRing, MockTrend, subjectChartColor } from "./mockups/data-parts";

/**
 * The hero composition: a dashboard slab with two record cards on a shelf
 * below it, breaking its bottom edge the way a printed plate carries a
 * pasted-in correction.
 *
 * Motion, each bounded:
 *  - the slab tilts by at most 1.2deg and never leaves its column;
 *  - the whole field follows the pointer by at most 8px, on fine pointers
 *    only, through motion values — no React state, so no re-render per frame.
 *
 * Under `prefers-reduced-motion` the tilt and parallax are dropped and the
 * composition renders at rest. Below `lg` the shelf is dropped entirely and
 * the slab stands alone.
 */

const MAX_SHIFT = 8;

export function HeroArt() {
  const reduced = useReducedMotion();
  const frame = useRef<HTMLDivElement>(null);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 90, damping: 20, mass: 0.6 };
  const x = useSpring(px, spring);
  const y = useSpring(py, spring);
  // Layers move at different rates for a shallow sense of depth.
  const slabX = useTransform(x, (value) => value * 0.35);
  const slabY = useTransform(y, (value) => value * 0.35);
  const cardAX = useTransform(x, (value) => value * -0.8);
  const cardAY = useTransform(y, (value) => value * -0.8);
  const cardBX = useTransform(x, (value) => value * 0.7);
  const cardBY = useTransform(y, (value) => value * 0.7);

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reduced || event.pointerType !== "mouse") return;
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return;
    const dx =
      (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy =
      (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    px.set(Math.max(-1, Math.min(1, dx)) * MAX_SHIFT);
    py.set(Math.max(-1, Math.min(1, dy)) * MAX_SHIFT);
  }
  function onPointerLeave() {
    px.set(0);
    py.set(0);
  }

  const s = LANDING_SUMMARY;
  const points = s.trend.map((point) => ({ percentage: point.percentage }));
  const ring = s.radar;
  const latest = totals(LANDING_LATEST);
  const recent = [...LANDING_FULL_MOCKS].reverse().slice(1, 3);

  return (
    <div
      ref={frame}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative mx-auto w-full max-w-[34rem] pb-6 lg:max-w-none lg:pb-24"
    >
      {/* Atmospheric washes behind the composition. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-10 size-[22rem] rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 -left-12 size-[16rem] rounded-full bg-muted blur-3xl"
      />

      {/* ---------- the slab ---------- */}
      <motion.div
        style={reduced ? undefined : { x: slabX, y: slabY }}
        className="relative z-10 lg:-rotate-[1.2deg] motion-reduce:rotate-0"
      >
        <div className="overflow-hidden rounded-[22px] bg-card shadow-[inset_0_0_0_1px_var(--border)]">
          {/* window chrome */}
          <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-3 py-2">
            <span className="flex gap-1" aria-hidden="true">
              <span className="size-1.5 rounded-[1px] bg-muted-foreground/40" />
              <span className="size-1.5 rounded-[1px] bg-muted-foreground/40" />
              <span className="size-1.5 rounded-[1px] bg-muted-foreground/40" />
            </span>
            <span className="truncate text-[10px] text-muted-foreground">
              ssc insight · dashboard
            </span>
            <span className="ml-auto flex items-center gap-1.5 text-[9px] text-muted-foreground">
              <span
                className="size-1.5 rounded-full bg-success"
                aria-hidden="true"
              />
              Session verified
            </span>
          </div>

          <div className="p-3 sm:p-4">
            <div className="flex items-baseline justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Full mocks
                </p>
                <p className="mt-1 font-serif text-[1.05rem] leading-tight tracking-[-0.02em] text-foreground sm:text-[1.2rem]">
                  Your preparation, in perspective.
                </p>
              </div>
              <span className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)]">
                Target {Math.round(s.targetPercentage)}%
              </span>
            </div>

            {/* metric strip: 2x2 on phones, four across from sm */}
            <div className="mt-3 grid grid-cols-2 border-y border-border sm:grid-cols-4">
              {[
                {
                  label: "Latest",
                  value: String(s.latestScore),
                  unit: `/ ${s.latestMax}`,
                },
                {
                  label: "Average",
                  value: `${(s.averagePercentage ?? 0).toFixed(1)}%`,
                  unit: "",
                },
                {
                  label: "Best",
                  value: `${(s.bestPercentage ?? 0).toFixed(1)}%`,
                  unit: "",
                },
                {
                  label: "Accuracy",
                  value: `${(s.weightedAccuracy ?? 0).toFixed(1)}%`,
                  unit: "",
                },
              ].map((cell, index) => (
                <div
                  key={cell.label}
                  className={`min-w-0 px-2.5 py-2 ${
                    index % 2 === 1 ? "border-l border-border" : ""
                  } ${index >= 2 ? "border-t border-border sm:border-t-0" : ""} ${
                    index === 2 ? "sm:border-l sm:border-border" : ""
                  }`}
                >
                  <p className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {cell.label}
                  </p>
                  <p className="mt-0.5 flex items-baseline gap-1 font-serif text-lg leading-none tracking-[-0.02em] text-foreground tabular-nums sm:text-xl">
                    {cell.value}
                    {cell.unit ? (
                      <span className="font-sans text-[0.5em] font-medium tracking-normal text-muted-foreground">
                        {cell.unit}
                      </span>
                    ) : null}
                  </p>
                </div>
              ))}
            </div>

            {/* trend */}
            <div className="mt-3">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Score trend
                </p>
                <p className="text-[9px] text-muted-foreground">
                  dashed line is your target
                </p>
              </div>
              <div className="mt-1.5 h-24 sm:h-28">
                <MockTrend points={points} target={s.targetPercentage} />
              </div>
              <div className="mt-1 flex justify-between text-[9px] text-muted-foreground tabular-nums">
                <span>{shortDate(s.trend[0]?.date ?? "")}</span>
                <span>{shortDate(s.trend.at(-1)?.date ?? "")}</span>
              </div>
            </div>

            {/* subject chips, with a proportion rule each */}
            <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-border pt-3 sm:grid-cols-4">
              {s.whereYouStand
                .filter((row) => row.subjectId !== "computer")
                .map((row) => (
                  <div key={row.subjectId} className="min-w-0">
                    <p className="flex items-baseline justify-between gap-1 text-[10px]">
                      <span className="truncate text-muted-foreground">
                        {row.label}
                      </span>
                      <span className="shrink-0 font-medium tabular-nums text-foreground">
                        {row.averagePercentage == null
                          ? "—"
                          : `${Math.round(row.averagePercentage)}%`}
                      </span>
                    </p>
                    <span
                      className="mt-1 block h-0.5 rounded-full bg-muted"
                      aria-hidden="true"
                    >
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${Math.max(0, Math.min(100, row.averagePercentage ?? 0))}%`,
                          background: subjectChartColor(row.subjectId),
                        }}
                      />
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ---------- the shelf (lg and up) ----------
          Three record cards in a real grid below the slab. They overlap the
          slab's bottom edge by a hair so the composition reads as one collage,
          but they never sit on top of its figures. */}
      <div className="relative z-20 mt-3 hidden grid-cols-3 gap-2.5 lg:grid">
        <motion.div
          style={reduced ? undefined : { x: cardAX, y: cardAY }}
          className="min-w-0"
        >
          <div className="rounded-2xl bg-card p-2.5 shadow-[inset_0_0_0_1px_var(--border)]">
            <div className="flex items-center gap-2">
              <MockRing
                size={40}
                stroke={5}
                correct={ring?.correct ?? 0}
                incorrect={ring?.incorrect ?? 0}
                unattempted={ring?.unattempted ?? 0}
                centre={`${Math.round(s.latestPercentage)}%`}
                caption=""
              />
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-success">
                  Attempted
                </p>
                <p className="text-[11px] font-medium leading-tight text-foreground">
                  {LANDING_LATEST.name}
                </p>
                <p className="truncate text-[9px] text-muted-foreground">
                  {shortDate(LANDING_LATEST.completedAt)} ·{" "}
                  {LANDING_LATEST.platform}
                </p>
              </div>
            </div>
            <div className="mt-1.5 flex items-baseline justify-between border-t border-border pt-1.5 text-[9px]">
              <span className="text-muted-foreground">Score</span>
              <span className="font-serif text-[13px] tabular-nums text-foreground">
                {latest.score} / {latest.maxScore}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          style={reduced ? undefined : { x: cardBX, y: cardBY }}
          className="min-w-0"
        >
          <div className="rounded-2xl bg-card p-2.5 shadow-[inset_0_0_0_1px_var(--border)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Answer breakdown
            </p>
            <div className="mt-1.5 flex items-center gap-2.5">
              {ring ? (
                <MockRing
                  size={46}
                  stroke={6}
                  correct={ring.correct}
                  incorrect={ring.incorrect}
                  unattempted={ring.unattempted}
                  centre={`${ring.scorePercentage.toFixed(0)}%`}
                />
              ) : null}
              <dl className="min-w-0 flex-1 space-y-0.5 text-[9px]">
                {ring
                  ? [
                      {
                        label: "Correct",
                        count: ring.correct,
                        share: ring.correctPercentage,
                        color: "var(--success)",
                      },
                      {
                        label: "Incorrect",
                        count: ring.incorrect,
                        share: ring.incorrectPercentage,
                        color: "var(--destructive)",
                      },
                      {
                        label: "Skipped",
                        count: ring.unattempted,
                        share: ring.unattemptedPercentage,
                        color: "var(--muted-foreground)",
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center gap-1"
                      >
                        <span
                          className="size-1 shrink-0 rounded-full"
                          style={{ background: row.color }}
                          aria-hidden="true"
                        />
                        <dt className="flex-1 truncate text-muted-foreground">
                          {row.label}
                        </dt>
                        <dd className="tabular-nums text-foreground">{row.count}</dd>
                      </div>
                    ))
                  : null}
              </dl>
            </div>
          </div>
        </motion.div>

        {/* The two most recent attempts, completing the shelf. */}
        <div className="min-w-0">
          <div className="h-full rounded-2xl bg-card p-2.5 shadow-[inset_0_0_0_1px_var(--border)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Recent mocks
            </p>
            <ul className="mt-1.5 space-y-1">
              {recent.map((attempt) => (
                <li
                  key={attempt.id}
                  className="flex items-baseline justify-between gap-1 text-[10px]"
                >
                  <span className="truncate text-muted-foreground">
                    {shortDate(attempt.completedAt)}
                  </span>
                  <span className="shrink-0 font-medium tabular-nums text-foreground">
                    {totals(attempt).score}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
