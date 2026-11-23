"use client";
import Link from "next/link";
import type { ComponentProps } from "react";
import { PlainIcon } from "@/components/icon";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { ProgressRule } from "@/components/shared/plan/plan-shared";
import { cn } from "@/lib/utils";
import { longDate, shortDate } from "@/lib/format";
import {
  dayTypeLabel,
  isoWeekdayName,
  type PlanDayView,
} from "@/lib/plan/view-model";
import type { CalendarEntry, EntryCounts } from "@/lib/plan/calendar-entries";
import { DaySections, type DayActions } from "./day-sections";

/**
 * The day ledger — the calendar's most characteristic surface.
 *
 * A printed timetable has a **margin**: the date sits in a narrow gutter with a
 * vertical rule, and the day's work runs beside it as ruled rows. That is the
 * structure here, rather than a stack of cards. The margin carries what
 * identifies the day (numeral, weekday, plan position); the body carries a
 * single load line and the four ruled sections.
 *
 * One implementation, three hosts: the Day surface body (`variant="surface"`),
 * the desktop rail (`"rail"`), and the phone drawer (`"drawer"`).
 *
 * Hairline rebuild: the ledger is a token-composed card
 * (rounded-2xl bg-card + inset hairline border); the timetable margin is a
 * bordered gutter column, and an empty day (a rest day, or a date outside
 * the plan with nothing on it) is the Hairline EmptyState with the same two
 * actions the ledger footer offers.
 */

export type DayLedgerProps = {
  date: string;
  day: PlanDayView | undefined;
  entries: readonly CalendarEntry[];
  counts: EntryCounts;
  today: string;
  planLength: number;
  planStart: string;
  planEnd: string;
  actions: DayActions;
  onAddMock: (date: string) => void;
  onAddPersonal: (date: string) => void;
  onMarkAllDone?: () => void;
  onGoToToday?: () => void;
  onGoToPlanStart?: () => void;
  variant?: "surface" | "rail" | "drawer";
  touchHandlers?: Pick<ComponentProps<"div">, "onTouchStart" | "onTouchEnd">;
};

