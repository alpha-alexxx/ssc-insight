"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, animate, motion, useReducedMotion } from "motion/react";
import { Check, Pause, Play, RotateCcw, TrendingUp } from "lucide-react";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { TypedLine } from "./atoms";
import {
  LANDING_FULL_MOCKS,
  LANDING_LATEST,
  LANDING_SUMMARY,
  LANDING_TARGET,
} from "./fixtures";
import type { LandingPlanData } from "./plan-facts";

/**
 * The film — an auto-playing, looping "product film": the workspace rendered
 * as a living miniature inside a cinematic 16:9 frame. Four scenes of six
 * seconds cycle forever; a stepper (one interval) drives the cut, and every
 * scene animates from its own mount, so pausing freezes the cut and restart
 * remounts the reel. Only transforms and opacity animate; each scene stays
 * under ~150 nodes.
 *
 * Deterministic + hydration-safe: scene 0 renders on the server exactly as on
 * the client, every figure derives from the same fixtures the mockups use
 * (the real scoring engine and the real study plan), and the seconds ticker
 * only starts in effects. Reduced motion renders the overview scene's final
 * state statically and hides the transport.
 */

const SCENE_MS = 6000;
const LOOP_S = 24; // four scenes × six seconds

const SCENES = [
  { label: "Overview", caption: "01 · OVERVIEW" },
  { label: "Plan", caption: "02 · PLAN" },
  { label: "Performance", caption: "03 · PERFORMANCE" },
  { label: "Coach", caption: "04 · COACH" },
] as const;

const CHAPTERS = [
  {
    no: "01",
    title: "Overview",
    body: "The metric strip assembles, the full-mock trend draws in against the target line, and today's plan assignments check themselves off.",
  },
  {
    no: "02",
    title: "Plan",
    body: "The 50-day rail fills to the sample day, its assignments clear one by one, and the day closes with its progress bar full.",
  },
  {
    no: "03",
    title: "Performance",
    body: "Subject bars settle against the target marker — the widest gap stays visible, straight from the latest full mock.",
  },
  {
    no: "04",
    title: "Coach",
    body: "Ask AI reads the ledger and answers with a revision order; the read-only pledge holds while it works.",
  },
];

/* ================================================================= section */

