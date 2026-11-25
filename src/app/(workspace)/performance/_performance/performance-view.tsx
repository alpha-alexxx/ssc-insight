"use client";

import type { ReactNode } from "react";
import { PageHeader } from "@/components/page-header";
import { PlainIcon } from "@/components/icon";
import { Button } from "@/components/button";
import { Spinner } from "@/components/spinner";
import { EmptyState } from "@/components/empty-state";
import { ScoreMetrics } from "./score-metrics";
import { FindingsPanel } from "./findings-panel";
import { TrendPanel } from "./trend-panel";
import { RadarPanel } from "./radar-panel";
import { AttemptBreakdownPanel } from "./attempt-breakdown-panel";
import { DistributionPanel } from "./distribution-panel";
import { SubjectDeepDive } from "./subject-deep-dive";
import { useExamScope } from "@/components/exam-context";
import { Swap } from "@/components/motion-swap";
import { findings, isSingleResult } from "@/lib/performance-metrics";
import type { Analytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * `/performance` — the dedicated analytical workspace.
 *
 * The dashboard answers "what should I do today"; this page answers "how am I
 * improving, where am I weak". The scope tabs and filters that used to sit on
 * the dashboard live here, so the two surfaces no longer compete for the same
 * first screen.
 *
 * Order is deliberate: the KPI band states where you are, the findings name
 * what the numbers show, and the charts below are the evidence a reader can
 * check them against — trend, subject shape, outcome mix, distribution, then
 * the per-subject drill-down. Every figure reads the one analytics payload
 * the shell already holds; the shared derivations live in
 * `@/lib/performance-metrics` so a number shown here and on the dashboard
 * preview cannot diverge.
 */

function SectionDivider({
  icon,
  title,
  subtitle,
}: {
  icon: Parameters<typeof PlainIcon>[0]["name"];
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 pt-2">
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        <PlainIcon name={icon} size={13} tone="primary" />
        <span>{title}</span>
      </span>
      <span className="h-px flex-1 bg-border/80" aria-hidden="true" />
      {subtitle && (
        <span className="hidden text-[11px] text-muted-foreground/80 sm:inline">
          {subtitle}
        </span>
      )}
    </div>
  );
}

export function PerformanceView({
  analytics,
  loading,
  controls,
  onAdd,
}: {
  analytics: Analytics | null;
  loading: boolean;
  /** The scope + filter control row, owned by the shell's workspace state. */
  controls: ReactNode;
  onAdd: () => void;
}) {
  const examScope = useExamScope();
  const examLabel = examScope.exams
    ? examScope.activeTierId === "all"
      ? `${examScope.activeExamId.toUpperCase()} · All tiers`
      : examScope.examLabel(examScope.activeExamId, examScope.activeTierId)
    : null;

  const empty = !!analytics && analytics.pointCount === 0;
  const singleResult = !!analytics && isSingleResult(analytics);
  const isRefreshing = loading && !!analytics;

  return (
    <div className="min-w-0 overflow-x-hidden space-y-4 sm:space-y-5">
      <PageHeader
        title="Performance"
        description="Track your mock results, spot score trends, and isolate weak subjects."
        meta={
          <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
            {examLabel && (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/15 px-1.5 py-0.5 text-[11px] font-semibold tracking-tight text-primary">
                  <PlainIcon name="book" size={12} tone="primary" />
                  {examLabel}
                </span>
                <span aria-hidden="true" className="text-muted-foreground/60">
                  ·
                </span>
              </>
            )}
            {analytics && analytics.pointCount > 0 && (
              <>
                <span className="font-medium tabular-nums text-foreground">
                  {analytics.pointCount} mock
                  {analytics.pointCount === 1 ? "" : "s"} analyzed
                </span>
                <span aria-hidden="true" className="text-muted-foreground/60">
                  ·
                </span>
              </>
            )}
            <span>All dates in India Standard Time</span>
          </span>
        }
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={onAdd}
            className="gap-1.5 shadow-2xs"
          >
            <PlainIcon name="plus" size={14} tone="current" />
            <span>Add mock</span>
          </Button>
        }
      />

      {/* ── Scope & Filter Toolbar Surface ── */}
      <section
        aria-label="Analytics filters"
        className="relative overflow-hidden rounded-2xl bg-card px-3.5 py-3 text-card-foreground shadow-[inset_0_0_0_1px_var(--border)] sm:px-5 sm:py-3.5"
      >
        {controls}

        {/* Non-shifting refresh status pill when re-evaluating scope/filters */}
        {isRefreshing && (
          <div
            role="status"
            aria-live="polite"
            className="mt-2.5 flex items-center gap-2 border-t border-border/70 pt-2 text-[11.5px] font-medium text-muted-foreground sm:mt-0 sm:border-t-0 sm:pt-0 sm:absolute sm:right-4 sm:top-3"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/95 px-2.5 py-0.5 shadow-2xs backdrop-blur-xs">
              <Spinner size="xs" />
              <span>Updating results…</span>
            </span>
          </div>
        )}
      </section>

      {/* ── Main Analytical Workspace ── */}
      <div
        className={cn(
          "transition-opacity duration-150 motion-reduce:transition-none",
          isRefreshing && "pointer-events-none opacity-60",
        )}
      >
        <Swap swapKey={analytics?.scope ?? "none"}>
          {empty ? (
            <section className="min-w-0 rounded-2xl bg-card p-6 text-card-foreground shadow-[inset_0_0_0_1px_var(--border)] sm:p-10">
              <EmptyState
                scene="chart"
                title="No saved result matches this view"
                description="Log a new mock attempt or widen the exam and date filters above to see your performance breakdown."
                action={{
                  label: "Log a mock",
                  icon: <PlainIcon name="plus" size={14} />,
                  onAction: onAdd,
                }}
              />
            </section>
          ) : analytics ? (
            <div className="min-w-0 space-y-4 sm:space-y-5">
              {/* 1. KPI Band & Automated Findings */}
              <ScoreMetrics analytics={analytics} />

              <FindingsPanel findings={findings(analytics)} />

              {/* Single-result notice — explains why multi-mock curves need a 2nd data point */}
              {singleResult && (
                <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-accent/30 p-3.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
                  <div className="flex items-start gap-3 sm:items-center">
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl border border-border bg-background text-foreground shadow-2xs sm:mt-0">
                      <PlainIcon name="sparkles" size={15} tone="primary" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-semibold leading-snug text-foreground">
                        Baseline established with 1 mock result
                      </p>
                      <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                        The summary above is exact, but trend lines, score
                        distributions, and pace comparisons unlock more honest
                        signals once you log a second attempt.
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onAdd}
                      className="gap-1.5"
                    >
                      <PlainIcon name="plus" size={13} />
                      <span>Log second mock</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* 2. Score Trajectory & Subject Balance */}
              <SectionDivider
                icon="chart"
                title="Trajectory & subject shape"
                subtitle="Progress over time and balance across sections"
              />

              <TrendPanel analytics={analytics} />

              <RadarPanel analytics={analytics} />

              {/* 3. Outcome Mix & Score Spread */}
              <SectionDivider
                icon="compare"
                title="Accuracy & score distribution"
                subtitle="Correct vs. incorrect breakdown and score clustering"
              />

              <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
                <AttemptBreakdownPanel analytics={analytics} />
                <DistributionPanel analytics={analytics} />
              </div>

              {/* 4. Per-Subject Granular Drill-Down */}
              <SectionDivider
                icon="layers"
                title="Subject deep dive"
                subtitle="Section-by-section accuracy, marks, and trends"
              />

              <SubjectDeepDive analytics={analytics} />
            </div>
          ) : (
            <section
              role="status"
              aria-label="Loading performance analytics"
              className="min-w-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-card px-6 py-16 text-center text-card-foreground shadow-[inset_0_0_0_1px_var(--border)]"
            >
              <span className="grid size-10 place-items-center rounded-2xl border border-border bg-accent/40 shadow-2xs">
                <Spinner size="sm" />
              </span>
              <div className="space-y-1">
                <p className="text-[13.5px] font-semibold text-foreground">
                  Loading your preparation…
                </p>
                <p className="text-[12px] text-muted-foreground">
                  Computing score trends, subject accuracy, and distributions.
                </p>
              </div>
            </section>
          )}
        </Swap>
      </div>
    </div>
  );
}