export function DayLedger({
  date,
  day,
  entries,
  counts,
  today,
  planLength,
  planStart,
  planEnd,
  actions,
  onAddMock,
  onAddPersonal,
  onMarkAllDone,
  onGoToToday,
  onGoToPlanStart,
  variant = "surface",
  touchHandlers,
}: DayLedgerProps) {
  const inPlan = Boolean(day);
  const isToday = date === today;
  const nothingAtAll = entries.length === 0;
  const rail = variant === "rail";

  const body = (
    <>
      <div className={cn("flex gap-4 border-b border-border px-4 py-4 sm:px-6", rail && "sm:px-5")}>
        {/* ---- margin: the date as a ledger entry ---- */}
        <div className="hidden w-16 shrink-0 border-r border-border pr-3 text-center sm:block">
          <span className="block font-serif text-[1.375rem] tabular-nums leading-none text-foreground">
            {Number(date.slice(8))}
          </span>
          <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {isoWeekdayName(date).slice(0, 3)}
          </span>
        </div>

        {/* ---- body ---- */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h2 className="font-serif text-[1.375rem] font-medium leading-tight tracking-[-0.02em] text-foreground">
              {isoWeekdayName(date)}, {longDate(date)}
            </h2>
            {isToday && (
              <span className="rounded-full bg-foreground px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-background">
                Today
              </span>
            )}
          </div>

          <p className="mt-1 text-[12px] text-muted-foreground">
            {day ? (
              <>
                Day {day.day} of {planLength} · Phase {day.phase} ·{" "}
                {dayTypeLabel(day.dayType)}
              </>
            ) : (
              <>
                Outside the plan window · {shortDate(planStart)} –{" "}
                {shortDate(planEnd)}
              </>
            )}
          </p>

          {day && (
            <div className="mt-3 flex items-center gap-2">
              <ProgressRule
                done={counts.plan.done}
                total={counts.plan.total}
                label={`Day ${day.day}`}
                className="mt-0 flex-1"
              />
              <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                {counts.plan.done}/{counts.plan.total} scheduled
              </span>
              {onMarkAllDone && counts.plan.done < counts.plan.total && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-primary"
                  onClick={onMarkAllDone}
                >
                  Mark all done
                </Button>
              )}
            </div>
          )}

          <LoadLine counts={counts} />
        </div>
      </div>

      <DaySections
        entries={entries}
        counts={counts}
        actions={actions}
        attemptStyle={rail ? "card" : "stamp"}
        dense
        emptyHint={
          <EmptyActions
            date={date}
            inPlan={inPlan}
            onAddMock={onAddMock}
            onAddPersonal={onAddPersonal}
          />
        }
      />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border px-4 py-3">
        <Button variant="outline" size="sm" onClick={() => onAddPersonal(date)}>
          <PlainIcon name="plus" size={13} /> Add task
        </Button>
        <Button variant="outline" size="sm" onClick={() => onAddMock(date)}>
          <PlainIcon name="plus" size={13} /> Log mock
        </Button>
        {inPlan ? (
          <Link
            href={`/plan/${date}`}
            className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            Open daily workspace →
          </Link>
        ) : (
          <span className="flex flex-wrap items-center gap-3 text-xs">
            {onGoToToday && (
              <button
                type="button"
                onClick={onGoToToday}
                className="font-medium text-primary hover:text-primary/80"
              >
                Go to today
              </button>
            )}
            {onGoToPlanStart && (
              <button
                type="button"
                onClick={onGoToPlanStart}
                className="font-medium text-muted-foreground hover:text-foreground"
              >
                Day 1 · {shortDate(planStart)}
              </button>
            )}
          </span>
        )}
      </div>
    </>
  );

  if (rail) {
    return (
      <section
        className="rounded-2xl bg-card text-card-foreground shadow-[inset_0_0_0_1px_var(--border)]"
        aria-label="Selected day"
      >
        <div className="px-4 pb-2 pt-3.5">
          <h2 className="text-base font-semibold text-foreground">
            Selected day
          </h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Your schedule, tasks and results for this date.
          </p>
        </div>
        <div {...touchHandlers}>{body}</div>
      </section>
    );
  }

  return (
    <section
      className="rounded-2xl bg-card text-card-foreground shadow-[inset_0_0_0_1px_var(--border)]"
      aria-label={`Schedule for ${longDate(date)}`}
    >
      <div {...touchHandlers}>{body}</div>
      {nothingAtAll && null}
    </section>
  );
}

/** The one quiet load line: what the day holds, in words. */
function LoadLine({ counts }: { counts: EntryCounts }) {
  const parts: string[] = [];
  if (counts.rev.total) parts.push(`${counts.rev.done}/${counts.rev.total} revised`);
  if (counts.tasks.total)
    parts.push(
      `${counts.tasks.total} personal${counts.tasks.overdue ? ` (${counts.tasks.overdue} overdue)` : ""}`,
    );
  if (counts.mocks) parts.push(`${counts.mocks} logged`);
  if (!parts.length) return null;
  return (
    <p className="mt-2 border-t border-border pt-2 text-[12px] text-muted-foreground">
      {parts.join(" · ")}
    </p>
  );
}

function EmptyActions({
  date,
  inPlan,
  onAddMock,
  onAddPersonal,
}: {
  date: string;
  inPlan: boolean;
  onAddMock: (date: string) => void;
  onAddPersonal: (date: string) => void;
}) {
  return (
    <EmptyState
      scene="inbox"
      title={inPlan ? "Nothing scheduled" : "Nothing on this date"}
      description={
        inPlan
          ? "The plan marks this a rest day — add a task or log a mock."
          : "Personal tasks and logged mocks work outside the plan window too."
      }
    >
      <Button variant="outline" size="sm" onClick={() => onAddPersonal(date)}>
        <PlainIcon name="plus" size={13} /> Add task
      </Button>
      <Button variant="outline" size="sm" onClick={() => onAddMock(date)}>
        <PlainIcon name="plus" size={13} /> Log mock
      </Button>
      <span className="sr-only">
        {inPlan ? "Rest day in the plan" : "No plan work on this date"}
      </span>
    </EmptyState>
  );
}