export function FilmSection({ plan }: { plan: LandingPlanData }) {
  return (
    <section id="film" aria-labelledby="film-title" className="relative">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
        <header className="max-w-2xl">
          <p className="section-label flex items-center gap-2.5">
            <span aria-hidden="true" className="h-px w-8 shrink-0 bg-accent" />
            <span className="shrink-0 text-[0.625rem] font-semibold uppercase tracking-[0.14em] tabular-nums text-accent">
              02
            </span>
            The film
          </p>
          <h2
            id="film-title"
            className="mt-5 max-w-[22ch] text-balance font-serif text-[clamp(1.75rem,3.2vw,2.75rem)] font-[450] leading-[1.05] tracking-[-0.03em]"
          >
            See it move. Twenty-four seconds of the real thing, looped.
          </h2>
          <p className="mt-4 max-w-prose text-[0.9375rem] leading-relaxed text-muted">
            A live rendering of the workspace, drawn with the app&apos;s own
            tokens and the sample data — not a screenshot, not a video file.
          </p>
        </header>
        <FilmPlayer plan={plan} />
        <ol className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-4">
          {CHAPTERS.map((chapter) => (
            <li key={chapter.no} className="border-t border-rule-soft pt-4">
              <p className="flex items-baseline gap-2">
                <span className="tabular-nums text-[0.625rem] font-semibold tracking-[0.14em] text-accent">
                  {chapter.no}
                </span>
                <span className="font-serif text-[0.9375rem] font-[500] tracking-[-0.01em] text-ink">
                  {chapter.title}
                </span>
              </p>
              <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted">
                {chapter.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ================================================================= player */

function TransportButton({
  onClick,
  children,
  label,
}: {
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex items-center gap-1.5 rounded-pill border border-rule px-3.5 py-2 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {children}
    </button>
  );
}

function FilmPlayer({ plan }: { plan: LandingPlanData }) {
  const reduced = useReducedMotion();
  const [scene, setScene] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [generation, setGeneration] = useState(0);

  // The cut: one interval steps the scene; every scene animates from mount.
  useEffect(() => {
    if (reduced || !playing) return;
    const id = window.setInterval(
      () => setScene((v) => (v + 1) % SCENES.length),
      SCENE_MS,
    );
    return () => window.clearInterval(id);
  }, [reduced, playing, generation]);

  // The timecode, wrapped to the loop length.
  useEffect(() => {
    if (reduced || !playing) return;
    const id = window.setInterval(() => setElapsed((v) => (v + 1) % LOOP_S), 1000);
    return () => window.clearInterval(id);
  }, [reduced, playing, generation]);

  function restart() {
    setScene(0);
    setElapsed(0);
    setGeneration((g) => g + 1);
    setPlaying(true);
  }

  return (
    <div className="mt-8">
      {/* transport row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {reduced ? (
          <p className="tabular-nums inline-flex items-center gap-2.5 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted">
            Static preview · motion reduced
          </p>
        ) : (
          <p className="tabular-nums inline-flex items-center gap-2.5 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted">
            <span aria-hidden="true" className="relative flex size-2">
              <span
                className={cn(
                  "absolute inline-flex size-full rounded-full bg-accent opacity-75",
                  playing ? "animate-ping motion-reduce:animate-none" : "opacity-40",
                )}
              />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            Live demo · 00:{String(elapsed).padStart(2, "0")} / 00:24 · looped
          </p>
        )}

        {!reduced ? (
          <div className="flex items-center gap-2">
            <TransportButton
              onClick={() => setPlaying((p) => !p)}
              label={playing ? "Pause the film" : "Play the film"}
            >
              {playing ? <Pause size={12} /> : <Play size={12} />}
              {playing ? "Pause" : "Play"}
            </TransportButton>
            <TransportButton onClick={restart} label="Restart the film from scene one">
              <RotateCcw size={12} />
              Restart
            </TransportButton>
          </div>
        ) : null}
      </div>

      {/* the frame */}
      <div className="relative mt-4 overflow-hidden rounded-[var(--radius-panel)] border border-rule-soft bg-ink text-paper">
        <div className="aspect-[16/9] w-full">
          {/* window bar */}
          <div className="flex h-8 items-center gap-2 border-b border-paper/15 px-3 sm:h-9 sm:px-4">
            <span aria-hidden="true" className="flex gap-1.5">
              <span className="size-1.5 rounded-[1px] bg-paper/25" />
              <span className="size-1.5 rounded-[1px] bg-paper/25" />
              <span className="size-1.5 rounded-[1px] bg-paper/25" />
            </span>
            <span className="truncate font-mono text-[0.625rem] text-paper/60">
              ssc insight · {SCENES[scene]?.label.toLowerCase()}
            </span>
            <span
              aria-hidden="true"
              className="tabular-nums ml-auto hidden items-center gap-1.5 font-mono text-[0.5625rem] tracking-[0.14em] text-paper/50 sm:flex"
            >
              {SCENES[scene]?.caption} / 04
            </span>
          </div>

          {/* the stage */}
          <div className="@container relative h-[calc(100%-2rem)] sm:h-[calc(100%-2.25rem)]">
            {reduced ? (
              <SceneOverview plan={plan} />
            ) : (
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${scene}-${generation}`}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  {scene === 0 ? <SceneOverview plan={plan} /> : null}
                  {scene === 1 ? <ScenePlan plan={plan} /> : null}
                  {scene === 2 ? <ScenePerformance /> : null}
                  {scene === 3 ? <SceneCoach /> : null}
                </motion.div>
              </AnimatePresence>
            )}

            {/* scene caption */}
            <p
              aria-hidden="true"
              className="pointer-events-none absolute bottom-3 left-3 font-mono text-[0.5625rem] tracking-[0.16em] text-paper/60 sm:left-5"
            >
              {SCENES[reduced ? 0 : scene]?.caption}
            </p>

            {/* loop timeline */}
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-paper/10">
              <div
                className={cn(
                  "h-full bg-accent",
                  reduced ? "hidden" : "transition-[width] duration-1000 ease-linear",
                )}
                style={reduced ? undefined : { width: `${((elapsed + 1) / LOOP_S) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================ shared bits */

/** Counts to a value once on mount (per scene); reduced motion lands instantly. */
function CountNumber({
  to,
  decimals = 0,
  delay = 0,
  suffix,
  className,
}: {
  to: number;
  decimals?: number;
  delay?: number;
  suffix?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [v, setV] = useState(reduced ? to : 0);
  const shown = reduced ? to : v;

  useEffect(() => {
    if (reduced) return;
    const controls = animate(0, to, {
      duration: 1.3,
      delay,
      ease: EASE,
      onUpdate: (latest) => setV(latest),
    });
    return () => controls.stop();
  }, [reduced, to, delay]);

  return (
    <span className={cn("tabular-nums", className)}>
      {shown.toFixed(decimals)}
      {suffix}
    </span>
  );
}

function SceneLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-paper/50">
      {children}
    </p>
  );
}

/* ================================================= scene 1 · the overview */

function SceneOverview({ plan }: { plan: LandingPlanData }) {
  const reduced = useReducedMotion();

  return (
    <div className="grid h-full grid-cols-[1.35fr_1fr] gap-3 px-3 pt-2.5 pb-7 sm:px-5 sm:pt-4 sm:pb-9">
      <div className="flex min-w-0 flex-col">
        <div className="flex items-baseline justify-between gap-2">
          <SceneLabel>Full mocks</SceneLabel>
          <p className="tabular-nums text-[0.5625rem] text-paper/50">
            target {Math.round(TARGET_PCT)}%
          </p>
        </div>

        <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1.5 border-y border-paper/25 py-2 @[560px]:grid-cols-4">
          {FILM_METRICS.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={reduced ? undefined : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.12, ease: EASE }}
            >
              <p className="text-[0.5rem] font-semibold uppercase tracking-[0.12em] text-paper/50">
                {metric.label}
              </p>
              <p className="mt-0.5 font-serif text-[0.875rem] leading-none tracking-[-0.02em] text-paper sm:text-[1rem]">
                <CountNumber to={metric.value} decimals={1} delay={0.25 + i * 0.12} suffix="%" />
              </p>
            </motion.div>
          ))}
        </div>

        {/* the trend, drawing in under the dashed target */}
        <div className="mt-2 min-h-0 flex-1">
          <svg
            viewBox={`0 0 ${FILM_W} ${FILM_H}`}
            preserveAspectRatio="none"
            aria-hidden="true"
            className="h-full max-h-[5.5rem] w-full"
          >
            {[25, 50, 75].map((tick) => (
              <line
                key={tick}
                x1={FILM_PAD_X}
                x2={FILM_W - FILM_PAD_X}
                y1={filmYAt(
                  (FILM_SCALE_MAX - FILM_SCALE_MIN) * (tick / 100) + FILM_SCALE_MIN,
                )}
                y2={filmYAt(
                  (FILM_SCALE_MAX - FILM_SCALE_MIN) * (tick / 100) + FILM_SCALE_MIN,
                )}
                stroke="var(--paper)"
                strokeOpacity="0.08"
                strokeWidth="0.75"
              />
            ))}
            <motion.line
              x1={FILM_PAD_X}
              x2={FILM_W - FILM_PAD_X}
              y1={FILM_TARGET_Y}
              y2={FILM_TARGET_Y}
              stroke="var(--accent)"
              strokeWidth="1"
              strokeDasharray="3 3"
              initial={reduced ? undefined : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.9 }}
              transition={{ duration: 0.9, delay: 1.5, ease: EASE }}
            />
            <motion.path
              d={FILM_TREND_PATH}
              fill="none"
              stroke="var(--paper)"
              strokeWidth="1.75"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              initial={reduced ? undefined : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.4, delay: 0.6, ease: EASE }}
            />
            {FILM_TREND_VALUES.length > 0 ? (
              <motion.circle
                cx={filmXAt(FILM_TREND_VALUES.length - 1)}
                cy={filmYAt(FILM_TREND_VALUES[FILM_TREND_VALUES.length - 1] ?? 0)}
                r="3"
                fill="var(--paper)"
                initial={reduced ? undefined : { opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 2, ease: EASE }}
              />
            ) : null}
          </svg>
        </div>
      </div>

      {/* today's assignments, checking themselves off */}
      <div className="flex min-w-0 flex-col border-l border-paper/15 pl-3">
        <SceneLabel>
          Day {plan.sampleDay.day} · {plan.sampleDay.phaseName}
        </SceneLabel>
        <ul className="mt-2 space-y-2">
          {filmTasks(plan).map((task, i) => (
            <FilmTaskRow
              key={task.name}
              name={task.name}
              meta={task.meta}
              delay={1.6 + i * 0.55}
            />
          ))}
        </ul>
        <motion.p
          initial={reduced ? undefined : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 3.6, ease: EASE }}
          className="mt-3 hidden w-fit items-center gap-1.5 rounded-pill border border-accent/40 bg-accent/15 px-2.5 py-1 text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-accent @[560px]:inline-flex"
        >
          Gap to target · {FILM_GAP_PTS} pts
        </motion.p>
      </div>
    </div>
  );
}

function FilmTaskRow({ name, meta, delay }: { name: string; meta: string; delay: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.li
      initial={reduced ? undefined : { opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay, ease: EASE }}
      className="flex items-center gap-2"
    >
      <span className="grid size-3.5 shrink-0 place-items-center rounded-[3px] border border-paper/40">
        <motion.span
          initial={reduced ? undefined : { opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: delay + 0.3, ease: EASE }}
          className="text-accent"
        >
          <Check size={9} strokeWidth={2.5} aria-hidden />
        </motion.span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.6875rem] leading-snug text-paper/90">
          {name}
        </span>
        <span className="tabular-nums block truncate text-[0.5625rem] leading-snug text-paper/50">
          {meta}
        </span>
      </span>
    </motion.li>
  );
}

/* ============================================================== scene 2 · plan */

function ScenePlan({ plan }: { plan: LandingPlanData }) {
  const reduced = useReducedMotion();
  const today = plan.sampleDay.day;
  const tasks = filmTasks(plan);

  return (
    <div className="grid h-full grid-cols-[1fr_1.35fr] gap-3 px-3 pt-2.5 pb-7 sm:px-5 sm:pt-4 sm:pb-9">
      <div className="flex min-w-0 flex-col">
        <SceneLabel>
          Plan · day {today} of {plan.days.length}
        </SceneLabel>
        <ul className="mt-2 space-y-2">
          {tasks.map((task, i) => (
            <FilmTaskRow key={task.name} name={task.name} meta={task.meta} delay={0.9 + i * 0.7} />
          ))}
        </ul>

        <div className="mt-auto pt-3">
          <div className="h-1 w-full bg-paper/10" aria-hidden="true">
            <motion.div
              className="h-full origin-left bg-accent"
              initial={reduced ? undefined : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, delay: 2.3, ease: EASE }}
              style={{ width: "100%" }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="tabular-nums text-[0.5625rem] text-paper/50">
              {tasks.length} of {tasks.length} assignments
            </p>
            <motion.p
              initial={reduced ? undefined : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: 3.3, ease: EASE }}
              className="inline-flex items-center gap-1 rounded-pill border border-accent/40 bg-accent/15 px-2 py-0.5 text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-accent"
            >
              <Check size={9} strokeWidth={2.5} aria-hidden />
              Day clear
            </motion.p>
          </div>
        </div>
      </div>

      {/* the 50-day rail, filling to the sample day */}
      <div className="min-w-0">
        <div
          className="grid grid-cols-[repeat(25,minmax(0,1fr))] gap-[3px] @[560px]:grid-cols-10 @[560px]:gap-1"
          aria-hidden="true"
        >
          {plan.days.map((day) => {
            const isPast = day.day < today;
            const isToday = day.day === today;
            return (
              <motion.span
                key={day.day}
                initial={reduced ? undefined : { opacity: 0.12 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 + (day.day - 1) * 0.045, ease: EASE }}
                className={cn(
                  "aspect-square w-full rounded-[2px]",
                  isToday ? "bg-accent" : isPast ? "bg-paper/60" : "bg-paper/15",
                )}
              />
            );
          })}
        </div>
        <div className="tabular-nums mt-2 flex items-center justify-between text-[0.5625rem] text-paper/50">
          <span>day 01</span>
          <motion.span
            initial={reduced ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 2.6, ease: EASE }}
            className="text-accent"
          >
            today · day {today}
          </motion.span>
          <span>day {plan.days.length}</span>
        </div>
      </div>
    </div>
  );
}

/* ======================================================= scene 3 · performance */

function ScenePerformance() {
  const reduced = useReducedMotion();
  const weakest = FILM_SUBJECT_BARS.reduce(
    (min, row, i) => (row.value < FILM_SUBJECT_BARS[min]?.value ? i : min),
    0,
  );

  return (
    <div className="grid h-full grid-cols-[1.4fr_1fr] gap-3 px-3 pt-2.5 pb-7 sm:px-5 sm:pt-4 sm:pb-9">
      <div className="flex min-w-0 flex-col">
        <div className="flex items-baseline justify-between gap-2">
          <SceneLabel>Subject standings · latest full mock</SceneLabel>
          <p className="tabular-nums text-[0.5625rem] text-paper/50">
            target {Math.round(TARGET_PCT)}%
          </p>
        </div>

        <div className="relative mt-2.5 flex min-h-0 flex-1 flex-col justify-center gap-2.5">
          {/* the target marker */}
          <span
            aria-hidden="true"
            className="absolute inset-y-0 hidden border-l border-dashed border-accent/70 @[380px]:block"
            style={{ left: `${Math.min(96, Math.max(4, TARGET_PCT))}%` }}
          >
            <motion.span
              initial={reduced ? undefined : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 2, ease: EASE }}
              className="absolute -top-1 right-1 whitespace-nowrap font-mono text-[0.5rem] tracking-[0.1em] text-accent"
            >
              TARGET
            </motion.span>
          </span>

          {FILM_SUBJECT_BARS.map((row, i) => (
            <SubjectBar
              key={row.label}
              label={row.label}
              value={row.value}
              delay={0.4 + i * 0.28}
              tone={i === weakest ? "accent" : "paper"}
            />
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-col justify-center gap-2 border-l border-paper/15 pl-3">
        <motion.p
          initial={reduced ? undefined : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 2.1, ease: EASE }}
        >
          <span className="font-serif text-[1.25rem] leading-none tracking-[-0.02em] text-paper @[560px]:text-[1.75rem]">
            <CountNumber to={FILM_PCT_DELTA} decimals={1} delay={2.2} suffix=" pts" />
          </span>
          <span className="mt-1 block text-[0.5625rem] text-paper/50">
            vs the previous full mock
          </span>
        </motion.p>
        <motion.p
          initial={reduced ? undefined : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 2.7, ease: EASE }}
          className="inline-flex w-fit items-center gap-1.5 rounded-pill border border-accent/40 bg-accent/15 px-2.5 py-1 text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-accent"
        >
          <TrendingUp size={10} aria-hidden />
          {FILM_WEAKEST_LABEL} is the widest gap
        </motion.p>
        <motion.p
          initial={reduced ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, delay: 3.2, ease: EASE }}
          className="text-[0.5625rem] leading-relaxed text-paper/50"
        >
          The bar in accent is the widest gap — the next sectional targets it.
        </motion.p>
      </div>
    </div>
  );
}

