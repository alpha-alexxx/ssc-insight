"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion";
import { formatNumber as n } from "@/lib/domain";
import type { Analytics } from "@/lib/analytics";
import { distributionBuckets } from "@/lib/performance-metrics";
import { Panel } from "./panel";
import { useSize } from "./use-size";

/**
 * Score distribution: ten fixed 10-point bands over the scope's results.
 *
 * Buckets are fixed, not data-derived (see `distributionBuckets()`), so two
 * filtered views stay comparable. The modal band — the bucket holding the
 * most results — fills in the chart hue once there is more than one result
 * to compare; hover deepens any bar and a `<title>` reads every bar aloud.
 *
 * Why this file changed: the histogram used to be drawn in a 100-unit-wide
 * viewBox with `preserveAspectRatio="xMidYMid meet"` and `max-h-56`. The
 * viewBox is far taller than it is wide, so the browser scaled the whole
 * picture down to fit the height cap and centred it — the chart occupied a
 * thin column in the middle of a full-width panel with blank bands to both
 * sides. It now measures its container (`useSize`) and draws in real pixel
 * coordinates, so it always fills the panel edge to edge, and a summary rail
 * (most common band, highest, lowest, count) takes the right-hand side on
 * wide containers instead of leaving it empty.
 *
 * A fixed-band histogram is not in the Hairline chart set, so this one is
 * composed from the tokens directly (the same documented-gap treatment as
 * the radar): the score series carries --chart-1, the grid and axis labels
 * the border and muted-foreground tokens.
 */
const HEIGHT = 244;
const PAD = { l: 28, r: 8, t: 22, b: 28 };

