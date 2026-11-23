"use client";
import { useState, type ReactNode } from "react";
import { Panel } from "@/components/dashboard-panels";
import { PlainIcon } from "@/components/icon";
import { Button } from "@/components/button";
import { Skeleton } from "@/components/skeleton";
import { Tooltip } from "@/components/tooltip";
import { SegmentedControl } from "@/components/segmented-control";
import { Swap } from "@/components/motion-swap";
import { PlusSignIcon } from "@/components/animate-ui/icons/hugeicons/plus-sign";
import { DashboardOverview } from "@/components/dashboard-overview";
import { AttemptRecordCard } from "@/components/attempt-outcome-card";
import { PerformancePreview } from "@/components/performance-preview";
import { PlanErrorCard } from "@/components/shared/plan/plan-shared";
import {
  StudyPipelinePanel,
  TodayFocusPanel,
  type PlanWithToday,
} from "./dashboard-plan-sections";
import { WeekStripPanel, WeekStripSkeleton } from "./week-strip";
import type { usePlanData } from "@/components/use-plan-data";
import type { Analytics } from "@/lib/analytics";
import type { Attempt } from "@/lib/domain";
import { PersonalTodos } from "@/components/shared/tasks/personal-todos";
import {
  addIsoDays,
  dayTypeLabel,
  istTodayIso,
  isoWeekdayShort,
} from "@/lib/plan/view-model";
import { longDate } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Dashboard composition. The metric band answers "where am I?", Today's Plan
 * pairs the study day with the personal task column side by side (tabbed
 * below xl), the week strip replaces the full calendar, and the pipeline
 * column keeps progress, revision and the coach in view. Performance analysis
 * stays below as a distinct, scope-aware section.
 */
