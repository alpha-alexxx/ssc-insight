"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { drawPath } from "@/lib/motion";
import { shortDate } from "@/lib/format";
import { formatNumber as n } from "@/lib/domain";
import type { Analytics, PerformancePoint } from "@/lib/analytics";
import { TrendChart } from "@/components/trend-chart";
import { Panel, subjectColor } from "./panel";
import { useSize, smoothPath, niceDomain } from "./use-size";

/**
 * The evidence chart: the trend the findings claim, drawn out.
 *
 * One chart per scope grain. `full`/`sectional`/all render Hairline's
 * `TrendChart` over the scope's points — one value per saved result, read by
 * pointer or keys, with the target drawn in as the dashed comparison line
 * and the readout's note line carrying the result's own context (name,
 * platform, marks, accuracy, percentile).
 *
 * `subject` renders one hand-rolled line per subject series, time-scaled
 * across the union of dates, each in its fixed subject chart hue. A
 * multi-series sparse time chart is not in the Hairline chart set, so this
 * one is composed from the tokens directly (same treatment as the radar).
 */

const HEIGHT = 320;
const PAD = { l: 40, r: 18, t: 18, b: 30 };

const pct = (value: number | null | undefined, digits = 1) =>
  value == null ? "—" : `${n(value, digits)}%`;

export function TrendPanel({ analytics }: { analytics: Analytics }) {
  const target =
    analytics.target.comparable && analytics.target.percentage != null
      ? analytics.target.percentage
      : null;
  const points = analytics.trend.points;

  return (
    <Panel
      icon="trend"
      title="The evidence"
      description={
        analytics.scope === "subject"
          ? "One line per subject series, by attempt date."
          : "Score percentage per result, oldest to newest."
      }
    >
      {analytics.scope === "subject" ? (
        <SubjectLinesChart points={points} />
      ) : (
        <AreaTrendChart
          points={points}
          target={target}
          caption={
            analytics.scope === "full"
              ? "one point per saved full mock"
              : "one point per result in view"
          }
        />
      )}
    </Panel>
  );
}

/* ------------------------------------------------------- single-scope area */

function AreaTrendChart({
  points,
  target,
  caption,
}: {
  points: PerformancePoint[];
  target: number | null;
  caption: string;
}) {
  if (points.length === 0) return null;

  // Buckets are the attempts' own dates (UTC midnight, so an IST reader's
  // formatted day always matches the saved date). Two results on one day sit
  // on one bucket — the note line and the sr-only table still carry both.
  const buckets = points.map((p) => Date.parse(`${p.date}T00:00:00Z`));
  const values = points.map((p) => p.percentage);

  const note = (index: number): string => {
    const point = points[index]!;
    return [
      point.name,
      point.platform,
      `${n(point.score)}/${n(point.maxScore)}`,
      point.accuracy == null
        ? "no accuracy"
        : `${n(point.accuracy)}% accuracy`,
      point.percentile != null ? `${n(point.percentile)} %ile` : null,
    ]
      .filter(Boolean)
      .join(" · ");
  };

  return (
    <div>
      <TrendChart
        buckets={buckets}
        values={values}
        interval="day"
        kind="percent"
        label={`Score percentage across ${points.length} results${target != null ? ", with the target line" : ""}`}
        previous={target != null ? values.map(() => target) : undefined}
        previousLabel="target"
        note={note}
      />
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        Percentages, not raw marks — the scope&apos;s own grain, {caption}.
      </p>
    </div>
  );
}

/* ------------------------------------------------------ subject multi-line */

type SubjectSeries = {
  id: string;
  label: string;
  points: PerformancePoint[];
};

function seriesOf(points: PerformancePoint[]): SubjectSeries[] {
  const byId = new Map<string, SubjectSeries>();
  for (const point of points) {
    const series = byId.get(point.seriesId) ?? {
      id: point.seriesId,
      label: point.seriesLabel,
      points: [],
    };
    series.points.push(point);
    byId.set(point.seriesId, series);
  }
  for (const series of byId.values())
    series.points.sort((a, b) => a.date.localeCompare(b.date));
  return [...byId.values()].sort((a, b) => b.points.length - a.points.length);
}

