"use client";
import { useRef, type CSSProperties, type PointerEvent } from "react";
import { useReducedMotion } from "motion/react";
import { totals } from "@/lib/domain";
import { shortDate } from "@/lib/format";
import {
  LANDING_FULL_MOCKS,
  LANDING_LATEST,
  LANDING_SUMMARY,
} from "./fixtures";
import { MockRing, MockTrend, subjectChartColor } from "./mockups/data-parts";

/**
 * The hero composition as a layered product stage, adapted from the
 * Hyperblur `hero-product` rig: a dashboard slab (L0) with three record
 * cards floating over it — the "Attempted" ring card (L1) over the slab's
 * top-right corner, the answer breakdown (L2) breaking its bottom-left edge
 * and the recent mocks (L3) at bottom-right.
 *
 * Mechanism: one `onPointerMove` / `onPointerLeave` on the frame writes
 * `--hx` / `--hy` (−1…1) through refs and `style.setProperty` — no React
 * state, so nothing re-renders per frame. The CSS in the `<style>` tag turns
 * those variables into a shallow `rotateY/rotateX` on `.lh-rig` and a
 * depth-weighted `translate3d` on every `.lh-layer` (`--d`), each on the
 * house soft-out curve. Floating layers add a 7–8s float and a staggered
 * pop-in entrance.
 *
 * Reduced motion: the pointer handlers are skipped, the media block freezes
 * the rig and layers at rest and drops the float/pop animations, and the
 * slab loses its tilt. Below `lg` only the slab and the ring card render,
 * the ring card as a plain card under the slab so nothing collides on phones.
 * The whole visual is `aria-hidden`; hero.tsx prints the sr-only summary.
 */

const css = `
.lh-rig {
  /* Always a containing block for the absolute .lh-layer cards: the 3D
     transform supplies one while motion is on, and reduced motion drops the
     transform, so the position must not depend on it. */
  position: relative;
  --hx: 0;
  --hy: 0;
  transform: perspective(1400px) rotateY(calc(var(--hx, 0) * 4deg)) rotateX(calc(var(--hy, 0) * -3deg));
  transition: transform 700ms var(--ease-out-soft, cubic-bezier(.2, .7, .2, 1));
}
.lh-layer {
  transform: translate3d(calc(var(--hx, 0) * var(--d, 0) * 9px), calc(var(--hy, 0) * var(--d, 0) * 8px), 0);
  transition: transform 700ms var(--ease-out-soft, cubic-bezier(.2, .7, .2, 1));
}
.lh-float {
  animation: lh-float var(--lh-ft, 7s) ease-in-out infinite;
  animation-delay: var(--lh-fd, 0s);
}
@keyframes lh-float {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(0, -7px, 0); }
}
.lh-pop {
  animation: lh-pop 900ms cubic-bezier(.2, .8, .2, 1) both;
  animation-delay: var(--lh-pd, 0ms);
}
@keyframes lh-pop {
  from { opacity: 0; transform: translate3d(0, 18px, 0) scale(.96); }
  to { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .lh-float, .lh-pop { animation: none; }
  .lh-rig, .lh-layer { transform: none; transition: none; }
}
`;

/** Depth for a `.lh-layer`; deeper layers travel further with the pointer. */
function layer(depth: number) {
  return { "--d": depth } as CSSProperties;
}
function enter(delayMs: number, floatSeconds: number, floatDelay: string) {
  return {
    "--lh-pd": `${delayMs}ms`,
    "--lh-ft": `${floatSeconds}s`,
    "--lh-fd": floatDelay,
  } as CSSProperties;
}

const CARD = "rounded-xl bg-card shadow-[inset_0_0_0_1px_var(--border)]";

export function HeroArt() {
  const reduced = useReducedMotion();
  const frame = useRef<HTMLDivElement>(null);

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduced || event.pointerType !== "mouse") return;
    const el = frame.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const clamp = (value: number) => Math.max(-1, Math.min(1, value));
    const hx = clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2);
    const hy = clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2);
    el.style.setProperty("--hx", hx.toFixed(3));
    el.style.setProperty("--hy", hy.toFixed(3));
  }
  function onPointerLeave() {
    const el = frame.current;
    if (!el) return;
    el.style.setProperty("--hx", "0");
    el.style.setProperty("--hy", "0");
  }

  const s = LANDING_SUMMARY;
  const points = s.trend.map((point) => ({ percentage: point.percentage }));
  const ring = s.radar;
  const latest = totals(LANDING_LATEST);
  const recent = [...LANDING_FULL_MOCKS].reverse().slice(1, 3);

  return (
    <div
      ref={frame}
      aria-hidden="true"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative mx-auto w-full max-w-[34rem] pb-6 lg:max-w-none lg:pb-24 lg:pt-4"
    >
      <style href="lh-hero-art" precedence="default">
        {css}
      </style>

      {/* Atmospheric washes behind the composition. */}
      <div className="pointer-events-none absolute -right-16 -top-10 size-[22rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-12 size-[16rem] rounded-full bg-muted blur-3xl" />

      <div className="lh-rig">
        {/* ---------- L0: the slab ---------- */}
        <div className="lh-layer relative z-10" style={layer(0)}>
          <div className="lg:-rotate-[1.2deg] motion-reduce:rotate-0">
            <div className="overflow-hidden rounded-xl bg-card shadow-[inset_0_0_0_1px_var(--border)]">
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
          </div>
        </div>

        {/* ---------- L1: the "Attempted" record card ----------
          Over the slab's top-right corner from lg; a plain card under the
          slab below it. */}
        <div
          className="lh-layer z-30 mt-3 ml-auto w-full max-w-[19rem] lg:absolute lg:right-0 lg:-top-10 lg:mt-0 lg:w-[38%] lg:min-w-[12.5rem] lg:max-w-none"
          style={layer(2)}
        >
          <div className="lh-pop" style={enter(450, 7, "-2s")}>
            <div className="lh-float">
              <div className={`p-2.5 ${CARD}`}>
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
            </div>
          </div>
        </div>

        {/* ---------- L2: answer breakdown, breaking the slab's bottom-left edge ---------- */}
        <div
          className="lh-layer absolute -left-4 top-full z-20 hidden w-[38%] min-w-[12rem] lg:block"
          style={layer(3)}
        >
          <div className="lh-pop" style={enter(650, 8, "-5s")}>
            <div className="lh-float">
              <div className="mt-[-1rem]">
                <div className={`p-2.5 ${CARD}`}>
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
                              />
                              <dt className="flex-1 truncate text-muted-foreground">
                                {row.label}
                              </dt>
                              <dd className="tabular-nums text-foreground">
                                {row.count}
                              </dd>
                            </div>
                          ))
                        : null}
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- L3: recent mocks, bottom-right ---------- */}
        <div
          className="lh-layer absolute -right-2 top-full z-20 hidden w-[34%] min-w-[11rem] lg:block"
          style={layer(4)}
        >
          <div className="lh-pop" style={enter(900, 7, "-1s")}>
            <div className="lh-float">
              <div className="mt-[-1rem]">
                <div className={`p-2.5 ${CARD}`}>
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
        </div>
      </div>
    </div>
  );
}