export function DashboardView({
  planApi,
  analytics,
  attempts,
  target,
  loading,
  coach,
  onOpenAttempt,
  onAdd,
  onViewAll,
  onOpenDay,
  onOpenPersonalAi,
}: {
  planApi: ReturnType<typeof usePlanData>;
  analytics: Analytics | null;
  attempts: Attempt[];
  target: number | null;
  loading: boolean;
  coach?: ReactNode;
  onOpenAttempt: (attempt: Attempt) => void;
  onAdd: () => void;
  onViewAll: () => void;
  onOpenDay: (date: string) => void;
  /** Opens the shell AI chat on the Plan-todos tab. */
  onOpenPersonalAi?: () => void;
}) {
  const plan = planApi.plan as PlanWithToday | null;
  const today = plan?.today ?? istTodayIso();
  const [mobilePane, setMobilePane] = useState<"study" | "personal">("study");
  const [focusDate, setFocusDate] = useState<string | null>(null);
  const activeDate = focusDate ?? today;
  const shiftFocus = (delta: number) => {
    if (!plan) return;
    const next = addIsoDays(activeDate, delta);
    if (next >= plan.startDate && next <= plan.endDate) setFocusDate(next);
  };
  const personalOverdue =
    planApi.personalTasks?.filter(
      (task) =>
        task.status !== "completed" && task.dueDate && task.dueDate < today,
    ).length ?? null;
  const activeDay = plan?.days.find((day) => day.date === activeDate) ?? null;
  const totalDays = plan?.days.length ?? 0;

  return (
    <div aria-busy={loading}>
      <DashboardOverview
        plan={plan}
        analytics={analytics}
        loading={loading}
        personalOverdue={personalOverdue}
        onOpenToday={() => onOpenDay(today)}
        onViewAll={onViewAll}
      />

      <section
        className="mt-8 border-t border-border pt-5"
        aria-labelledby="today-plan-heading"
      >
        {/* An editorial head rather than a card: a small-caps dateline carries
            the plan position, the serif title names the section, and one
            hairline closes it before the panels. The old book tile repeated
            the tile inside the Study Plan panel directly below, and the old
            dateline repeated that panel's "Day X of 50 · MOCK DAY" line — so
            the position lives here once, and the panel now names the phase. */}
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
          <div className="min-w-0">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
              aria-live="polite"
            >
              {activeDay ? (
                <>
                  <span className="tabular-nums text-foreground">
                    Day {activeDay.day} of {totalDays}
                  </span>
                  <span aria-hidden="true"> · </span>
                  <span
                    className={cn(
                      activeDay.dayType.includes("MOCK") && "text-primary",
                    )}
                  >
                    {dayTypeLabel(activeDay.dayType)}
                  </span>
                </>
              ) : (
                "Plan overview"
              )}
            </p>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2
                id="today-plan-heading"
                className="font-serif text-[26px] leading-none tracking-[-0.01em] text-foreground"
              >
                What&apos;s the Plan!
              </h2>
              {/* The return control sits beside the title, not in the arrow
                  cluster: it only appears once the day has stepped away, so
                  the arrows can never slide out from under the pointer. */}
              {plan && activeDate !== today && (
                <button
                  type="button"
                  onClick={() => setFocusDate(null)}
                  className="text-[11px] font-medium text-primary underline decoration-primary/40 underline-offset-[3px] transition-colors hover:decoration-primary motion-reduce:transition-none"
                >
                  Back to today
                </button>
              )}
            </div>
          </div>
          {plan && (
            <div
              role="group"
              aria-label="Change the plan day"
              className="flex h-9 w-full items-stretch divide-x divide-border overflow-hidden rounded-[12px] border border-border bg-card sm:w-auto sm:shrink-0"
            >
              <Tooltip content="Previous day">
                <button
                  type="button"
                  aria-label="Previous day"
                  disabled={activeDate <= plan.startDate}
                  onClick={() => shiftFocus(-1)}
                  className="flex size-9 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-35 motion-reduce:transition-none"
                >
                  <PlainIcon name="chevronRight" size={15} className="rotate-180" />
                </button>
              </Tooltip>
              {/* The dateline is the head's only live region: repeating it on
                  the title block would announce the same day change twice. */}
              <p
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 px-3 font-serif text-[15px] font-medium tabular-nums tracking-[-0.01em] sm:flex-none",
                  activeDate === today ? "text-foreground" : "text-primary",
                )}
              >
                {isoWeekdayShort(activeDate)}, {longDate(activeDate)}
                {activeDate === today && (
                  <span className="rounded-full bg-primary px-1.5 py-px font-sans text-[10px] font-semibold uppercase tracking-[0.08em] text-primary-foreground">
                    Today
                  </span>
                )}
              </p>
              <Tooltip content="Next day">
                <button
                  type="button"
                  aria-label="Next day"
                  disabled={activeDate >= plan.endDate}
                  onClick={() => shiftFocus(1)}
                  className="flex size-9 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-35 motion-reduce:transition-none"
                >
                  <PlainIcon name="chevronRight" size={15} />
                </button>
              </Tooltip>
            </div>
          )}
        </div>
        {/* The Study/Personal switch rides inside the head, under the title,
            on its own rule-to-rule row at phone widths — it used to float on
            the canvas as a third stacked bar between the title and the
            panels. It is full-width until the two panes can sit side by side
            (xl), which is exactly when the switch stops being needed. */}
        <SegmentedControl
          className="mt-3 xl:hidden"
          block
          label="Switch between the study plan and personal tasks"
          value={mobilePane}
          onValueChange={(value) =>
            setMobilePane(value === "personal" ? "personal" : "study")
          }
          options={[
            { value: "study", label: "Study" },
            { value: "personal", label: "Personal" },
          ]}
        />
        <div className="mt-4 h-px bg-border" aria-hidden="true" />
        <div className="mt-5 grid items-start gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div
            id="pane-study"
            className={cn(
              "min-w-0",
              mobilePane !== "study" && "hidden xl:block",
            )}
          >
            {planApi.error && !plan ? (
              <PlanErrorCard
                message={planApi.error}
                onRetry={() => void planApi.refresh()}
              />
            ) : !plan ? (
              <div className="flex flex-col gap-4">
                <Skeleton height={208} />
                <Skeleton height={96} />
              </div>
            ) : (
              <Swap swapKey={activeDate}>
                <TodayFocusPanel
                  plan={plan}
                  today={today}
                  date={activeDate}
                  planApi={planApi}
                  onOpenDay={onOpenDay}
                />
              </Swap>
            )}
          </div>
          <div
            id="pane-personal"
            className={cn(
              "min-w-0",
              mobilePane !== "personal" && "hidden xl:block",
            )}
          >
            <PersonalTodos
              compact
              dashboardColumn
              initialDate={today}
              focusDate={activeDate}
              onOpenAi={onOpenPersonalAi}
            />
          </div>
        </div>
      </section>

      <section className="mt-6" aria-label="This week">
        {plan ? (
          <WeekStripPanel plan={plan} today={today} onOpenDay={onOpenDay} />
        ) : (
          <WeekStripSkeleton />
        )}
      </section>

      {plan && (
        <div className="mt-6 grid items-start gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
          <StudyPipelinePanel plan={plan} today={today} onOpenDay={onOpenDay} />
          <div className="flex min-w-0 flex-col gap-4">
            <RecentAttemptsPanel
              attempts={attempts}
              onOpenAttempt={onOpenAttempt}
              onAdd={onAdd}
              onViewAll={onViewAll}
            />
            {coach}
          </div>
        </div>
      )}

      {/* Awareness, not analysis: the four headline figures and a trend
          line, with the full workspace one click away. The detailed charts
          live at /performance and are never duplicated here. */}
      <section className="mt-6" aria-label="Performance preview">
        <PerformancePreview
          analytics={analytics}
          target={target}
          loading={loading}
          onAdd={onAdd}
        />
      </section>
    </div>
  );
}

function RecentAttemptsPanel({
  attempts,
  onOpenAttempt,
  onAdd,
  onViewAll,
}: {
  attempts: Attempt[];
  onOpenAttempt: (attempt: Attempt) => void;
  onAdd: () => void;
  onViewAll: () => void;
}) {
  const visible = attempts.slice(0, 4);
  return (
    <Panel
      dense
      icon="history"
      title="Recent attempts"
      description="Actual attempt data from your latest mocks."
      action={
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[12px] font-medium text-primary transition-colors hover:text-primary/80"
        >
          View all <PlainIcon name="arrowRight" size={12} />
        </button>
      }
    >
      <div className="px-4 pb-3.5">
        {visible.length ? (
          <ul className="flex flex-col gap-2">
            {visible.map((attempt) => (
              <li key={attempt.id}>
                <AttemptRecordCard attempt={attempt} onOpen={onOpenAttempt} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-[14px] bg-background px-4 py-4 text-center shadow-[inset_0_0_0_1px_var(--border)]">
            <p className="text-xs leading-relaxed text-muted-foreground">
              No saved attempts match this view.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <Button size="sm" variant="outline" onClick={onViewAll}>
                Open history
              </Button>
              <Button
                size="sm"
                onClick={onAdd}
                icon={<PlusSignIcon size={13} animateOnHover animateOnTap />}
              >
                Log a mock
              </Button>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}
