"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion";
import { formatNumber as n } from "@/lib/domain";
import { shortDate } from "@/lib/format";
import type { Analytics } from "@/lib/analytics";
import type { DeepDiveSubject } from "@/lib/analytics";
import { Panel } from "@/components/dashboard-panels";
import { Sparkline } from "@/components/shared/charts/sparkline";
import { cn } from "@/lib/utils";
import { useSize, smoothPath } from "./use-size";

/**
 * Per-subject deep-dive: one expandable card per series in scope.
 *
 * Collapsed, each card carries the series' population, its score percentage,
 * an accuracy chip and a sparkline of its own tail. Expanded (one at a time —
 * this is a ledger, not a dashboard of dashboards) it draws the series'
 * line with the same smoothing and hover tooltip grammar as the evidence
 * chart above. Series with no results stay disabled: one cannot expand
 * what has no numbers.
 */

const CHART_H = 172;
const PAD = { l: 34, r: 14, t: 14, b: 22 };

const SUBJECT_TOKENS: Record<string, string> = {
  quant: "var(--chart-quant)",
  reasoning: "var(--chart-reasoning)",
  english: "var(--chart-english)",
  ga: "var(--chart-ga)",
  computer: "var(--chart-computer)",
};

const accuracyTone = (accuracy: number | null) =>
  accuracy == null
    ? "neutral"
    : accuracy >= 80
      ? "positive"
      : accuracy >= 65
        ? "warning"
        : "danger";

const TONE_CLASS: Record<string, string> = {
  positive: "border-positive/40 text-positive",
  warning: "border-warning/40 text-warning",
  danger: "border-danger/40 text-danger",
  neutral: "border-rule-soft text-muted",
};

export function SubjectDeepDive({ analytics }: { analytics: Analytics }) {
  const subjects = analytics.deepDive ?? [];
  if (!subjects.length) return null;

  return (
    <Panel
      icon="layers"
      title="Subject deep-dive"
      description="One card per series in scope — expand for the line behind the number."
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <DeepDiveCards subjects={subjects} />
      </div>
    </Panel>
  );
}