function SubjectBar({
  label,
  value,
  delay,
  tone,
}: {
  label: string;
  value: number;
  delay: number;
  tone: "paper" | "accent";
}) {
  const reduced = useReducedMotion();
  return (
    <div>
      <div className="tabular-nums flex items-baseline justify-between gap-2 text-[0.625rem]">
        <span className="text-paper/70">{label}</span>
        <CountNumber to={value} delay={delay} suffix="%" className="text-paper" />
      </div>
      <div className="mt-1 h-1.5 w-full bg-paper/10" aria-hidden="true">
        <motion.div
          className={cn("h-full origin-left", tone === "accent" ? "bg-accent" : "bg-paper/80")}
          initial={reduced ? undefined : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay, ease: EASE }}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

/* ============================================================ scene 4 · coach */

/** The coach's staged answer — two short terminal lines that fit at 375px. */
const COACH_ANSWER = [
  "Start with your widest-gap subject first.",
  "Then 25 GA questions · accuracy before speed.",
];

function SceneCoach() {
  const reduced = useReducedMotion();

  return (
    <div className="flex h-full flex-col px-3 pt-2.5 pb-7 sm:px-5 sm:pt-4 sm:pb-9">
      <div className="flex items-baseline justify-between gap-2">
        <SceneLabel>Ask AI · session only</SceneLabel>
        <p className="text-[0.5625rem] text-paper/50">reads aggregates only</p>
      </div>

      <div className="mt-1.5 flex min-h-0 flex-1 flex-col gap-1.5">
        <motion.p
          initial={reduced ? undefined : { opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: EASE }}
          className="max-w-[85%] self-end rounded-[10px] bg-paper/15 px-3 py-1.5 text-[0.6875rem] leading-snug text-paper"
        >
          What should I revise tonight?
        </motion.p>

        {/* thinking dots */}
        <motion.div
          initial={reduced ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.8, ease: EASE }}
          className="hidden items-center gap-1 px-1 @[480px]:flex"
          aria-hidden="true"
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="size-1 rounded-full bg-paper/60"
              animate={reduced ? undefined : { y: [0, -3, 0] }}
              transition={{ duration: 0.7, repeat: 3, delay: 0.9 + i * 0.15, ease: "easeInOut" }}
            />
          ))}
        </motion.div>

        <div className="max-w-[96%] self-start rounded-[10px] border border-paper/15 bg-paper/5 px-2.5 py-2">
          {COACH_ANSWER.map((line, i) => (
            <p
              key={line}
              className={cn(
                "font-mono text-[0.625rem] leading-snug text-paper/85",
                i > 0 && "mt-1",
              )}
            >
              <TypedLine
                text={line}
                duration={1.5}
                delay={1.4 + i * 1.7}
                caretClassName={i === COACH_ANSWER.length - 1 ? "bg-paper/70" : "bg-transparent"}
              />
            </p>
          ))}
        </div>
      </div>

      {/* the read-only pledge, where the prototype flashed a fake quota */}
      <div className="mt-2 flex items-center gap-2">
        <span className="text-[0.5625rem] uppercase tracking-[0.14em] text-paper/50">
          reads
        </span>
        <span className="tabular-nums text-[0.5625rem] text-paper/60">
          4 sources · 0 writes
        </span>
      </div>
    </div>
  );
}

