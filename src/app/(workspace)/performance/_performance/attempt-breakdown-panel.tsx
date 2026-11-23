"use client";

import { formatNumber as n } from "@/lib/domain";
import type { Analytics } from "@/lib/analytics";
import { Panel } from "@/components/dashboard-panels";
import {
  BreakdownDonut,
  DonutLegend,
} from "@/components/shared/charts/breakdown-donut";
import { InsightCallout } from "./insight-callout";

/**
 * "Make every attempt count" — the outcome donut over the scope's questions.
 *
 * Every figure is the payload's pooled summary: the donut's shares and the
 * attempt rate read the same `analytics.summary` the findings panel quotes,
 * so a coach tip and a chart can never disagree about how much was left
 * blank.
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

  return (
    <Panel
      icon="activity"
      title="Every attempt"
      description={`${n(summary.questions)} question${summary.questions === 1 ? "" : "s"} across ${n(pointCount)} result${pointCount === 1 ? "" : "s"} in this scope.`}
    >
      <div className="flex items-center gap-5">
        <BreakdownDonut
          counts={counts}
          centerValue={rate == null ? "—" : `${n(rate, 0)}%`}
          centerLabel="attempted"
        />
        <DonutLegend counts={counts} />
      </div>
      <InsightCallout className="mt-4">{tip}</InsightCallout>
    </Panel>
  );
}
