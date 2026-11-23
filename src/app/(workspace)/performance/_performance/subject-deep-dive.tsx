"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion";
import { formatNumber as n } from "@/lib/domain";
import { shortDate } from "@/lib/format";
import type { Analytics } from "@/lib/analytics";
import type { DeepDiveSubject } from "@/lib/analytics";
import { Sparkline } from "@/components/sparkline";
import { Badge, type BadgeTone } from "@/components/badge";
import { Panel, subjectColor, subjectColorClass } from "./panel";
import { useSize, smoothPath } from "./use-size";
import { cn } from "@/lib/utils";

/**
 * Per-subject deep-dive: one expandable card per series in scope.
 *
 * Collapsed, each card carries the series' population, its score percentage,
 * an accuracy badge and a Hairline sparkline of its own tail — the sparkline
 * carries the subject's fixed chart hue, so a reader can tell subjects apart
 * before expanding. Expanded (one at a time — this is a ledger, not a
 * dashboard of dashboards) it draws the series' line with the same
 * smoothing and hover tooltip grammar as the evidence chart above; that
 * per-subject line is composed from the tokens (the Hairline set has no
 * sparse multi-date line chart). Series with no results stay disabled: one
 * cannot expand what has no numbers.
 */

const CHART_H = 172;
const PAD = { l: 34, r: 14, t: 14, b: 22 };

const accuracyTone = (accuracy: number | null): BadgeTone =>
  accuracy == null
    ? "neutral"
    : accuracy >= 80
      ? "success"
      : accuracy >= 65
        ? "warning"
        : "danger";

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
              "rounded-xl bg-card",
              isOpen ? "" : "shadow-[inset_0_0_0_1px_var(--border)]",
            )}
            style={
              isOpen
                ? { boxShadow: `inset 0 0 0 1.5px ${subjectColor(subject.id)}` }
                : undefined
            }
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
                  background: subjectColor(subject.id),
                }}
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-medium text-foreground">
                    {subject.name}
                  </span>
                  <span className="shrink-0 text-lg font-semibold leading-none tabular-nums text-foreground">
                    {subject.percentage == null ? "—" : `${n(subject.percentage)}%`}
                  </span>
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground tabular-nums">
                  <span>
                    {subject.count} result{subject.count === 1 ? "" : "s"} in view
                  </span>
                  <Badge tone={accuracyTone(subject.accuracy)} size="sm">
                    {subject.accuracy == null
                      ? "no accuracy"
                      : `${n(subject.accuracy)}% accuracy`}
                  </Badge>
                </span>
                <span className="mt-2 block h-11">
                  {subject.trend.length >= 2 ? (
                    <Sparkline
                      data={subject.trend.map((point) => ({
                        value: point.percentage,
                        date: shortDate(point.date),
                      }))}
                      height={44}
                      color={subjectColorClass(subject.id)}
                      variant="area"
                      strokeWidth={1.5}
                      suffix="%"
                      label={`${subject.name} score trend`}
                      className="h-11 w-full"
                    />
                  ) : subject.trend.length === 1 ? (
                    <span className="block text-[11px] leading-[2.75rem] text-muted-foreground">
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
                  className="overflow-hidden border-t border-border"
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

  const stroke = subjectColor(subject.id);

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
                  stroke="var(--border)"
                  strokeWidth={t === 0 ? 1 : 0.5}
                />
                <text
                  x={PAD.l - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="tabular-nums fill-muted-foreground text-[9px]"
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
              fill="var(--background)"
              stroke={stroke}
              strokeWidth="1.75"
            />
          ))}
          <text
            x={PAD.l}
            y={CHART_H - 6}
            className="tabular-nums fill-muted-foreground text-[9px]"
          >
            {shortDate(points[0]!.date)}
          </text>
          {points.length > 1 ? (
            <text
              x={width - PAD.r - 16}
              y={CHART_H - 6}
              textAnchor="end"
              className="tabular-nums fill-muted-foreground text-[9px]"
            >
              {shortDate(points[points.length - 1]!.date)}
            </text>
          ) : null}
        </svg>
      ) : null}
      {hoverIndex != null && points[hoverIndex] ? (
        <div
          role="status"
          className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-xl bg-popover px-2.5 py-1.5 text-popover-foreground shadow-[0_0_0_1px_var(--border)]"
        >
          <p className="truncate text-[11px] font-medium text-foreground">
            {points[hoverIndex].name}
          </p>
          <p className="tabular-nums text-[11px] text-muted-foreground">
            {shortDate(points[hoverIndex].date)} ·{" "}
            {n(points[hoverIndex].percentage)}% ·{" "}
            {n(points[hoverIndex].score)}/{n(points[hoverIndex].maxScore)}
          </p>
        </div>
      ) : null}
    </div>
  );
}
