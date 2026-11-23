"use client";

import Link from "next/link";
import { PlainIcon } from "@/components/icon";
import { Skeleton } from "@/components/skeleton";
import { ProgressRule } from "@/components/shared/plan/plan-shared";
import {
  addIsoDays,
  dayAssignmentStats,
  isMockType,
  nextRecommendedAction,
  type PlanDayView,
} from "@/lib/plan/view-model";
import { longDate, shortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The study plan's expectations, inside My Tasks.
 *
 * My Tasks used to be a sealed todo app: it imported no plan or attempt
 * module at all, so a user planning tomorrow's revision had no idea the plan
 * already scheduled a sectional that day. This rail is read-only — it shows
 * what the schedule expects and links to the day; completing plan work stays
 * on the plan surfaces, because a personal task and a plan assignment are
 * deliberately different records.
 *
 * Hairline rebuild: token-composed panel card; navigation links are
 * token-styled pills.
 */
export function PlanRail({
  plan,
  today,
}: {
  plan: {
    today: string;
    days: PlanDayView[];
  } | null;
  today: string;
}) {
  if (!plan) {
    return (
      <section className="rounded-2xl bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)]" aria-label="Study plan">
        <h3 className="text-base font-semibold text-foreground">Study plan</h3>
        <p className="mt-1 text-[12px] text-muted-foreground">Loading today&apos;s plan…</p>
        <Skeleton shape="block" height={64} className="mt-3 rounded-lg" />
      </section>
    );
  }

  const byDate = new Map(plan.days.map((day) => [day.date, day]));
  const todayDay = byDate.get(today) ?? null;
  const tomorrowDay = byDate.get(addIsoDays(today, 1)) ?? null;
  const recommended = nextRecommendedAction(plan.days, today);
  const todayStats = todayDay ? dayAssignmentStats(todayDay) : null;

  return (
    <section className="rounded-2xl bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)]" aria-label="Study plan">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold text-foreground">Study plan</h3>
        <Link
          href={`/plan/week/${today}`}
          className="inline-flex min-h-9 items-center text-[11px] font-medium text-primary hover:underline"
        >
          This week →
        </Link>
      </div>
      <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
        What the schedule expects. Completing plan work happens on the plan.
      </p>

      {todayDay ? (
        <div className="mt-3">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Today · Day {todayDay.day}
            </p>
            {todayStats && (
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {todayStats.completed}/{todayStats.total}
              </span>
            )}
          </div>
          {todayStats && (
            <ProgressRule
              done={todayStats.completed}
              total={todayStats.total}
              label="Today's plan assignments"
              className="mt-1.5"
            />
          )}
          <ul className="mt-2 space-y-1">
            {todayDay.tasks.length === 0 && (
              <li className="text-[12px] text-muted-foreground">No assignments scheduled.</li>
            )}
            {todayDay.tasks.slice(0, 4).map((task) => (
              <li
                key={task.key}
                className="flex items-baseline gap-2 text-[12px]"
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
            {todayDay.tasks.length > 4 && (
              <li className="text-[12px] text-muted-foreground">
                +{todayDay.tasks.length - 4} more assignment
                {todayDay.tasks.length - 4 === 1 ? "" : "s"}
              </li>
            )}
          </ul>
        </div>
      ) : (
        <p className="mt-3 text-[12px] text-muted-foreground">
          Today is outside the 50-day plan window.
        </p>
      )}

      {tomorrowDay && (
        <div className="mt-3 border-t border-border pt-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Tomorrow · Day {tomorrowDay.day}
          </p>
          <p className="mt-0.5 text-[12px] text-foreground">
            {tomorrowDay.tasks.length
              ? `${tomorrowDay.tasks.length} assignment${tomorrowDay.tasks.length === 1 ? "" : "s"} — ${tomorrowDay.tasks[0]!.name}${tomorrowDay.tasks.length > 1 ? "…" : ""}`
              : "Nothing scheduled."}
          </p>
        </div>
      )}

      {recommended && (
        <div className="mt-3 rounded-xl bg-muted/40 p-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {recommended.overdue ? "Carried over" : "Next up"}
          </p>
          <p className="mt-0.5 text-[12px] leading-snug text-foreground">
            {recommended.task.name}
          </p>
          <p className="text-[12px] text-muted-foreground">
            Day {recommended.day.day} · {shortDate(recommended.day.date)}
          </p>
          <Link
            href={`/plan/${recommended.day.date}`}
            className="mt-2 inline-flex min-h-9 w-full items-center justify-center gap-1 rounded-full px-3 text-[12px] font-medium text-foreground shadow-[inset_0_0_0_1px_var(--border)] transition-colors hover:bg-accent"
          >
            Open day <PlainIcon name="arrowRight" size={12} />
          </Link>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-2.5">
        <Link
          href={`/plan/${today}`}
          className="inline-flex min-h-9 items-center text-[11px] font-medium text-primary hover:underline"
        >
          Today&apos;s workspace
        </Link>
        <span aria-hidden="true" className="text-muted-foreground">
          ·
        </span>
        <Link
          href="/calendar"
          className="inline-flex min-h-9 items-center text-[11px] font-medium text-primary hover:underline"
        >
          Calendar
        </Link>
        <span aria-hidden="true" className="text-muted-foreground">
          ·
        </span>
        <span className="text-[12px] text-muted-foreground">
          {longDate(today)}
        </span>
      </div>
    </section>
  );
}
