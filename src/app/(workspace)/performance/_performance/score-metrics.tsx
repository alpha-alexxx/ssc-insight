"use client";

import type { Analytics } from "@/lib/analytics";
import { headlineMetrics } from "@/lib/performance-metrics";
import { formatNumber as n } from "@/lib/domain";
import { shortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const dateLabel = shortDate;

/**
 * The score band: the KPI strip that re-reads with every scope/filter change.
 *
 * This is the /performance rendering of the same `headlineMetrics()` figures
 * the shared score band draws — the derivation stays in one place in
 * `@/lib/performance-metrics` so a figure shown here and a figure shown on
 * the dashboard preview cannot diverge. Composed from tokens only.
 */
export function ScoreMetrics({ analytics }: { analytics: Analytics }) {
  const metrics = headlineMetrics(analytics);
  const isFull = analytics.scope === "full";
  const { latest, average, best, accuracy, targetGap, delta } = metrics;

  /* On the full-mock scope the paper's own unit is marks, so the headline
   * shows marks and puts the percentage in the hint. Everywhere else the
   * percentage is the only comparable figure. */
  const figure = (percentage: number | null, score: number | null = null) =>
    percentage == null
      ? "—"
      : isFull && score != null
        ? n(score)
        : `${n(percentage)}%`;

  const deltaTone =
    delta == null || Math.abs(delta) <= 0.05
      ? "text-muted-foreground"
      : delta > 0
        ? "text-success"
        : "text-destructive";

  const cells: {
    key: string;
    label: string;
    value: string;
    extra: React.ReactNode;
    hint: string;
    tone?: string;
  }[] = [
    {
      key: "latest",
      label: "Latest",
      value: latest ? figure(latest.percentage, latest.score) : "—",
      extra:
        delta != null && Math.abs(delta) > 0.05 ? (
          <span className={cn("text-xs font-medium", deltaTone)}>
            {delta > 0 ? "+" : ""}
            {n(delta)} pts
          </span>
        ) : null,
      hint: latest
        ? `${dateLabel(latest.date)} · ${n(latest.percentage)}%`
        : "Log a mock to begin",
    },
    {
      key: "average",
      label: "Average",
      value: figure(average.value, average.marks),
      extra: null,
      hint: average.value != null ? average.hint : "no results yet",
    },
    {
      key: "best",
      label: "Best",
      value: figure(best.value, best.marks),
      extra: null,
      hint: best.hint,
    },
    {
      key: "accuracy",
      label: "Accuracy",
      value: accuracy.value == null ? "—" : `${n(accuracy.value)}%`,
      extra: null,
      hint: accuracy.hint,
    },
    ...(targetGap.value != null
      ? [
          {
            key: "target-gap",
            label: "Target gap",
            value: `${targetGap.value > 0 ? "+" : ""}${n(targetGap.value)} pts`,
            extra: null,
            hint: targetGap.hint,
            tone: targetGap.value >= 0 ? "text-success" : "text-destructive",
          },
        ]
      : []),
  ];

  /* The band is a ruled grid: 1px gaps over a border-coloured ground, so
   * every cell edge is a hairline however the cells wrap.
   *
   * Column plans are explicit per cell count so no row ever ends with an empty
   * slot at the right (the old `sm:grid-cols-3` left two blank cells after a
   * fifth KPI, and the lone odd cell on a phone left half a row blank):
   *   4 cells   2 cols  →  4 cols from lg
   *   5 cells   2 cols (last spans both)  →  6-col rhythm of 3 + 2 from sm
   *             (three cells of 2/6, two of 3/6)  →  5 cols from xl */
  const count = cells.length;
  const plan =
    count === 5
      ? {
          grid: "grid-cols-2 sm:grid-cols-6 xl:grid-cols-5",
          span: (i: number) =>
            cn(
              i === 4 && "col-span-2",
              i < 3 ? "sm:col-span-2" : "sm:col-span-3",
              "xl:col-span-1",
            ),
        }
      : {
          grid: "grid-cols-2 lg:grid-cols-4",
          span: (i: number) =>
            count % 2 === 1 && i === count - 1
              ? "col-span-2 lg:col-span-1"
              : "",
        };

  return (
    <section
      aria-label="Score summary"
      className={cn(
        "grid gap-px overflow-hidden rounded-2xl bg-border p-px text-card-foreground",
        plan.grid,
      )}
    >
      {cells.map((cell, i) => (
        <div
          key={cell.key}
          className={cn(
            "flex min-w-0 flex-col gap-1 bg-card px-4 py-4 sm:px-5",
            plan.span(i),
          )}
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {cell.label}
          </p>
          <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span
              className={cn(
                "text-2xl font-semibold tracking-tight tabular-nums",
                cell.tone ?? "text-foreground",
              )}
            >
              {cell.value}
            </span>
            {cell.extra}
          </p>
          <p
            className="truncate text-xs text-muted-foreground"
            title={cell.hint}
          >
            {cell.hint}
          </p>
        </div>
      ))}
    </section>
  );
}
