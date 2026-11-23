"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion";
import { formatNumber as n } from "@/lib/domain";
import type { Analytics } from "@/lib/analytics";
import { distributionBuckets } from "@/lib/performance-metrics";
import { Panel } from "@/components/dashboard-panels";

/**
 * Score distribution: ten fixed 10-point bands over the scope's results.
 *
 * Buckets are fixed, not data-derived (see `distributionBuckets()`), so two
 * filtered views stay comparable. The modal band — the bucket holding the
 * most results — fills in accent once there is more than one result to
 * compare; hover deepens any bar and a `<title>` reads every bar aloud.
 */
const HEIGHT = 248;
const PAD = { l: 26, r: 10, t: 18, b: 26 };

export function DistributionPanel({ analytics }: { analytics: Analytics }) {
  const reduced = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const { buckets, total } = distributionBuckets(analytics.trend.points);

  const rawMax = Math.max(...buckets.map((bucket) => bucket.count), 0);
  const modalIndex = rawMax > 1
    ? buckets.reduce(
        (best, bucket, i) => (bucket.count > buckets[best]!.count ? i : best),
        0,
      )
    : null;

  // y-axis: raw counts, rounded up to an even ceiling, ticked 1/2/4 apart.
  const yMax = Math.max(4, Math.ceil(rawMax / 2) * 2);
  const step = yMax > 8 ? 4 : yMax > 4 ? 2 : 1;
  const innerH = HEIGHT - PAD.t - PAD.b;
  const barW = 100 / buckets.length;

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
        <p className="px-1 py-8 text-[0.8125rem] leading-relaxed text-muted">
          No scored results in this scope yet — bands fill in as mocks arrive.
        </p>
      ) : (
        <>
          <svg
            viewBox={`0 0 100 ${HEIGHT}`}
            preserveAspectRatio="none"
            className="h-56 w-full"
            role="img"
            aria-label={
              modalIndex != null
                ? `Most results sit in the ${buckets[modalIndex]!.label} band`
                : `Distribution of ${total} results across ten bands`
            }
          >
            {/* y grid + ticks */}
            {Array.from({ length: Math.floor(yMax / step) + 1 }, (_, i) => i * step).map(
              (tick) => {
                const y = PAD.t + innerH * (1 - tick / yMax);
                return (
                  <g key={tick}>
                    <line
                      x1={0}
                      x2={100}
                      y1={y}
                      y2={y}
                      stroke="var(--rule-soft)"
                      strokeWidth={tick === 0 ? 0.5 : 0.3}
                      strokeOpacity={tick === 0 ? 1 : 0.6}
                      vectorEffect="non-scaling-stroke"
                    />
                    <text
                      x={0}
                      y={y - 1.5}
                      className="tabular-nums fill-[var(--muted)]"
                      style={{ fontSize: 7 }}
                    >
                      {tick}
                    </text>
                  </g>
                );
              },
            )}

            {buckets.map((bucket, i) => {
              const isHover = hover === i;
              const isModal = modalIndex === i;
              const barH = (bucket.count / yMax) * innerH;
              return (
                <motion.rect
                  key={bucket.label}
                  x={i * barW + barW * 0.14}
                  width={barW * 0.72}
                  y={PAD.t + innerH - barH}
                  height={barH}
                  fill="var(--chart-score)"
                  fillOpacity={isHover ? 0.95 : isModal ? 0.85 : 0.42}
                  initial={reduced ? undefined : { scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.55, delay: 0.15 + i * 0.045, ease: EASE }}
                  style={{ transformBox: "fill-box", transformOrigin: "center bottom" }}
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover(null)}
                >
                  <title>
                    {`${bucket.label} — ${bucket.count} result${bucket.count === 1 ? "" : "s"} (${bucket.percentage.toFixed(0)}%)`}
                  </title>
                </motion.rect>
              );
            })}

            {/* count labels */}
            {buckets.map((bucket, i) =>
              bucket.count > 0 ? (
                <motion.text
                  key={`label-${bucket.label}`}
                  x={i * barW + barW / 2}
                  y={PAD.t + innerH - (bucket.count / yMax) * innerH - 2}
                  textAnchor="middle"
                  className="tabular-nums fill-[var(--muted)]"
                  style={{
                    fontSize: 7,
                    fontWeight: hover === i || modalIndex === i ? 600 : 400,
                  }}
                  initial={reduced ? undefined : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.045, ease: EASE }}
                >
                  {bucket.count}
                </motion.text>
              ) : null,
            )}

            {/* x labels at band boundaries */}
            {[0, 20, 40, 60, 80, 100].map((bound) => (
              <text
                key={bound}
                x={(bound / 100) * 100}
                y={HEIGHT - 10}
                textAnchor={bound === 0 ? "start" : bound === 100 ? "end" : "middle"}
                className="tabular-nums fill-[var(--muted)]"
                style={{ fontSize: 7 }}
              >
                {bound}
              </text>
            ))}
          </svg>
          <p className="mt-2 text-[0.6875rem] leading-relaxed text-muted">
            Percentage of the paper, 0–100. The accent band is where most
            results land.
          </p>
        </>
      )}
    </Panel>
  );
}
