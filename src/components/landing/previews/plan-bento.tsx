import { cn } from "@/lib/utils";
import { LANDING_SUMMARY } from "../fixtures";
import type { LandingPlanData } from "../plan-facts";
import { AiPanel } from "../mockups/ai-panel";
import { MockChip, MockTrend } from "../mockups/data-parts";
import type { LandingPlanTileKind } from "./types";

const PHASE_STYLES = [
  "bg-primary/15 text-primary",
  "bg-muted text-muted-foreground",
  "bg-success/15 text-success",
  "bg-warning/15 text-warning",
];

function phaseStyle(phase: number) {
  return PHASE_STYLES[(Math.max(1, phase) - 1) % PHASE_STYLES.length];
}

export function PlanScheduleTile() {
  const trend = LANDING_SUMMARY.trend;
  const latest = trend.at(-1);
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Latest full-mock score</p>
          <p className="mt-1 font-serif text-3xl leading-none tabular-nums">
            {latest?.percentage.toFixed(1) ?? "—"}%
          </p>
        </div>
        <p className="text-right text-xs leading-relaxed text-muted-foreground">
          {LANDING_SUMMARY.latestScore} / {LANDING_SUMMARY.latestMax} marks
          <br />{trend.length} dated results
        </p>
      </div>
      <div className="mt-5 h-36">
        <MockTrend points={trend} target={LANDING_SUMMARY.targetPercentage} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Score percentage by attempt date · dashed line is the {LANDING_SUMMARY.targetMarks}/{LANDING_SUMMARY.latestMax} sample target.
      </p>
    </div>
  );
}

export function PlanPhaseTile({ plan }: { plan: LandingPlanData }) {
  return (
    <div>
      <div className="grid grid-cols-10 gap-1" aria-label={`${plan.days.length} plan days`}>
        {plan.days.map((day) => (
          <span
            key={day.day}
            title={`Day ${day.day}: ${day.dayType}, ${day.taskCount} assignments`}
            className={cn(
              "flex aspect-square items-center justify-center rounded-[2px] text-[8px] tabular-nums",
              phaseStyle(day.phase),
              day.day === plan.sampleDay.day && "ring-1 ring-primary ring-offset-1 ring-offset-card",
            )}
          >
            {day.day}
          </span>
        ))}
      </div>
      <ol className="mt-5 divide-y divide-border border-y border-border">
        {plan.phases.map((phase) => {
          const days = plan.days.filter((day) => day.phase === phase.phase);
          const tasks = days.reduce((sum, day) => sum + day.taskCount, 0);
          return (
            <li key={phase.phase} className="flex items-center gap-3 py-2.5 text-xs">
              <span className={cn("grid size-6 shrink-0 place-items-center rounded-full tabular-nums", phaseStyle(phase.phase))}>
                {phase.phase}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-foreground">{phase.name}</span>
                <span className="text-muted-foreground">Days {phase.days} · {days.length} days</span>
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">{tasks} tasks</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function PlanDayTile({ plan }: { plan: LandingPlanData }) {
  const day = plan.sampleDay;
  return (
    <div>
      <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">Day {day.day} of {plan.days.length}</p>
          <p className="mt-1 font-serif text-xl leading-tight">{day.dayType}</p>
          <p className="mt-1 text-xs text-muted-foreground">{day.phaseName} · {day.date}</p>
        </div>
        <MockChip>{day.tasks.length} tasks</MockChip>
      </div>
      <ul className="mt-3 space-y-2">
        {day.tasks.map((task) => (
          <li key={task.name} className="flex items-start gap-2 text-xs">
            <span aria-hidden="true" className="mt-0.5 size-3 shrink-0 rounded-[2px] border border-border" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-foreground">{task.name}</span>
              <span className="text-muted-foreground">{task.category} · {task.questions} Q · {task.marks} marks</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 border-t border-border pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Daily habits · kept separate</p>
        <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {day.checklist.map((item) => (
            <li key={item} className="flex items-start gap-1.5 text-[11px] leading-snug text-muted-foreground">
              <span aria-hidden="true" className="mt-0.5 size-2.5 shrink-0 rounded-[2px] border border-border" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function PlanWorkloadTile({ plan }: { plan: LandingPlanData }) {
  const maximum = Math.max(1, ...plan.days.map((day) => day.taskCount));
  const busiest = plan.days.reduce((current, day) => day.taskCount > current.taskCount ? day : current, plan.days[0]!);
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-serif text-3xl leading-none tabular-nums">{plan.taskCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">assignments from actual plan rows</p>
        </div>
        <p className="text-right text-xs text-muted-foreground">Busiest: day {busiest.day}<br />{busiest.taskCount} assignments</p>
      </div>
      <div className="mt-5 flex h-32 items-end gap-[2px]" aria-label="Assignments per plan day" role="img">
        {plan.days.map((day) => (
          <span
            key={day.day}
            title={`Day ${day.day}: ${day.taskCount} assignments`}
            className={cn("min-w-0 flex-1 rounded-t-[2px]", day.hasMock ? "bg-primary" : "bg-chart-2")}
            style={{ height: `${(day.taskCount / maximum) * 100}%`, minHeight: day.taskCount ? "3px" : "1px" }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] tabular-nums text-muted-foreground">
        <span>Day 1</span><span>{plan.days.length} days</span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Primary bars mark days containing a full-length mock: {plan.mockDayCount} in this schedule.
      </p>
    </div>
  );
}

/** Optional fourth visual: the coach remains illustrative and read-only. */
export function PlanCoachTile() {
  return <AiPanel />;
}

export function PlanBentoTile({ kind, plan }: { kind: LandingPlanTileKind; plan: LandingPlanData }) {
  if (kind === "schedule") return <PlanScheduleTile />;
  if (kind === "day") return <PlanDayTile plan={plan} />;
  if (kind === "phases") return <PlanPhaseTile plan={plan} />;
  return <PlanWorkloadTile plan={plan} />;
}
