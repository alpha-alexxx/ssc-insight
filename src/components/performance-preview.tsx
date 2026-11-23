"use client";
import Link from "next/link";
import { Panel } from "./dashboard-panels";
import { PlainIcon } from "./icon";
import { Button } from "./button";
import { Skeleton } from "./skeleton";
import { Sparkline } from "./sparkline";
import { EmptyState } from "./empty-state";
import { NumberRoll } from "./number-roll";
import { headlineMetrics, sparklinePoints } from "@/lib/performance-metrics";
import { formatNumber as n } from "@/lib/domain";
import { shortDate } from "@/lib/format";
import type { Analytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * The dashboard's performance preview: awareness, not analysis.
 *
 * The full workspace lives at `/performance`; this panel exists so the
 * command center can say where the last result landed without becoming a
 * second report. The four figures below come from the same
 * `headlineMetrics`/`sparklinePoints` derivations as that page's score band,
 * which is what stops "Latest" reading differently in two places — the
 * arithmetic stays in one function even though the band's chrome is local to
 * this preview.
 *
 * It reads `analytics` for the `"all"` scope, so this preview and the
 * dashboard's own "Latest result" cell describe the same population.
 */

type BandCell = {
  key: string;
  label: string;
  figure: string;
  roll: number | null;
  suffix?: string;
  hint: string;
  delta?: { tone: string; label: string } | null;
  tone?: "success" | "destructive";
};

export function PerformancePreview({
  analytics,
  loading,
  href = "/performance",
  onAdd,
}: {
  analytics: Analytics | null;
  /** Carried for signature parity with the analytics surfaces; the gap
   * figures below derive from analytics.target inside headlineMetrics. */
  target: number | null;
  loading: boolean;
  /** The performance address, carrying the current scope/filters. */
  href?: string;
  onAdd: () => void;
}) {
  const hasResults = !!analytics && analytics.pointCount > 0;

  return (
    <Panel
      icon="report"
      title="Performance"
      description="How your recent results are moving. The full analysis lives on its own page."
      action={
        <Link
          href={href}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[12px] font-medium text-foreground shadow-[inset_0_0_0_1px_var(--border)] transition-colors hover:bg-accent"
        >
          View performance <PlainIcon name="arrowRight" size={12} />
        </Link>
      }
    >
      <div className="px-4 pb-4 sm:px-5">
        {loading && !analytics ? (
          <div
            className="flex flex-col gap-3"
            aria-busy="true"
            role="status"
            aria-label="Loading your performance preview"
          >
            <span className="sr-only">Loading your performance preview</span>
            <Skeleton height={64} />
            <Skeleton height={44} />
          </div>
        ) : !hasResults || !analytics ? (
          <EmptyState
            scene="chart"
            title="No saved result yet."
            description="Once you log a mock, this panel shows your latest score, recent average, accuracy and the gap to your target."
            action={
              <Button
                size="sm"
                onClick={onAdd}
                icon={<PlainIcon name="plus" size={13} />}
              >
                Log a mock
              </Button>
            }
          />
        ) : (
          <PreviewBand analytics={analytics} />
        )}
      </div>
    </Panel>
  );
}

const DELTA_TONE: Record<string, string> = {
  "is-up": "text-success",
  "is-down": "text-destructive",
  "is-flat": "text-muted-foreground",
};

/** The four headline figures, laid out as a divided hairline band. */
function PreviewBand({ analytics }: { analytics: Analytics }) {
  const metrics = headlineMetrics(analytics);
  const isFull = analytics.scope === "full";
  const { latest, average, accuracy, targetGap, delta } = metrics;

  /* On the full-mock scope the paper's own unit is marks, so the headline
   * shows marks and puts the percentage in the hint. Everywhere else the
   * percentage is the only comparable figure. */
  const figure = (percentage: number | null, score: number | null = null) =>
    percentage == null
      ? { text: "—", roll: null as number | null }
      : isFull && score != null
        ? { text: n(score), roll: score }
        : { text: `${n(percentage)}%`, roll: percentage, suffix: "%" };

  const latestFigure = latest
    ? figure(latest.percentage, latest.score)
    : { text: "—", roll: null as number | null, suffix: undefined };
  const averageFigure = figure(average.value, average.marks);

  const deltaTone =
    delta == null
      ? "is-flat"
      : delta > 0.05
        ? "is-up"
        : delta < -0.05
          ? "is-down"
          : "is-flat";
  const cells: BandCell[] = [
    {
      key: "latest",
      label: "Latest",
      figure: latestFigure.text,
      roll: latestFigure.roll,
      suffix: latestFigure.suffix,
      hint: latest
        ? `${shortDate(latest.date)} · ${n(latest.percentage)}%`
        : "Log a mock to begin",
      delta:
        delta != null && Math.abs(delta) > 0.05
          ? {
              tone: deltaTone,
              label: `${delta > 0 ? "+" : ""}${n(delta)} pts`,
            }
          : null,
    },
    {
      key: "average",
      label: "Average",
      figure: averageFigure.text,
      roll: averageFigure.roll,
      suffix: averageFigure.suffix,
      hint: average.value != null ? average.hint : "no results yet",
    },
    {
      key: "accuracy",
      label: "Accuracy",
      figure:
        accuracy.value == null ? "—" : `${n(accuracy.value)}%`,
      roll: accuracy.value,
      suffix: accuracy.value == null ? undefined : "%",
      hint: accuracy.hint,
    },
  ];
  if (targetGap.value != null) {
    cells.push({
      key: "target-gap",
      label: "Target gap",
      figure: `${targetGap.value > 0 ? "+" : ""}${n(targetGap.value)} pts`,
      roll: null,
      hint: targetGap.hint,
      tone: targetGap.value >= 0 ? "success" : "destructive",
    });
  }

  const points = sparklinePoints(analytics.trend.points);

  return (
    <div>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-border shadow-[inset_0_0_0_1px_var(--border)] md:grid-cols-4">
        {cells.map((cell) => (
          <div key={cell.key} className="min-w-0 bg-card px-4 py-4 sm:px-5">
            <p className="text-[12px] text-muted-foreground">{cell.label}</p>
            <p className="mt-1 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span
                className={cn(
                  "font-serif text-2xl font-semibold leading-none tracking-[-0.02em] tabular-nums",
                  cell.tone === "success" && "text-success",
                  cell.tone === "destructive" && "text-destructive",
                  !cell.tone && "text-foreground",
                )}
              >
                {cell.roll != null ? (
                  <NumberRoll
                    value={cell.roll}
                    locales="en-IN"
                    format={{ maximumFractionDigits: 1 }}
                    suffix={cell.suffix}
                  />
                ) : (
                  cell.figure
                )}
              </span>
              {cell.delta && (
                <span
                  className={cn(
                    "text-[12px] font-medium tabular-nums",
                    DELTA_TONE[cell.delta.tone] ?? "text-muted-foreground",
                  )}
                >
                  {cell.delta.label}
                </span>
              )}
            </p>
            <p className="mt-1 truncate text-[12px] text-muted-foreground">
              {cell.hint}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Sparkline
          data={points.map((point) => ({
            value: point.percentage,
            date: shortDate(point.date),
          }))}
          color="text-chart-1"
          variant="area"
          height={44}
          label="Recent scores by attempt date"
          className="h-11 min-w-[9rem] flex-1"
        />
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          {points.length > 1
            ? `Last ${points.length} results, by attempt date.`
            : "One result saved — a trend appears after the second."}
        </p>
      </div>
    </div>
  );
}
