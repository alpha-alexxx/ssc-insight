"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion";
import { formatNumber as n } from "@/lib/domain";
import type { Analytics } from "@/lib/analytics";
import { Panel, subjectColor } from "./panel";
import { InsightCallout } from "./insight-callout";

/**
 * The subject shape: one five-axis radar of the scoped profile, drawn by
 * hand so the polygon can grow from the centre under reduced-motion-aware
 * springs and honest blanks.
 *
 * A radar is a documented gap in the Hairline chart set, so this one is
 * composed from the tokens: subject vertices carry the global chart hues
 * (--chart-1..5), the rings/axes draw in the border token and their labels
 * in muted-foreground, and the scope polygon fills in primary.
 *
 * Reads `analytics.radial` (the scoped stacks) via `subjectRanking()`'s
 * population rule: a stack with no results sits at radius 0 — an honest
 * blank, never a zero — and gets named in the footnote rather than drawn
 * as if it were attempted and failed.
 *
 * Why this file changed: the radar was a fixed 19rem square beside a short
 * callout, and its viewBox put the centre at x = 170 of 340, so the labels
 * on the right-hand axes ran past the edge and were clipped. On wide
 * screens that left a narrow chart with a large empty field to its right.
 * Now:
 *   · the viewBox is wider than tall and centred, so every label fits;
 *   · the chart scales to its column (container query, not viewport), and
 *   · beside it (or under it, when the column is narrow) sits a ranked list
 *     of the series with a bar each — real data that fills the space the
 *     old layout left blank.
 *
 * Note: this radar is the SCOPE's shape. The dashboard's `whereYouStand`
 * radar stays global; here the scope switcher is the point.
 */

const W = 400;
const H = 350;
const CX = 200;
const CY = 175;
const R = 110;

type Axis = {
  id: string;
  short: string;
  percentage: number | null;
  attemptCount: number;
};

