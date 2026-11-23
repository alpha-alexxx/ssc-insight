import { LANDING_PLAN } from "@/components/landing/plan-data";
import { cn } from "@/lib/utils";

/**
 * The sign-up plate: the 50-day plan reading.
 *
 * The plan's own phase rhythm, drawn as a quiet token grid — fifty day cells
 * phased by the real study plan, the phase names and counts as editorial
 * figures. Sourced from the server-side plan facts (validated by the app's
 * own schema, counts derived from actual rows), so the art repeats what the
 * product's planner genuinely schedules.
 *
 * The plate never remaps semantic tokens; it reads the `--plate-*` variables
 * in every palette × style × light/dark combination.
 */

export function SignUpPlateArt() {
  const { days, phases, taskCount, mockDayCount } = LANDING_PLAN;

  return (
    <div className="flex w-full max-w-[26rem] flex-col gap-9">
      <div>
        <p className="auth-plate-title">
          A schedule that doesn&apos;t move —
          <span className="block">built before you sign in.</span>
        </p>
      </div>

      {/* The plan grid: one cell per scheduled day, tinted by phase, mock
          days carrying the accent ring. */}
      <div aria-hidden="true" className="grid grid-cols-10 gap-[5px]">
        {days.map((day) => (
          <span
            key={day.day}
            className={cn(
              "aspect-square rounded-[2px]",
              day.phase === 1 && "bg-[var(--plate-fg)] opacity-25",
              day.phase === 2 && "bg-[var(--plate-fg)] opacity-55",
              day.phase === 3 && "bg-[var(--plate-fg)] opacity-90",
              day.hasMock && "ring-1 ring-accent ring-offset-1 ring-offset-[var(--plate-bg)]",
            )}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--plate-rule-soft)] pt-5">
        {phases.map((phase) => (
          <div
            key={phase.phase}
            className="flex items-baseline justify-between gap-4"
          >
            <p className="text-sm text-[var(--plate-fg)]">
              <span className="font-medium">{phase.name}</span>
              <span className="ml-2 text-xs text-[var(--plate-muted)] tabular-nums">
                days {phase.from}–{phase.to}
              </span>
            </p>
            <p className="text-xs text-[var(--plate-muted)] tabular-nums">
              {days.filter((day) => day.phase === phase.phase && day.hasMock).length}{" "}
              mock days
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs leading-relaxed text-[var(--plate-muted)]">
        {taskCount} scheduled tasks · {mockDayCount} full-length mock days ·
        every day keeps its source link
      </p>
    </div>
  );
}