/* ====================== module-level fixture derivations ======================
   Computed once from the same fixtures the mockups use — the landing never
   invents a number, and the film's captions stay truthful. */

const TARGET_PCT = (LANDING_TARGET / 390) * 100;

const FILM_METRICS: { label: string; value: number }[] = [
  { label: "Latest", value: LANDING_SUMMARY.latestPercentage ?? 0 },
  { label: "Average", value: LANDING_SUMMARY.averagePercentage ?? 0 },
  { label: "Best", value: LANDING_SUMMARY.bestPercentage ?? 0 },
  { label: "Accuracy", value: LANDING_SUMMARY.weightedAccuracy ?? 0 },
];

const FILM_GAP_PTS = Math.max(0, Math.round(LANDING_TARGET - LANDING_SUMMARY.latestScore));

/** The sample day's first assignments, as the film's check-off rows. */
const filmTasks = (plan: LandingPlanData) =>
  plan.sampleDay.tasks.slice(0, 3).map((task) => ({
    name: task.name,
    meta:
      task.questions > 0
        ? `${task.questions} questions${task.marks > 0 ? ` · ${task.marks} marks` : ""}`
        : "open-ended",
  }));

/** Trend geometry from the real full-mock projection. */
const FILM_W = 320;
const FILM_H = 84;
const FILM_PAD_X = 4;
const FILM_PAD_Y = 9;
const FILM_TREND_VALUES = LANDING_SUMMARY.trend
  .map((p) => p.percentage)
  .filter((v): v is number => v != null);