function SubjectLinesChart({ points }: { points: PerformancePoint[] }) {
  const reduced = useReducedMotion();
  const [ref, width] = useSize<HTMLDivElement>();
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const series = useMemo(() => seriesOf(points), [points]);

  const dates = useMemo(
    () =>
      [...new Set(points.map((p) => p.date))].sort((a, b) => a.localeCompare(b)),
    [points],
  );
  const values = points.map((p) => p.percentage);
  const [min, max] = useMemo(() => niceDomain(values, null), [values]);

  const innerW = Math.max(0, width - PAD.l - PAD.r);
  const innerH = HEIGHT - PAD.t - PAD.b;
  const timeOf = (date: string) => new Date(`${date}T00:00:00+05:30`).getTime();
  const tMin = dates.length ? timeOf(dates[0]!) : 0;
  const tMax = dates.length ? timeOf(dates[dates.length - 1]!) : 1;
  const xAt = (date: string) =>
    dates.length > 1
      ? PAD.l + ((timeOf(date) - tMin) / Math.max(1, tMax - tMin)) * innerW
      : PAD.l + innerW / 2;
  const yAt = (v: number) => PAD.t + innerH * (1 - (v - min) / Math.max(1, max - min));

  if (points.length === 0) return null;

  const colorOf = (series: SubjectSeries) => subjectColor(series.id);

  const hoverPoints = hoverDate
    ? series
        .map((s) => ({
          series: s,
          point: s.points.find((p) => p.date === hoverDate),
        }))
        .filter((row): row is { series: SubjectSeries; point: PerformancePoint } =>
          Boolean(row.point),
        )
    : [];

  return (
    <div>
      {/* legend — also the touch fallback for the hover tooltip */}
      <div className="mb-2 flex flex-wrap gap-x-3 gap-y-1">
        {series.map((s) => (
          <span
            key={s.id}
            className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"
          >
            <span
              aria-hidden
              className="inline-block size-2 rounded-[2px]"
              style={{ background: colorOf(s) }}
            />
            {s.label}
          </span>
        ))}
      </div>
      <div ref={ref} className="relative">
        {width >= 40 && (
          <svg
            width={width}
            height={HEIGHT}
            role="img"
            aria-label={`Score percentage per subject across ${dates.length} attempt dates`}
            onPointerMove={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              const x = event.clientX - rect.left;
              const inner = Math.min(Math.max(x - PAD.l, 0), innerW);
              const ratio = innerW ? inner / innerW : 0;
              const target = tMin + ratio * (tMax - tMin);
              let nearest = dates[0]!;
              let bestGap = Infinity;
              for (const date of dates) {
                const gap = Math.abs(timeOf(date) - target);
                if (gap < bestGap) {
                  bestGap = gap;
                  nearest = date;
                }
              }
              setHoverDate(nearest);
            }}
            onPointerLeave={() => setHoverDate(null)}
          >
            {[0, 0.25, 0.5, 0.75, 1].map((t) => {
              const value = min + (max - min) * t;
              const y = yAt(value);
              return (
                <g key={t}>
                  <line
                    x1={PAD.l}
                    x2={width - PAD.r}
                    y1={y}
                    y2={y}
                    stroke="var(--border)"
                    strokeWidth={t === 0 || t === 1 ? 1 : 0.5}
                    strokeOpacity={t === 0 || t === 1 ? 1 : 0.6}
                  />
                  <text
                    x={PAD.l - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="tabular-nums fill-muted-foreground text-[10px]"
                  >
                    {Math.round(value)}%
                  </text>
                </g>
              );
            })}

            {dates.length > 1 ? (
              <text
                x={PAD.l}
                y={HEIGHT - 8}
                className="tabular-nums fill-muted-foreground text-[10px]"
              >
                {shortDate(dates[0]!)}
              </text>
            ) : null}
            {dates.length > 1 ? (
              <text
                x={width - PAD.r}
                y={HEIGHT - 8}
                textAnchor="end"
                className="tabular-nums fill-muted-foreground text-[10px]"
              >
                {shortDate(dates[dates.length - 1]!)}
              </text>
            ) : null}

            {series.map((s, si) => {
              const stroke = colorOf(s);
              const path = smoothPath(
                s.points.map(
                  (p) => [xAt(p.date), yAt(p.percentage)] as [number, number],
                ),
              );
              return (
                <g key={s.id}>
                  {s.points.length > 1 ? (
                    <motion.path
                      d={path}
                      fill="none"
                      stroke={stroke}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={reduced ? undefined : { pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={drawPath(1.15, 0.1 + si * 0.09)}
                    />
                  ) : (
                    <circle
                      cx={xAt(s.points[0]!.date)}
                      cy={yAt(s.points[0]!.percentage)}
                      r="3.5"
                      fill={stroke}
                    />
                  )}
                  {s.points.map((p) => (
                    <circle
                      key={p.key}
                      cx={xAt(p.date)}
                      cy={yAt(p.percentage)}
                      r={hoverDate === p.date ? 4 : 2.5}
                      fill="var(--background)"
                      stroke={stroke}
                      strokeWidth="1.75"
                    />
                  ))}
                </g>
              );
            })}

            {hoverDate ? (
              <line
                x1={xAt(hoverDate)}
                x2={xAt(hoverDate)}
                y1={PAD.t}
                y2={PAD.t + innerH}
                stroke="var(--foreground)"
                strokeWidth="1"
                strokeOpacity={0.4}
                strokeDasharray="3 3"
              />
            ) : null}
          </svg>
        )}

        {hoverDate && hoverPoints.length > 0 ? (
          <div
            role="status"
            className="pointer-events-none absolute top-2 z-10 min-w-44 rounded-xl bg-popover px-3 py-2 text-popover-foreground shadow-[0_0_0_1px_var(--border)]"
            style={{
              left: Math.min(
                Math.max(xAt(hoverDate) - 88, 0),
                Math.max(0, width - 184),
              ),
            }}
          >
            <p className="tabular-nums text-[11px] text-muted-foreground">
              {shortDate(hoverDate)}
            </p>
            <ul className="mt-1 space-y-0.5">
              {hoverPoints.map(({ series: s, point }) => (
                <li
                  key={s.id}
                  className="flex items-center gap-1.5 text-xs text-foreground tabular-nums"
                >
                  <span
                    aria-hidden
                    className="inline-block size-2 rounded-[2px]"
                    style={{ background: colorOf(s) }}
                  />
                  <span className="min-w-0 flex-1 truncate">{s.label}</span>
                  <span>{pct(point.percentage)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