function DeepDiveCards({ subjects }: { subjects: DeepDiveSubject[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <>
      {subjects.map((subject) => {
        const expandable = subject.trend.length > 0;
        const isOpen = open === subject.id;
        const panelId = `deep-dive-${subject.id}`;
        return (
          <article
            key={subject.id}
            className={cn(
              "rounded-card border border-rule-soft bg-paper",
              isOpen && "border-rule",
            )}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              disabled={!expandable}
              onClick={() => setOpen(isOpen ? null : subject.id)}
              className="flex w-full items-start gap-3 px-3.5 py-3 text-left disabled:cursor-default"
            >
              <span
                aria-hidden
                className="mt-1 inline-block size-2.5 shrink-0 rounded-[2px]"
                style={{
                  background: SUBJECT_TOKENS[subject.id] ?? "var(--chart-score)",
                }}
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-medium text-ink">
                    {subject.name}
                  </span>
                  <span className="tabular-nums shrink-0 font-serif text-lg leading-none text-ink">
                    {subject.percentage == null ? "—" : `${n(subject.percentage)}%`}
                  </span>
                </span>
                <span className="tabular-nums mt-1 flex items-center gap-2 text-[0.625rem] text-muted">
                  <span>
                    {subject.count} result{subject.count === 1 ? "" : "s"} in view
                  </span>
                  <span
                    className={cn(
                      "rounded-pill border px-1.5",
                      TONE_CLASS[accuracyTone(subject.accuracy)],
                    )}
                  >
                    {subject.accuracy == null ? "no accuracy" : `${n(subject.accuracy)}% accuracy`}
                  </span>
                </span>
                <span className="mt-2 block h-11">
                  {subject.trend.length >= 2 ? (
                    <Sparkline
                      points={subject.trend.map((point) => ({
                        date: point.date,
                        percentage: point.percentage,
                      }))}
                      className="h-11 w-full"
                    />
                  ) : subject.trend.length === 1 ? (
                    <span className="block text-[0.625rem] leading-[2.75rem] text-muted">
                      One result — a trend appears after the second.
                    </span>
                  ) : null}
                </span>
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && expandable ? (
                <motion.div
                  key="details"
                  id={panelId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: EASE }}
                  className="overflow-hidden border-t border-rule-soft"
                >
                  <SubjectLineChart subject={subject} />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </article>
        );
      })}
    </>
  );
}

/** The expanded card's line chart — same grammar as the evidence chart, smaller. */
function SubjectLineChart({ subject }: { subject: DeepDiveSubject }) {
  const reduced = useReducedMotion();
  const [ref, width] = useSize<HTMLDivElement>();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const points = subject.trend;

  const values = points.map((point) => point.percentage);
  const min = Math.max(0, Math.floor((Math.min(...values) - 4) / 10) * 10);
  const max = Math.min(100, Math.ceil((Math.max(...values) + 4) / 10) * 10);
  const span = Math.max(20, max - min);

  const innerW = Math.max(0, width - PAD.l - PAD.r);
  const innerH = CHART_H - PAD.t - PAD.b;
  const xAt = (i: number) =>
    points.length > 1
      ? PAD.l + (i / (points.length - 1)) * innerW
      : PAD.l + innerW / 2;
  const yAt = (v: number) => PAD.t + innerH * (1 - (v - min) / span);

  const stroke = SUBJECT_TOKENS[subject.id] ?? "var(--chart-score)";

  return (
    <div ref={ref} className="relative px-2 py-2">
      {width >= 40 && points.length > 0 ? (
        <svg
          width={width - 16}
          height={CHART_H}
          role="img"
          aria-label={`${subject.name} score percentage across ${points.length} results`}
          onPointerMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const inner = Math.min(Math.max(x - PAD.l, 0), innerW);
            const index =
              points.length > 1
                ? Math.round((inner / innerW) * (points.length - 1))
                : 0;
            setHoverIndex(index);
          }}
          onPointerLeave={() => setHoverIndex(null)}
        >
          {[0, 0.5, 1].map((t) => {
            const value = min + span * t;
            const y = yAt(value);
            return (
              <g key={t}>
                <line
                  x1={PAD.l}
                  x2={width - PAD.r - 16}
                  y1={y}
                  y2={y}
                  stroke="var(--rule-soft)"
                  strokeWidth={t === 0 ? 1 : 0.5}
                />
                <text
                  x={PAD.l - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="tabular-nums fill-[var(--muted)] text-[9px]"
                >
                  {Math.round(value)}%
                </text>
              </g>
            );
          })}
          <motion.path
            d={smoothPath(
              points.map(
                (point, i) => [xAt(i), yAt(point.percentage)] as [number, number],
              ),
            )}
            fill="none"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduced ? undefined : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease: EASE }}
          />
          {points.map((point, i) => (
            <circle
              key={point.key}
              cx={xAt(i)}
              cy={yAt(point.percentage)}
              r={hoverIndex === i ? 4 : 2.75}
              fill="var(--paper)"
              stroke={stroke}
              strokeWidth="1.75"
            />
          ))}
          <text
            x={PAD.l}
            y={CHART_H - 6}
            className="tabular-nums fill-[var(--muted)] text-[9px]"
          >
            {shortDate(points[0]!.date)}
          </text>
          {points.length > 1 ? (
            <text
              x={width - PAD.r - 16}
              y={CHART_H - 6}
              textAnchor="end"
              className="tabular-nums fill-[var(--muted)] text-[9px]"
            >
              {shortDate(points[points.length - 1]!.date)}
            </text>
          ) : null}
        </svg>
      ) : null}
      {hoverIndex != null && points[hoverIndex] ? (
        <div
          role="status"
          className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-card border border-rule-soft bg-paper px-2.5 py-1.5"
        >
          <p className="truncate text-[0.6875rem] font-medium text-ink">
            {points[hoverIndex].name}
          </p>
          <p className="tabular-nums text-[0.625rem] text-muted">
            {shortDate(points[hoverIndex].date)} ·{" "}
            {n(points[hoverIndex].percentage)}% ·{" "}
            {n(points[hoverIndex].score)}/{n(points[hoverIndex].maxScore)}
          </p>
        </div>
      ) : null}
    </div>
  );
}