const FILM_SCALE_MIN = Math.min(...FILM_TREND_VALUES, TARGET_PCT) - 6;
const FILM_SCALE_MAX = Math.max(...FILM_TREND_VALUES, TARGET_PCT) + 6;
const filmXAt = (i: number) =>
  FILM_TREND_VALUES.length > 1
    ? FILM_PAD_X + (i / (FILM_TREND_VALUES.length - 1)) * (FILM_W - FILM_PAD_X * 2)
    : FILM_W / 2;
const filmYAt = (v: number) =>
  FILM_PAD_Y +
  (FILM_H - FILM_PAD_Y * 2) *
    (1 - (v - FILM_SCALE_MIN) / Math.max(1, FILM_SCALE_MAX - FILM_SCALE_MIN));
const FILM_TREND_PATH = FILM_TREND_VALUES.map(
  (v, i) => `${i === 0 ? "M" : "L"}${filmXAt(i).toFixed(1)} ${filmYAt(v).toFixed(1)}`,
).join(" ");
const FILM_TARGET_Y = filmYAt(TARGET_PCT).toFixed(1);

/** Merit percentage of one attempt, from its own marking snapshot. */
function attemptMeritPercentage(attempt: (typeof LANDING_FULL_MOCKS)[number]): number | null {
  let meritQuestions = 0;
  let merit = 0;
  for (const row of attempt.subjects) {
    if (row.qualifying) continue;
    meritQuestions += row.questions;
    merit += row.correct * attempt.marking.correct;
    merit -= row.incorrect * attempt.marking.incorrect;
  }
  const max = meritQuestions * attempt.marking.correct;
  return max > 0 ? (merit / max) * 100 : null;
}

