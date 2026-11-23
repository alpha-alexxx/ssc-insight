"use client";
import { PlainIcon, type IconName } from "@/components/icon";
import { ProgressRule } from "@/components/shared/plan/plan-shared";
import { shortDate } from "@/lib/format";
import {
  isMockType,
  nextMockDay,
  weekRange,
  type PlanDayView,
  type PlanTaskView,
} from "@/lib/plan/view-model";
import {
  countEntries,
  datesBetween,
  entriesFor,
  type CalendarIndex,
  type CalendarLayer,
} from "@/lib/plan/calendar-entries";

/**
 * The calendar's divided metric strip: next mock, plan completion, this week's
 * load, and scheduled mocks done — all derived from the plan payload, with the
 * personal layer's outstanding count folded into the "this week" hint when it
 * is visible. Two cells are deliberately static: they have no surface to open,
 * and inventing one would be worse than the documented exception.
 *
 * Hairline rebuild: the strip's cells are token-composed cards (the shared
 * `metric-strip` atom carried the retired palette classes); the 2px rule is
 * the shared `ProgressRule`.
 */
export function CalendarMetrics({
  index,
  layers,
  today,
  onOpenNextMock,
  onOpenWeek,
  onOpenDate,
}: {
  index: CalendarIndex;
  layers: readonly CalendarLayer[];
  today: string;
  onOpenNextMock: (found: { task: PlanTaskView; day: PlanDayView }) => void;
  onOpenWeek: () => void;
  onOpenDate: (iso: string) => void;
}) {
  const days = [...index.planDayByDate.values()];
  const totals = index.totals;
  const next = nextMockDay(days, today);

  const week = weekRange(today);
  const weekDates = datesBetween(index, week.from, week.to, layers);
  const weekCounts = weekDates.reduce(
    (acc, date) => {
      const counts = countEntries(entriesFor(index, date, layers));
      return {
        planDone: acc.planDone + counts.plan.done,
        planTotal: acc.planTotal + counts.plan.total,
        tasks: acc.tasks + counts.tasks.total,
        mocks: acc.mocks + counts.mocks,
      };
    },
    { planDone: 0, planTotal: 0, tasks: 0, mocks: 0 },
  );

  const planPct =
    totals.plan.total === 0
      ? 0
      : Math.round((totals.plan.done / totals.plan.total) * 100);
  const mocks = days.flatMap((day) =>
    day.tasks.filter((task) => isMockType(task.type)),
  );
  const mocksDone = mocks.filter((task) => task.completed).length;

  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      role="group"
      aria-label="Calendar overview"
    >
      <MetricCell
        label="Next mock"
        icon="file"
        value={next ? shortDate(next.task.date) : "—"}
        hint={
          next
            ? next.task.name
            : totals.plan.total > 0
              ? "Every mock in the plan is done"
              : "No mock scheduled"
        }
        pct={null}
        onClick={next ? () => onOpenNextMock(next) : undefined}
      />
      <MetricCell
        label="Plan completed"
        icon="target"
        value={`${planPct}%`}
        hint={`${totals.plan.done} of ${totals.plan.total} scheduled`}
        pct={planPct / 100}
        onClick={
          days.length
            ? () => {
                const inPlan = days.find((day) => day.date >= today) ?? days[0];
                if (inPlan) onOpenDate(inPlan.date);
              }
            : undefined
        }
      />
      <MetricCell
        label="This week"
        icon="calendar"
        value={
          weekCounts.planTotal > 0
            ? `${weekCounts.planDone}/${weekCounts.planTotal}`
            : "—"
        }
        hint={
          weekCounts.tasks || weekCounts.mocks
            ? `${weekCounts.tasks} personal · ${weekCounts.mocks} logged`
            : `${shortDate(week.from)} – ${shortDate(week.to)}`
        }
        pct={
          weekCounts.planTotal > 0
            ? weekCounts.planDone / weekCounts.planTotal
            : null
        }
        onClick={onOpenWeek}
      />
      <MetricCell
        label="Mocks done"
        icon="success"
        value={`${mocksDone}/${mocks.length}`}
        hint="Scheduled mocks completed"
        pct={mocks.length > 0 ? mocksDone / mocks.length : null}
      />
    </div>
  );
}

/** One cell of the strip: a label, one serif figure, one quiet hint line, and
 * a 2px progress rule. A cell is a button or plain content depending on
 * whether it has a destination — static cells suppress the chevron and the
 * hover fill. */
function MetricCell({
  label,
  icon,
  value,
  hint,
  pct,
  tone,
  onClick,
}: {
  label: string;
  icon: IconName;
  value: string;
  hint: string;
  /** 0–1 progress for the rule; null renders a decorative empty rule. */
  pct: number | null;
  /** Semantic tone for the figure itself (danger when work is overdue). */
  tone?: "danger";
  onClick?: () => void;
}) {
  const inner = (
    <>
      <span className="flex items-center gap-1.5">
        <PlainIcon name={icon} size={13} className="shrink-0 text-primary" />
        <span className="truncate text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </span>
        {onClick && (
          <PlainIcon
            name="chevronRight"
            size={13}
            className="ml-auto shrink-0 text-muted-foreground"
          />
        )}
      </span>
      <span className="mt-1 block font-serif text-xl tabular-nums leading-none text-foreground">
        <span className={tone === "danger" ? "text-destructive" : undefined}>
          {value}
        </span>
      </span>
      <span className="mt-1 block truncate text-[12px] text-muted-foreground">
        {hint}
      </span>
      <span className="mt-2 block" aria-hidden={pct == null ? true : undefined}>
        {pct != null ? (
          <ProgressRule
            done={Math.round(pct * 100)}
            total={100}
            label={label}
            className="w-full"
          />
        ) : (
          <span className="block h-0.5 w-full overflow-hidden rounded-full bg-border">
            <span style={{ width: 0 }} />
          </span>
        )}
      </span>
    </>
  );
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="rounded-2xl bg-card p-3 text-left shadow-[inset_0_0_0_1px_var(--border)] transition-colors hover:bg-accent"
        aria-label={`${label}: ${value}. ${hint}`}
      >
        {inner}
      </button>
    );
  }
  return (
    <div className="cursor-default rounded-2xl bg-card p-3 shadow-[inset_0_0_0_1px_var(--border)]">
      {inner}
    </div>
  );
}
