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

  return (
    <>
      <PageHeader
        title="Performance"
        description="Track your mock results and identify areas to improve."
        meta={
          <>
            {examLabel && (
              <>
                <span>{examLabel}</span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <span>All dates in India Standard Time</span>
          </>
        }
        actions={
          <Button size="sm" onClick={onAdd}>
            <PlainIcon name="plus" size={14} /> Add mock
          </Button>
        }
      />

      <div className="mb-4 rounded-2xl bg-card px-4 py-3 text-card-foreground shadow-[inset_0_0_0_1px_var(--border)] sm:px-5">
        {controls}
      </div>

      {/* A scope change re-fetches analytics; say so, rather than letting the
          charts quietly swap under the heading. */}
      {loading && analytics && (
        <p
          role="status"
          className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Spinner size="xs" />
          Updating your results…
        </p>
      )}

      <div
        className={cn(
          "transition-opacity duration-150 motion-reduce:transition-none",
          loading && analytics && "opacity-60",
        )}
      >
        <Swap swapKey={analytics?.scope ?? "none"}>
          {empty ? (
            <EmptyState
              scene="chart"
              title="No saved result matches this view"
              description="Log a mock, or widen the filters above."
            />
          ) : analytics ? (
            <>
              <ScoreMetrics analytics={analytics} />
              <FindingsPanel
                findings={findings(analytics)}
                className="mt-4"
              />
              {isSingleResult(analytics) && (
                <p className="mt-4 rounded-xl bg-muted px-4 py-3 text-[13px] leading-relaxed text-muted-foreground">
                  One result is saved in this view. The summary above is
                  exact, but trends, distributions and subject comparisons need
                  a second attempt before they can say anything honest.
                </p>
              )}
              <div className="mt-4">
                <TrendPanel analytics={analytics} />
              </div>
              <div className="mt-4">
                <RadarPanel analytics={analytics} />
              </div>
              <div className="mt-4 grid items-start gap-4 xl:grid-cols-2">
                <AttemptBreakdownPanel analytics={analytics} />
                <DistributionPanel analytics={analytics} />
              </div>
              <div className="mt-4">
                <SubjectDeepDive analytics={analytics} />
              </div>
            </>
          ) : (
            <EmptyState scene="chart" title="Loading your preparation…" />
          )}
        </Swap>
      </div>
    </>
  );
}
