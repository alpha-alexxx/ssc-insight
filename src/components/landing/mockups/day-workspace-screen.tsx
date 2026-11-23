import type { LandingPlanData } from "../plan-facts";
import { cn } from "@/lib/utils";
import { MOCK_LABEL } from "./data-parts";
import { MockChip } from "./data-parts";

/**
 * The day workspace at `/plan/<date>`: the day's assignments, the four daily
 * habits, the revision block and the notes field.
 *
 * This is a different screen from the study calendar (which the showcase
 * already covers), so showing it here tells the reader something new: the
 * plan is not just a calendar, each day opens into a working page.
 *
 * Everything is real plan data — names, question counts, marks and the
 * checklist all come from `plan-data.ts`.
 */
export function DayWorkspaceScreen({ plan }: { plan: LandingPlanData }) {
  const day = plan.sampleDay;
  const first = day.tasks[0];
  const rest = day.tasks.slice(1);

  return (
    <div className="flex flex-col bg-background">
      <div className="border-b border-border px-[1em] pb-[0.7em] pt-[0.9em]">
        <div className="flex flex-wrap items-end justify-between gap-[0.5em]">
          <div>
            <p className={MOCK_LABEL}>{day.dayType} · day {day.day} of 50</p>
            <h3 className="mt-[0.15em] text-[1.7em] font-[450] tracking-[-0.03em] text-foreground">
              Day {day.day}
            </h3>
            <p className="mt-[0.1em] text-[0.82em] text-muted-foreground">
              {day.phaseName} · {day.tasks.length} assignments
            </p>
          </div>
          <div className="flex items-center gap-[0.5em]">
            <MockChip>0/{day.tasks.length} done</MockChip>
            <MockChip>0/{day.checklist.length} checklist</MockChip>
          </div>
        </div>
      </div>

      <div className="grid gap-[0.7em] px-[1em] py-[0.85em] @[620px]:grid-cols-[1.45fr_1fr]">
        <section className="rounded-xl bg-card shadow-[inset_0_0_0_1px_var(--border)]">
          <div className="flex items-baseline justify-between px-[0.85em] pb-[0.35em] pt-[0.7em]">
            <h4 className="text-[1.02em] font-[450] text-foreground">Assignments</h4>
            <span className="text-[0.72em] text-muted-foreground">
              Record results after attempting
            </span>
          </div>
          <ul className="px-[0.85em] pb-[0.75em]">
            {[first!, ...rest.slice(0, 3)].map((task, index) => (
              <li
                key={task.name}
                className="flex items-center gap-[0.5em] border-b border-border py-[0.35em] last:border-b-0"
              >
                <span
                  aria-hidden="true"
                  className="size-[0.7em] shrink-0 rounded-[2px] border border-border"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.86em] text-foreground">
                    {task.name}
                  </span>
                  <span className="block text-[0.72em] text-muted-foreground">
                    {task.questions} Q · {task.marks} marks
                  </span>
                </span>
                <MockChip>{task.short}</MockChip>
                {index === 0 ? (
                  <span className="shrink-0 rounded-full px-[0.4em] py-[0.1em] text-[0.72em] shadow-[inset_0_0_0_1px_var(--border)]">
                    Log attempt
                  </span>
                ) : null}
              </li>
            ))}
            {rest.length > 3 ? (
              <li className="pt-[0.3em] text-[0.75em] text-muted-foreground">
                +{rest.length - 3} more on this day
              </li>
            ) : null}
          </ul>
        </section>

        <div className="flex flex-col gap-[0.7em]">
          <section className={cn("rounded-xl bg-card px-[0.85em] py-[0.7em] shadow-[inset_0_0_0_1px_var(--border)]")}>
            <div className="flex items-baseline justify-between">
              <h4 className="text-[1.02em] font-[450] text-foreground">Daily checklist</h4>
              <span className="text-[0.72em] text-muted-foreground">
                0/{day.checklist.length}
              </span>
            </div>
            <p className="mt-[0.15em] text-[0.75em] text-muted-foreground">
              The plan&apos;s four habits for every study day.
            </p>
            <ul className="mt-[0.45em] flex flex-col gap-[0.25em]">
              {day.checklist.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-[0.4em] text-[0.78em] text-muted-foreground"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[0.32em] size-[0.65em] shrink-0 rounded-[2px] border border-border"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl bg-card px-[0.85em] py-[0.7em] shadow-[inset_0_0_0_1px_var(--border)]">
            <h4 className="text-[1.02em] font-[450] text-foreground">Revision</h4>
            <p className="mt-[0.15em] text-[0.75em] leading-snug text-muted-foreground">
              Same day: re-solve wrong and unattempted questions without seeing
              solutions; note tricks and formulas.
            </p>
            <div className="mt-[0.45em] flex items-center gap-[0.4em]">
              <MockChip tone="warning">Rev-1</MockChip>
              <span className="text-[0.75em] text-muted-foreground">
                Marked done by hand — attempting a test never completes it.
              </span>
            </div>
          </section>

          <section className="rounded-xl bg-card px-[0.85em] py-[0.7em] shadow-[inset_0_0_0_1px_var(--border)]">
            <h4 className="text-[1.02em] font-[450] text-foreground">
              Weak areas &amp; mistake notebook
            </h4>
            <div className="mt-[0.4em] rounded-lg bg-muted px-[0.5em] py-[0.4em] text-[0.76em] text-muted-foreground">
              What needs another look from today&apos;s work?
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