export function RadarPanel({ analytics }: { analytics: Analytics }) {
  const reduced = useReducedMotion();

  const axes: Axis[] = analytics.radial.map((stack) => ({
    id: stack.id,
    short: stack.label,
    percentage: stack.total > 0 ? stack.scorePercentage : null,
    attemptCount: stack.count,
  }));

  const populated = axes.filter(
    (axis): axis is Axis & { percentage: number } => axis.percentage != null,
  );
  const ranked = [...populated].sort((a, b) => b.percentage - a.percentage);
  const top = ranked[0];
  const bottom = ranked[ranked.length - 1];
  const spread =
    top && bottom && populated.length >= 2
      ? top.percentage - bottom.percentage
      : 0;
  const empty = axes.filter((axis) => axis.percentage == null);

  const angle = (index: number) =>
    (Math.PI * 2 * index) / Math.max(1, axes.length) - Math.PI / 2;
  const pointAt = (index: number, radius: number) => [
    CX + Math.cos(angle(index)) * radius,
    CY + Math.sin(angle(index)) * radius,
  ];
  const radiusOf = (axis: Axis) =>
    axis.percentage == null ? 0 : Math.max(4, (axis.percentage / 100) * R);
  const polygon = axes
    .map((axis, i) => pointAt(i, radiusOf(axis)).join(","))
    .join(" ");

  return (
    <Panel
      icon="target"
      title="The shape"
      description="Score percentage per series in this scope."
    >
      <div className="@container h-full">
        <div className="grid h-full grid-cols-1 items-center gap-5 @xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] @xl:gap-6">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="mx-auto block h-auto w-full max-w-[26rem]"
            role="img"
            aria-label={`Subject shape across ${populated.length} populated series`}
          >
            {/* rings */}
            {[25, 50, 75].map((ring) => (
              <circle
                key={ring}
                cx={CX}
                cy={CY}
                r={(ring / 100) * R}
                fill="none"
                stroke="var(--border)"
                strokeWidth="0.75"
                strokeDasharray="3 4"
              />
            ))}
            <circle
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke="var(--border)"
              strokeWidth="1"
            />
            {/* scale labels on the top axis */}
            <text
              x={CX + 4}
              y={CY - R + 12}
              className="tabular-nums fill-muted-foreground text-[9px]"
            >
              100
            </text>
            <text
              x={CX + 4}
              y={CY - R / 2 + 4}
              className="tabular-nums fill-muted-foreground text-[9px]"
            >
              50
            </text>

            {/* axes */}
            {axes.map((axis, i) => {
              const [x, y] = pointAt(i, R);
              return (
                <line
                  key={axis.id}
                  x1={CX}
                  y1={CY}
                  x2={x}
                  y2={y}
                  stroke="var(--border)"
                  strokeWidth="0.75"
                />
              );
            })}

            {/* the polygon */}
            {populated.length > 0 ? (
              <motion.polygon
                points={polygon}
                fill="var(--primary)"
                fillOpacity={0.14}
                stroke="var(--primary)"
                strokeWidth="1.5"
                strokeLinejoin="round"
                initial={
                  reduced
                    ? undefined
                    : {
                        scale: 0.4,
                        opacity: 0,
                        transformOrigin: `${CX}px ${CY}px`,
                      }
                }
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
              />
            ) : null}

            {/* vertices + labels */}
            {axes.map((axis, i) => {
              const [vx, vy] = pointAt(i, radiusOf(axis));
              const [lx, ly] = pointAt(i, R + 16);
              const cos = Math.cos(angle(i));
              return (
                <g key={axis.id}>
                  {axis.percentage != null ? (
                    <motion.circle
                      cx={vx}
                      cy={vy}
                      r={3.25}
                      fill={subjectColor(axis.id)}
                      stroke="var(--background)"
                      strokeWidth="1.5"
                      initial={reduced ? undefined : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: 0.3,
                        delay: 0.75 + i * 0.06,
                        ease: EASE,
                      }}
                    />
                  ) : (
                    <circle
                      cx={pointAt(i, 3)[0]}
                      cy={pointAt(i, 3)[1]}
                      r="2"
                      fill="none"
                      stroke="var(--foreground)"
                      strokeOpacity={0.4}
                      strokeWidth="1"
                    />
                  )}
                  <text
                    x={lx}
                    y={ly + 3}
                    textAnchor={
                      Math.abs(cos) < 0.3 ? "middle" : cos > 0 ? "start" : "end"
                    }
                    className="fill-muted-foreground text-[11px] font-medium"
                  >
                    {axis.short}
                    {axis.percentage != null ? (
                      <tspan className="tabular-nums fill-foreground">
                        {" "}
                        {Math.round(axis.percentage)}%
                      </tspan>
                    ) : null}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="min-w-0 space-y-4">
            {/* ranked series — the numbers behind the polygon */}
            <ol
              aria-label="Series ranked by score percentage"
              className="space-y-2.5"
            >
              {ranked.map((axis, i) => (
                <li key={axis.id} className="min-w-0">
                  <div className="flex items-center gap-2 text-[12.5px]">
                    <span className="w-4 shrink-0 text-[11px] tabular-nums text-muted-foreground">
                      {i + 1}
                    </span>
                    <span
                      aria-hidden="true"
                      className="size-2 shrink-0 rounded-[2px]"
                      style={{ background: subjectColor(axis.id) }}
                    />
                    <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                      {axis.short}
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums text-foreground">
                      {n(axis.percentage)}%
                    </span>
                  </div>
                  <div className="ml-6 mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                    {/* width is the data; the scale-in is only the entrance */}
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: subjectColor(axis.id),
                        width: `${Math.min(100, axis.percentage)}%`,
                        transformOrigin: "left",
                      }}
                      initial={reduced ? undefined : { scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{
                        duration: 0.6,
                        ease: EASE,
                        delay: 0.2 + i * 0.06,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ol>

            <InsightCallout title="Reading the shape">
              {populated.length === 0 ? (
                <>
                  Nothing has been attempted in this scope yet, so there is no
                  shape to read — the radar fills as results arrive.
                </>
              ) : populated.length === 1 || spread <= 0.5 ? (
                <>
                  {top ? (
                    <>
                      {top.short} holds the profile at {n(top.percentage)}% —
                      one level, no spread worth acting on yet.
                    </>
                  ) : null}
                </>
              ) : (
                <>
                  {top?.short} leads {bottom?.short} by {n(spread)} points. The
                  low vertex is where the next sectional pays most.
                </>
              )}
            </InsightCallout>
            {empty.length > 0 ? (
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                No results yet for {empty.map((axis) => axis.short).join(", ")}{" "}
                — drawn as an honest blank, never a zero.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </Panel>
  );
}
