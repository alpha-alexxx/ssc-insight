"use client";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/checkbox";
import { Badge } from "@/components/badge";
import { Dialog } from "@/components/dialog";
import { PlainIcon } from "@/components/icon";
import { CategoryChip, ResultLine } from "@/components/shared/plan/plan-shared";
import { longDate } from "@/lib/format";
import type { PlanDayView, PlanTaskView } from "@/lib/plan/view-model";

/**
 * Plan-event detail dialog, shared by the calendar, My Tasks, and the
 * dashboard's upcoming list. Shows the full source assignment (name,
 * category, questions/marks, completion, recorded result, revision flags)
 * plus the day's checklist, with actions to toggle completion, open the
 * original RBE test in a new tab, and open the daily workspace.
 *
 * Hairline rebuild: the Radix parts are replaced by the Hairline Dialog
 * (title/description/footer); the revision and checklist toggles are the
 * Hairline Checkbox (a real <input type="checkbox">, so Space and screen
 * readers behave as they always did).
 */
export function EventDialog({
  task,
  day,
  onClose,
  onToggleComplete,
  onOpenPlanDay,
  onToggleChecklist,
  onToggleRevision,
}: {
  task: PlanTaskView | null;
  day?: PlanDayView;
  onClose: () => void;
  onToggleComplete: (task: PlanTaskView) => void;
  onOpenPlanDay: (date: string) => void;
  /** Real toggles. Without them the checklist stays a read-only list rather
   * than looking interactive and doing nothing. */
  onToggleChecklist?: (day: PlanDayView, itemId: string, done: boolean) => void;
  onToggleRevision?: (day: PlanDayView, revisionIndex: number, next: boolean) => void;
}) {
  return (
    <Dialog
      open={!!task}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={task ? task.name : "Scheduled work"}
      description={
        task && (
          <span className="flex flex-wrap items-center gap-2">
            <CategoryChip type={task.type} />
            <span>
              {longDate(task.date)} · Plan day {task.day}
            </span>
            <span className="tabular-nums">
              {task.questions} Q · {task.marks} marks
            </span>
          </span>
        )
      }
      footer={
        task && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenPlanDay(task.date)}
            >
              Open daily plan
            </Button>
            <a
              href={task.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-7 items-center gap-1 rounded-full px-3 text-[12px] font-medium text-primary shadow-[inset_0_0_0_1px_var(--border)] transition-colors hover:bg-accent"
            >
              <PlainIcon name="arrowUpRight" size={13} />
              {task.linkLabel}
            </a>
            <Button size="sm" onClick={() => onToggleComplete(task)}>
              {task.completed ? "Mark incomplete" : "Mark complete"}
            </Button>
          </>
        )
      }
    >
      {task && (
        <>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <PlanDoneState completed={task.completed} />
            <ResultLine task={task} />
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
            <RevFlag label="Rev-1 same day" done={task.rev1} />
            <RevFlag label="Rev-2 weekly" done={task.rev2} />
            <RevFlag label="Rev-3 final" done={task.rev3} />
          </dl>

          {day && day.revisionTasks.length > 0 && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Day revision
              </p>
              <ul className="space-y-1.5 text-xs">
                {day.revisionTasks.map((rt, revisionIndex) => (
                  <li key={rt} className="flex items-start gap-2">
                    {onToggleRevision ? (
                      <Checkbox
                        size="sm"
                        checked={day.revisionDone.includes(String(revisionIndex))}
                        aria-label={`Mark revision ${rt} ${day.revisionDone.includes(String(revisionIndex)) ? "incomplete" : "complete"}`}
                        onCheckedChange={() =>
                          // Send the real next value: this used to pass
                          // `true` unconditionally, so a day revision
                          // could be ticked but never unticked.
                          onToggleRevision(
                            day,
                            revisionIndex,
                            !day.revisionDone.includes(String(revisionIndex)),
                          )
                        }
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 rounded-[5px] shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--foreground)_22%,var(--border))]"
                      />
                    )}
                    <span
                      className={
                        day.revisionDone.includes(String(revisionIndex))
                          ? "text-muted-foreground line-through"
                          : ""
                      }
                    >
                      {rt}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {day && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Daily checklist
              </p>
              <ul className="space-y-1.5 text-xs">
                {day.checklist.map((item) => (
                  <li key={item.id} className="flex items-center gap-2">
                    {onToggleChecklist ? (
                      <Checkbox
                        size="sm"
                        checked={item.done}
                        aria-label={`Mark ${item.label} ${item.done ? "incomplete" : "complete"}`}
                        onCheckedChange={() =>
                          onToggleChecklist(day, item.id, !item.done)
                        }
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="size-4 shrink-0 rounded-[5px] shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--foreground)_22%,var(--border))]"
                      />
                    )}
                    <span className={item.done ? "text-muted-foreground line-through" : ""}>
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </Dialog>
  );
}

function PlanDoneState({ completed }: { completed: boolean }) {
  return completed ? (
    <Badge tone="success" size="sm" icon={<PlainIcon name="check" size={10} />}>
      Completed
    </Badge>
  ) : (
    <Badge tone="neutral" size="sm">
      Not done yet
    </Badge>
  );
}

function RevFlag({ label, done }: { label: string; done: boolean }) {
  return (
    <div
      className={
        done
          ? "rounded-lg bg-success/10 px-2.5 py-1.5 text-success shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-success)_30%,transparent)]"
          : "rounded-lg bg-muted px-2.5 py-1.5 text-muted-foreground"
      }
    >
      <dt className="text-[11px] font-medium">{label}</dt>
      <dd className="text-[12px]">{done ? "Done" : "Pending"}</dd>
    </div>
  );
}
