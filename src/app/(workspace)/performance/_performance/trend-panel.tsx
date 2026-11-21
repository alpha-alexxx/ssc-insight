"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE, drawPath } from "@/lib/motion";
import { shortDate } from "@/lib/format";
import { formatNumber as n } from "@/lib/domain";
import type { Analytics, PerformancePoint } from "@/lib/analytics";
import { Panel } from "@/components/dashboard-panels";
import { useSize, smoothPath, niceDomain } from "./use-size";

/**
 * The evidence chart: the trend the findings claim, drawn out.
 *
 * One chart per scope grain. `full`/`sectional`/`all` render a single
 * smoothed area over the scope's points (x is attempt order, not time
 * scale — the gaps between sittings vary too much to read as a clock).
 * `subject` renders one line per subject series, time-scaled across the
 * union of dates, each in its fixed chart color.
 *
 * Hand-rolled SVG on purpose: the draw-in, the crosshair snap and the
 * tooltip all read one payload — `analytics.trend.points` — and every
 * figure the tooltip shows is a field that payload already carries.
 */

const HEIGHT = 320;
const PAD = { l: 40, r: 18, t: 18, b: 30 };

/** Subject chart-color identity, fixed per subject across every palette. */
const SUBJECT_TOKENS: Record<string, string> = {
  quant: "var(--chart-quant)",
  reasoning: "var(--chart-reasoning)",
  english: "var(--chart-english)",
  ga: "var(--chart-ga)",
  computer: "var(--chart-computer)",
};

const pct = (value: number | null | undefined, digits = 1) =>
  value == null ? "—" : `${n(value, digits)}%`;

