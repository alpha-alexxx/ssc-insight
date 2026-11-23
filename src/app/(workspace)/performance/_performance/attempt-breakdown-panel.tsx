"use client";

import { formatNumber as n } from "@/lib/domain";
import type { Analytics } from "@/lib/analytics";
import { DonutChart, type DonutSlice } from "@/components/donut-chart";
import { InsightCallout } from "./insight-callout";

/**
 * "Make every attempt count" — the outcome donut over the scope's questions.
 *
 * Hairline's DonutChart carries the whole panel: the ring draws correct /
 * incorrect / unattempted around the question total, and the legend rows are
 * the same counts with their shares. Every figure is the payload's pooled
 * summary, so the donut's shares and the attempt rate read the same
 * `analytics.summary` the findings panel quotes, and a coach tip and a chart
 * can never disagree about how much was left blank.
 *
 * Outcome hues are the semantic tokens: correct in success, incorrect in
 * destructive, and the unattempted remainder as a foreground wash so it
 * reads as "the part of the paper still on the table".
 */
export function AttemptBreakdownPanel({ analytics }: { analytics: Analytics }) {
  const { summary, pointCount } = analytics;
  const counts = {
    correct: summary.correct,
    incorrect: summary.incorrect,
    unattempted: summary.unattempted,
  };
  const rate = summary.attemptRate;

  const tip =
    rate == null
      ? "Nothing is recorded in this scope yet."
      : rate >= 85
        ? "You are leaving almost nothing on the table — now accuracy, not coverage, is the lever."
        : rate >= 60
          ? "Coverage is solid. Skimming the unattempted tail is usually worth more points than perfecting what you already attempt."
          : "Attempt rate is the cheapest points on the board: each blank is a free try you did not take.";

  const data: DonutSlice[] = [
    {
      id: "correct",
      label: "Correct",
      value: counts.correct,
      color: "var(--success)",
    },
    {
      id: "incorrect",
      label: "Incorrect",
      value: counts.incorrect,
      color: "var(--destructive)",
    },
    {
      id: "unattempted",
      label: "Unattempted",
      value: counts.unattempted,
      color: "color-mix(in oklab, var(--muted-foreground) 32%, transparent)",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <DonutChart
        title="Every attempt"
        description={`${n(summary.questions)} question${summary.questions === 1 ? "" : "s"} across ${n(pointCount)} result${pointCount === 1 ? "" : "s"} in this scope.`}
        centerLabel="questions"
        format={{ maximumFractionDigits: 0 }}
        data={data}
      />
      <InsightCallout>{tip}</InsightCallout>
    </div>
  );
}
