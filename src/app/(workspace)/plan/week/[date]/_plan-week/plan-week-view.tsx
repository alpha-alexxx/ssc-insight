"use client";

import Link from "next/link";
import { useMemo } from "react";
import { PageHeader } from "@/components/page-header";
import { PlainIcon } from "@/components/icon";
import { Button } from "@/components/button";
import { Skeleton } from "@/components/skeleton";
import { PlanErrorCard, ProgressRule } from "@/components/shared/plan/plan-shared";
import {
  addIsoDays,
  dayAssignmentStats,
  isoWeekdayName,
  isMockType,
  planProgressStats,
  revisionQueue,
  weekRange,
  type PlanDayView,
} from "@/lib/plan/view-model";
import { longDate, shortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { usePlanData } from "@/components/use-plan-data";

/**
 * Weekly planner — the "when do I study it" surface the day page could not
 * answer alone.
 *
 * Seven days from the week containing the selected date, each with its
 * scheduled work, its completion rule and the outstanding revision. It is a
 * reading of the SAME merged plan payload the dashboard, calendar and day
 * view use, so nothing here is derived a second time. The week is a real
 * address (`/plan/week/<date>`) that can be linked and stepped.
 *
 * Hairline rebuild: the panels are token-composed cards
 * (rounded-2xl bg-card + inset hairline border); week navigation links are
 * token-styled pills.
 */
export function PlanWeekView({
  date,
  planApi,
  onOpenDay,
}: {
  date: string;
  planApi: ReturnType<typeof usePlanData>;
  onOpenDay: (date: string) => void;
}) {
  const { plan, loading, error, refresh } = planApi;
  const range = useMemo(() => weekRange(date), [date]);

  const days = useMemo(() => {
    if (!plan) return [];
    const byDate = new Map<string, PlanDayView>(
      plan.days.map((day) => [day.date, day]),
    );
    return Array.from({ length: 7 }, (_, index) => {
      const iso = addIsoDays(range.from, index);
      return { date: iso, planDay: byDate.get(iso) ?? null };
    });
  }, [plan, range.from]);

  const stats = useMemo(
    () => (plan ? planProgressStats(plan.days) : null),
    [plan],
  );
  const revisions = useMemo(
    () => (plan ? revisionQueue(plan.days, date).items.slice(0, 6) : []),
    [date, plan],
  );

  if (loading && !plan)
    return (
      <div className="space-y-3" aria-busy="true">
        <Skeleton className="h-9 w-64" />
        <Skeleton shape="block" height={256} className="rounded-2xl" />
      </div>
    );
  if (!plan || error)
    return (
      <PlanErrorCard
        message={error ?? "Check your connection, then try again."}
        onRetry={() => void refresh()}
      />
    );

  const prevWeek = addIsoDays(range.from, -7);
  const nextWeek = addIsoDays(range.from, 7);
  const sameMonth = range.from.slice(0, 7) === range.to.slice(0, 7);
  const weekNumber = plan.days.find((day) => day.date === range.from)?.day;

  return (
    <div>
      <PageHeader
        title="This week"
        description={
          sameMonth
            ? `${shortDate(range.from)} – ${shortDate(range.to)}`
            : `${longDate(range.from)} – ${longDate(range.to)}`
        }
        meta={
          <>
            {weekNumber ? (
              <span>Plan week starting day {weekNumber}</span>
            ) : (
              <span>Outside the 50-day plan window</span>
            )}
            {stats && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  {stats.completedAssignments} of {stats.totalAssignments}{" "}
                  assignments done ({stats.completionPct}%)
                </span>
              </>
            )}
          </>
        }
        actions={
          <div className="flex items-center gap-1.5">
            <Link
              href={`/plan/week/${prevWeek}`}
              aria-label="Previous week"
              className="inline-flex h-7 items-center gap-1 rounded-full px-3 text-[12px] font-medium text-foreground shadow-[inset_0_0_0_1px_var(--border)] transition-colors hover:bg-accent"
            >
              <PlainIcon name="arrowLeft" size={13} /> Prev
            </Link>
            <Link
              href={`/plan/week/${addIsoDays(date, 0)}`}
              className="inline-flex h-7 items-center rounded-full px-3 text-[12px] font-medium text-foreground shadow-[inset_0_0_0_1px_var(--border)] transition-colors hover:bg-accent"
            >
              This day
            </Link>
            <Link
              href={`/plan/week/${nextWeek}`}
              aria-label="Next week"
              className="inline-flex h-7 items-center gap-1 rounded-full px-3 text-[12px] font-medium text-foreground shadow-[inset_0_0_0_1px_var(--border)] transition-colors hover:bg-accent"
            >
              Next <PlainIcon name="arrowRight" size={13} />
            </Link>
          </div>
        }
      />

      <section className="overflow-hidden rounded-2xl bg-card shadow-[inset_0_0_0_1px_var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3 px-4 pb-3 pt-4 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <span
              aria-hidden="true"
              className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"
            >
              <PlainIcon name="calendar" size={16} />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-foreground">
                The week&apos;s schedule
              </h2>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                Open any day for its full workspace, checklist and results.
              </p>
            </div>
          </div>
        </div>
        <ol className="divide-y divide-border">
          {days.map(({ date: iso, planDay }) => (
            <WeekRow
              key={iso}
              date={iso}
              day={planDay}
              isToday={iso === plan.today}
              onOpenDay={onOpenDay}
            />
          ))}
        </ol>
      </section>

      {revisions.length > 0 && (
        <section className="mt-4 overflow-hidden rounded-2xl bg-card shadow-[inset_0_0_0_1px_var(--border)]">
          <div className="flex flex-wrap items-start justify-between gap-3 px-4 pb-3 pt-4 sm:px-6">
            <div className="flex min-w-0 items-start gap-3">
              <span
                aria-hidden="true"
                className="grid size-8 shrink-0 place-items-center rounded-lg bg-warning/10 text-warning"
              >
                <PlainIcon name="refresh" size={16} />
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-foreground">
                  Outstanding revision
                </h2>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  Revision completes only when you tick it — never automatically.
                </p>
              </div>
            </div>
          </div>
          <ul className="divide-y divide-border">
            {revisions.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-2.5 sm:px-6"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm text-foreground">
                    {item.label}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    Day {item.day} · {shortDate(item.date)} ·{" "}
                    {item.kind.toUpperCase()}
                  </span>
                </span>
                <Link
                  href={`/plan/${item.date}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Open day <PlainIcon name="arrowRight" size={12} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function WeekRow({
  date,
  day,
  isToday,
  onOpenDay,
}: {
  date: string;
  day: PlanDayView | null;
  isToday: boolean;
  onOpenDay: (date: string) => void;
}) {
  const assignment = day ? dayAssignmentStats(day) : null;
  const pct =
    assignment && assignment.total
      ? (assignment.completed / assignment.total) * 100
      : 0;
  return (
    <li className="flex flex-wrap items-start gap-3 px-4 py-3 sm:flex-nowrap sm:px-6">
      <div className="w-24 shrink-0">
        <p
          className={cn(
            "text-[11px] font-semibold uppercase tracking-[0.1em]",
            isToday ? "text-primary" : "text-muted-foreground",
          )}
        >
          {isoWeekdayName(date)}
        </p>
        <p className="font-serif text-lg leading-tight tabular-nums text-foreground">
          {shortDate(date)}
        </p>
        {isToday && (
          <p className="text-[11px] font-medium uppercase tracking-wide text-primary">
            Today
          </p>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {day ? (
          <>
            <p className="text-[11px] text-muted-foreground">
              Day {day.day} of 50 · Phase {day.phase}
            </p>
            <ul className="mt-1 space-y-0.5">
              {day.tasks.map((task) => (
                <li
                  key={task.key}
                  className="flex items-baseline gap-2 text-[13px]"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-1 size-1.5 shrink-0",
                      task.completed ? "bg-success" : "bg-border",
                    )}
                  />
                  <span
                    className={cn(
                      "min-w-0 truncate",
                      task.completed ? "text-muted-foreground line-through" : "text-foreground",
                    )}
                  >
                    {task.name}
                  </span>
                  {isMockType(task.type) && (
                    <span className="shrink-0 text-[11px] uppercase tracking-wide text-primary">
                      Mock
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {assignment && (
              <div className="mt-1.5 flex items-center gap-2">
                <ProgressRule
                  done={assignment.completed}
                  total={assignment.total}
                  label={`Day ${day.day} assignments`}
                  className="max-w-40"
                />
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  {assignment.completed}/{assignment.total}
                </span>
              </div>
            )}
          </>
        ) : (
          <p className="text-[13px] text-muted-foreground">
            Outside the plan window — open the day for personal tasks and
            logged results.
          </p>
        )}
      </div>

      <Button
        size="sm"
        variant="outline"
        className="shrink-0"
        onClick={() => onOpenDay(date)}
      >
        Open day <PlainIcon name="arrowRight" size={12} />
      </Button>
      <span className="sr-only">
        {pct === 0 ? "Nothing complete" : `${Math.round(pct)} percent complete`}
      </span>
    </li>
  );
}