type TrendTooltip = {
  x: number;
  point: PerformancePoint;
} | null;

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
  const reduced = useReducedMotion();
  const [ref, width] = useSize<HTMLDivElement>();
  const [hover, setHover] = useState<TrendTooltip>(null);

  const values = points.map((p) => p.percentage);
  const [min, max] = useMemo(() => niceDomain(values, target), [values, target]);

  const innerW = Math.max(0, width - PAD.l - PAD.r);
  const innerH = HEIGHT - PAD.t - PAD.b;
  const xAt = (i: number) =>
    points.length > 1
      ? PAD.l + (i / (points.length - 1)) * innerW
      : PAD.l + innerW / 2;
  const yAt = (v: number) => PAD.t + innerH * (1 - (v - min) / Math.max(1, max - min));

  const path = useMemo(
    () =>
      smoothPath(
        points.map((p, i) => [xAt(i), yAt(p.percentage)] as [number, number]),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- geometry follows points+width
    [points, width, min, max],
  );

  const tickIndices = useMemo(() => {
    const last = points.length - 1;
    if (last < 3) return points.map((_, i) => i);
    return [0, Math.round(last / 3), Math.round((2 * last) / 3), last];
  }, [points.length]);

  if (points.length === 0) return null;

  function moveHandler(event: React.PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const inner = Math.min(Math.max(x - PAD.l, 0), innerW);
    const index =
      points.length > 1
        ? Math.round((inner / innerW) * (points.length - 1))
        : 0;
    setHover({ x: xAt(index), point: points[index]! });
  }

  return (
    <div>
      <div ref={ref} className="relative">
        {width >= 40 && (
          <svg
            width={width}
            height={HEIGHT}
            role="img"
            aria-label={`Score percentage across ${points.length} results${target != null ? ", with the target line" : ""}`}
            onPointerMove={moveHandler}
            onPointerLeave={() => setHover(null)}
          >
            {/* y grid + labels */}
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
                    stroke="var(--rule-soft)"
                    strokeWidth={t === 0 || t === 1 ? 1 : 0.5}
                    strokeOpacity={t === 0 || t === 1 ? 1 : 0.6}
                  />
                  <text
                    x={PAD.l - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="tabular-nums fill-[var(--muted)] text-[10px]"
                  >
                    {Math.round(value)}%
                  </text>
                </g>
              );
            })}

            {/* x ticks */}
            {tickIndices.map((i) => (
              <text
                key={i}
                x={xAt(i)}
                y={HEIGHT - 8}
                textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}
                className="tabular-nums fill-[var(--muted)] text-[10px]"
              >
                {shortDate(points[i]!.date)}
              </text>
            ))}

            {/* target line */}
            {target != null && target >= min && target <= max ? (
              <g>
                <line
                  x1={PAD.l}
                  x2={width - PAD.r}
                  y1={yAt(target)}
                  y2={yAt(target)}
                  stroke="var(--chart-target)"
                  strokeWidth="1.25"
                  strokeDasharray="4 4"
                />
                <text
                  x={width - PAD.r}
                  y={yAt(target) - 5}
                  textAnchor="end"
                  className="fill-[var(--chart-target)] text-[9px] font-semibold uppercase tracking-[0.1em]"
                >
                  Target {Math.round(target)}%
                </text>
              </g>
            ) : null}

            {/* the area + line */}
            <motion.path
              d={`${path} L${xAt(points.length - 1)},${PAD.t + innerH} L${xAt(0)},${PAD.t + innerH} Z`}
              fill="var(--chart-score)"
              initial={reduced ? undefined : { opacity: 0 }}
              animate={{ opacity: 0.09 }}
              transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
            />
            <motion.path
              d={path}
              fill="none"
              stroke="var(--chart-score)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduced ? undefined : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={drawPath(1.15)}
            />

            {/* points */}
            {points.map((point, i) => (
              <motion.circle
                key={point.key}
                cx={xAt(i)}
                cy={yAt(point.percentage)}
                r={hover?.point.key === point.key ? 4.5 : 3}
                fill="var(--paper)"
                stroke="var(--chart-score)"
                strokeWidth="1.75"
                initial={reduced ? undefined : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.55 + i * 0.04, ease: EASE }}
              />
            ))}

            {/* crosshair */}
            {hover ? (
              <line
                x1={hover.x}
                x2={hover.x}
                y1={PAD.t}
                y2={PAD.t + innerH}
                stroke="var(--rule)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            ) : null}
          </svg>
        )}

        {hover ? (
          <div
            role="status"
            className="pointer-events-none absolute top-2 z-10 min-w-44 rounded-card border border-rule-soft bg-paper px-3 py-2"
            style={{
              left: Math.min(Math.max(hover.x - 88, 0), Math.max(0, width - 184)),
            }}
          >
            <p className="truncate text-xs font-medium text-ink">
              {hover.point.name}
            </p>
            <p className="tabular-nums mt-0.5 text-[0.625rem] text-muted">
              {shortDate(hover.point.date)} · {hover.point.platform}
            </p>
            <p className="tabular-nums mt-1 text-xs text-ink">
              {pct(hover.point.percentage)} · {n(hover.point.score)}/
              {n(hover.point.maxScore)}
            </p>
            <p className="tabular-nums text-[0.625rem] text-muted">
              Accuracy {pct(hover.point.accuracy)}
              {hover.point.percentile != null
                ? ` · ${n(hover.point.percentile)} %ile`
                : ""}
            </p>
          </div>
        ) : null}
      </div>
      <p className="mt-2 text-[0.6875rem] leading-relaxed text-muted">
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

  const colorOf = (series: SubjectSeries) =>
    SUBJECT_TOKENS[series.id] ?? "var(--chart-score)";

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
            className="inline-flex items-center gap-1.5 text-[0.6875rem] text-muted"
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
                    stroke="var(--rule-soft)"
                    strokeWidth={t === 0 || t === 1 ? 1 : 0.5}
                    strokeOpacity={t === 0 || t === 1 ? 1 : 0.6}
                  />
                  <text
                    x={PAD.l - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="tabular-nums fill-[var(--muted)] text-[10px]"
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
                className="tabular-nums fill-[var(--muted)] text-[10px]"
              >
                {shortDate(dates[0]!)}
              </text>
            ) : null}
            {dates.length > 1 ? (
              <text
                x={width - PAD.r}
                y={HEIGHT - 8}
                textAnchor="end"
                className="tabular-nums fill-[var(--muted)] text-[10px]"
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
                      fill="var(--paper)"
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
                stroke="var(--rule)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            ) : null}
          </svg>
        )}

        {hoverDate && hoverPoints.length > 0 ? (
          <div
            role="status"
            className="pointer-events-none absolute top-2 z-10 min-w-44 rounded-card border border-rule-soft bg-paper px-3 py-2"
            style={{
              left: Math.min(
                Math.max(xAt(hoverDate) - 88, 0),
                Math.max(0, width - 184),
              ),
            }}
          >
            <p className="tabular-nums text-[0.625rem] text-muted">
              {shortDate(hoverDate)}
            </p>
            <ul className="mt-1 space-y-0.5">
              {hoverPoints.map(({ series: s, point }) => (
                <li
                  key={s.id}
                  className="tabular-nums flex items-center gap-1.5 text-xs text-ink"
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