export function DistributionPanel({ analytics }: { analytics: Analytics }) {
  const reduced = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const [ref, width] = useSize<HTMLDivElement>();
  const { buckets, total } = distributionBuckets(analytics.trend.points);

  const rawMax = Math.max(...buckets.map((bucket) => bucket.count), 0);
  const modalIndex =
    rawMax > 1
      ? buckets.reduce(
          (best, bucket, i) => (bucket.count > buckets[best]!.count ? i : best),
          0,
        )
      : null;

  // y-axis: raw counts, rounded up to an even ceiling, ticked 1/2/4 apart.
  const yMax = Math.max(4, Math.ceil(rawMax / 2) * 2);
  const step = yMax > 8 ? 4 : yMax > 4 ? 2 : 1;
  const innerW = Math.max(0, width - PAD.l - PAD.r);
  const innerH = HEIGHT - PAD.t - PAD.b;
  const slot = innerW / buckets.length;
  const barW = slot * 0.72;

  const filled = buckets.filter((bucket) => bucket.count > 0);
  const highest = filled[filled.length - 1];
  const lowest = filled[0];
  const modal = modalIndex != null ? buckets[modalIndex] : null;

  const summary = [
    { label: "Results in view", value: n(total), hint: "scored percentages" },
    {
      label: "Most common band",
      value: modal ? modal.label : "—",
      hint: modal
        ? `${modal.count} results · ${modal.percentage.toFixed(0)}%`
        : "needs 2+ in one band",
    },
    {
      label: "Highest band",
      value: highest ? highest.label : "—",
      hint: highest
        ? `${highest.count} result${highest.count === 1 ? "" : "s"}`
        : "no results",
    },
    {
      label: "Lowest band",
      value: lowest ? lowest.label : "—",
      hint: lowest
        ? `${lowest.count} result${lowest.count === 1 ? "" : "s"}`
        : "no results",
    },
  ];

  return (
    <Panel
      icon="report"
      title="Score distribution"
      description={
        total >= 3
          ? `${n(total)} results in view, bucketed by percentage.`
          : "Histograms need a few results before they say anything."
      }
    >
      {total === 0 ? (
        <p className="px-1 py-8 text-[13px] leading-relaxed text-muted-foreground">
          No scored results in this scope yet — bands fill in as mocks arrive.
        </p>
      ) : (
        <div className="@container">
          <div className="grid grid-cols-1 gap-5 @3xl:grid-cols-[minmax(0,1fr)_13.5rem] @3xl:items-stretch">
            <div className="min-w-0">
              <div ref={ref} className="w-full min-w-0">
                {width >= 40 && (
                  <svg
                    width={width}
                    height={HEIGHT}
                    viewBox={`0 0 ${width} ${HEIGHT}`}
                    className="block max-w-full"
                    role="img"
                    aria-label={
                      modalIndex != null
                        ? `Most results sit in the ${buckets[modalIndex]!.label} band`
                        : `Distribution of ${total} results across ten bands`
                    }
                  >
                    {/* y grid + ticks */}
                    {Array.from(
                      { length: Math.floor(yMax / step) + 1 },
                      (_, i) => i * step,
                    ).map((tick) => {
                      const y = PAD.t + innerH * (1 - tick / yMax);
                      return (
                        <g key={tick}>
                          <line
                            x1={PAD.l}
                            x2={width - PAD.r}
                            y1={y}
                            y2={y}
                            stroke="var(--border)"
                            strokeWidth={tick === 0 ? 1 : 0.75}
                            strokeOpacity={tick === 0 ? 1 : 0.7}
                            strokeDasharray={tick === 0 ? undefined : "3 4"}
                          />
                          <text
                            x={PAD.l - 8}
                            y={y + 3}
                            textAnchor="end"
                            className="tabular-nums fill-muted-foreground"
                            style={{ fontSize: 10 }}
                          >
                            {tick}
                          </text>
                        </g>
                      );
                    })}

                    {buckets.map((bucket, i) => {
                      const isHover = hover === i;
                      const isModal = modalIndex === i;
                      const barH = (bucket.count / yMax) * innerH;
                      return (
                        <g key={bucket.label}>
                          {/* full-height hit target so thin bars are easy to point at */}
                          <rect
                            x={PAD.l + i * slot}
                            y={PAD.t}
                            width={slot}
                            height={innerH}
                            fill="transparent"
                            onPointerEnter={() => setHover(i)}
                            onPointerLeave={() => setHover(null)}
                          />
                          <motion.rect
                            x={PAD.l + i * slot + (slot - barW) / 2}
                            width={barW}
                            y={PAD.t + innerH - barH}
                            height={barH}
                            rx={Math.min(4, barW / 4)}
                            fill="var(--chart-1)"
                            fillOpacity={isHover ? 0.95 : isModal ? 0.85 : 0.42}
                            initial={reduced ? undefined : { scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{
                              duration: 0.55,
                              delay: 0.15 + i * 0.045,
                              ease: EASE,
                            }}
                            style={{
                              transformBox: "fill-box",
                              transformOrigin: "center bottom",
                              pointerEvents: "none",
                            }}
                          >
                            <title>
                              {`${bucket.label} — ${bucket.count} result${bucket.count === 1 ? "" : "s"} (${bucket.percentage.toFixed(0)}%)`}
                            </title>
                          </motion.rect>
                          {bucket.count > 0 && (
                            <motion.text
                              x={PAD.l + i * slot + slot / 2}
                              y={PAD.t + innerH - barH - 5}
                              textAnchor="middle"
                              className="tabular-nums fill-muted-foreground"
                              style={{
                                fontSize: 11,
                                fontWeight: isHover || isModal ? 600 : 400,
                              }}
                              initial={reduced ? undefined : { opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{
                                duration: 0.4,
                                delay: 0.5 + i * 0.045,
                                ease: EASE,
                              }}
                            >
                              {bucket.count}
                            </motion.text>
                          )}
                        </g>
                      );
                    })}

                    {/* x labels at band boundaries */}
                    {[0, 20, 40, 60, 80, 100].map((bound) => (
                      <text
                        key={bound}
                        x={PAD.l + (bound / 100) * innerW}
                        y={HEIGHT - 8}
                        textAnchor="middle"
                        className="tabular-nums fill-muted-foreground"
                        style={{ fontSize: 10 }}
                      >
                        {bound}
                      </text>
                    ))}
                  </svg>
                )}
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
                Percentage of the paper, 0–100. The accent band is where most
                results land.
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-px self-start overflow-hidden rounded-xl bg-border p-px @3xl:grid-cols-1">
              {summary.map((item) => (
                <div key={item.label} className="min-w-0 bg-card px-3.5 py-3">
                  <dt className="truncate text-[10.5px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                    {item.label}
                  </dt>
                  <dd className="mt-1 truncate text-lg font-semibold tabular-nums leading-none text-foreground">
                    {item.value}
                  </dd>
                  <dd className="mt-1 truncate text-[11.5px] text-muted-foreground">
                    {item.hint}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </Panel>
  );
}
