import type { LandingPlanData } from "./plan-facts";
import { cn } from "@/lib/utils";

/**
 * The 50-day plan, drawn as a specimen grid.
 *
 * Phase tints use soft semantic tokens, so every palette resolves without a
 * per-palette rule. Shape carries the category alongside colour (the plan
 * cells differ in fill, not only hue), and the whole strip is exposed as a
 * list so a screen reader hears the days rather than decoration.
 */

/** The plan's phases, tinted with soft semantic tokens. */
const PHASE_SWATCH: Record<number, string> = {
  1: "bg-primary/10",
  2: "bg-muted",
  3: "bg-success/10",
};

const PHASE_CELL: Record<number, string> = PHASE_SWATCH;

/** The layered inset shadow of one plan cell: its hairline, mock edge, today ring. */
function planCellShadow(day: { day: number; hasMock: boolean }): string {
  return [
    day.day === 3
      ? "inset 0 0 0 2px var(--primary)"
      : "inset 0 0 0 1px var(--border)",
    day.hasMock ? "inset 0 -2px 0 0 var(--primary)" : null,
  ]
    .filter(Boolean)
    .join(", ");
}

export function PlanGrid({ plan }: { plan: LandingPlanData }) {
  return (
    <div
      className="grid grid-cols-10 gap-1 md:grid-cols-[repeat(25,minmax(0,1fr))]"
      role="list"
      aria-label="50-day study plan"
    >
      {plan.days.map((day) => (
        <div
          key={day.day}
          role="listitem"
          className={cn(
            "flex aspect-square items-center justify-center rounded-[3px]",
            PHASE_CELL[day.phase] ?? "bg-card",
          )}
          style={{ boxShadow: planCellShadow(day) }}
          title={`Day ${day.day} · ${day.weekday} ${day.date} · ${day.dayType} · ${day.taskCount} tasks`}
        >
          <span aria-hidden="true" className="text-[9px] tabular-nums text-muted-foreground">
            {day.day}
          </span>
          <span className="sr-only">
            Day {day.day}, {day.weekday}, {day.dayType}, {day.taskCount} tasks
          </span>
        </div>
      ))}
    </div>
  );
}

export function PlanLegend({ plan }: { plan: LandingPlanData }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
      {plan.phases.map((phase) => (
        <li key={phase.phase} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="size-2.5 rounded-[2px] shadow-[inset_0_0_0_1px_var(--border)]"
            style={
              phase.phase === 1
                ? { background: "var(--primary)" }
                : phase.phase === 2
                  ? { background: "var(--muted)" }
                  : { background: "var(--success)" }
            }
          />
          <span>
            Phase {phase.phase} · {phase.name}
            <span className="text-muted-foreground/70"> · days {phase.days}</span>
          </span>
        </li>
      ))}
      <li className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="h-2.5 w-2.5 rounded-[2px] bg-card shadow-[inset_0_0_0_1px_var(--border),inset_0_-2px_0_0_var(--primary)]"
        />
        <span>Mock day · {plan.mockDayCount} of {plan.days.length}</span>
      </li>
    </ul>
  );
}