const FILM_PCT_DELTA = (() => {
  const previous = LANDING_FULL_MOCKS[LANDING_FULL_MOCKS.length - 2];
  const previousPct = previous ? attemptMeritPercentage(previous) : null;
  return previousPct != null && LANDING_SUMMARY.latestPercentage != null
    ? LANDING_SUMMARY.latestPercentage - previousPct
    : 0;
})();

/** Subject standings from the LATEST full mock's own marking snapshot. */
const SUBJECT_SHORT: Record<string, string> = {
  quant: "Quant",
  reasoning: "Reasoning",
  english: "English",
  ga: "GA",
  computer: "Computer",
};

const FILM_SUBJECT_BARS = LANDING_LATEST.subjects
  .filter((row) => !row.qualifying)
  .map((row) => {
    const max = row.questions * LANDING_LATEST.marking.correct;
    const merit =
      row.correct * LANDING_LATEST.marking.correct -
      row.incorrect * LANDING_LATEST.marking.incorrect;
    return {
      label: SUBJECT_SHORT[row.subjectId] ?? row.subjectId,
      value: max > 0 ? (merit / max) * 100 : 0,
    };
  });

const FILM_WEAKEST_INDEX = FILM_SUBJECT_BARS.reduce(
  (min, row, i) => (row.value < FILM_SUBJECT_BARS[min]?.value ? i : min),
  0,
);
const FILM_WEAKEST_LABEL = (
  FILM_SUBJECT_BARS[FILM_WEAKEST_INDEX]?.label ?? "—"
).toUpperCase();
