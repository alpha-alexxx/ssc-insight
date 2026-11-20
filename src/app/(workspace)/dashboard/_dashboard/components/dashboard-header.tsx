"use client";
import { PlainIcon } from "@/components/icon";
import { DashboardClock } from "@/components/dashboard-clock";
import { Button } from "@/components/ui/button";
import { useExamScope } from "@/components/exam-context";
import { longDate } from "@/lib/format";
import { istTodayIso } from "@/lib/plan/view-model";
import type { PlanPayload } from "@/lib/plan/view-model";

/**
 * Dashboard title block. One header, three facts, two actions.
 *
 * Deliberately not `PageHeader`: the dashboard is the workspace's home, so its
 * head carries the scope and plan position inline rather than stacking a
 * description above a metadata row. No icon tile and no boxed clock — the
 * paper-and-ink rules reserve tinted hosts for status, and a clock is context,
 * not status.
 */
export function DashboardHeader({
  plan,
  onAdd,
  onAddWithAi,
}: {
  plan: (PlanPayload & { today: string }) | null;
  onAdd: () => void;
  onAddWithAi: () => void;
}) {
  const today = istTodayIso();
  const dayNumber = plan?.days.find((day) => day.date === today)?.day;

  return (
    <header className="mb-5 border-b border-rule pb-4">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <h1 className="workspace-title">Dashboard</h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.6875rem] leading-relaxed text-muted">
            <span className="inline-flex items-center gap-1.5">
              <PlainIcon name="calendar" size={12} aria-hidden="true" />
              {longDate(today)}
            </span>
            <Dot />
            <span className="inline-flex items-center gap-1.5">
              <PlainIcon name="layers" size={12} aria-hidden="true" />
              <ActiveExamName />
            </span>
            <Dot />
            <span className="tabular">
              {dayNumber ? `Plan day ${dayNumber} of 50` : "Outside the plan window"}
            </span>
            <Dot />
            <DashboardClock />
          </p>
        </div>

        <div className="action-row sm:justify-end">
          <div className="flex items-center">
            <Button size="sm" className="rounded-r-none!" onClick={onAdd}>
              <PlainIcon name="plus" size={14} aria-hidden="true" /> Add mock
            </Button>
            <Button
              size="sm"
              aria-label="Create mock with AI"
              title="Create mock with AI"
              onClick={onAddWithAi}
              className="rounded-l-none! border-l border-paper/40"
            >
              <PlainIcon name="sparkles" size={14} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

/** The separator between metadata facts. Decorative, so it hides from AT. */
function Dot() {
  return (
    <span aria-hidden="true" className="text-rule">
      ·
    </span>
  );
}

/** The active scope's display name ("SSC CGL · Tier 2", "· All tiers"). */
function ActiveExamName() {
  const scope = useExamScope();
  if (!scope.exams) return "SSC CGL";
  if (scope.activeTierId === "all") {
    const examName =
      scope.exams.builtIn.find((exam) => exam.id === scope.activeExamId)?.name ??
      scope.exams.customExams.find((exam) => exam.id === scope.activeExamId)
        ?.name ??
      "SSC CGL";
    return `${examName} · All tiers`;
  }
  return scope.examLabel(scope.activeExamId, scope.activeTierId);
}
