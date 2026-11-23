"use client";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/checkbox";
import { Alert } from "@/components/alert";
import {
  PLAN_CATEGORIES,
  effectiveStatus,
  isMockType,
  type PersonalTaskView,
  type PlanTaskView,
} from "@/lib/plan/view-model";
import type { PlanTaskType } from "@/lib/plan/schema";

/** Shared planner atoms — category chips, completion toggles, states.
 *
 * Hairline rebuild: chips are `Badge`, completion toggles are the Hairline
 * `Checkbox` (a real <input type="checkbox"> underneath), the plan error card
 * is the Hairline `Alert`, and the 2px progress rule is composed from tokens.
 * All behaviour, labels and aria contracts are unchanged.
 */

/* ---------- personal-task status dots ----------
   Colors come straight from the semantic tokens (--success/--destructive/
   --primary/--border), which are defined once in :root/.dark and never
   re-themed per palette, so the dot semantics are identical across all
   palette × style combinations. Overdue derives from the due date —
   it is never stored. */
export type PersonalTaskDisplayStatus =
  | "todo"
  | "in_progress"
  | "completed"
  | "overdue";

export const STATUS_META: Record<
  PersonalTaskDisplayStatus,
  { label: string; dotClass: string; textClass: string }
> = {
  todo: {
    label: "To do",
    dotClass: "bg-background border-2 border-border",
    textClass: "text-muted-foreground",
  },
  in_progress: {
    label: "In progress",
    dotClass: "bg-primary border-2 border-primary",
    textClass: "text-primary",
  },
  completed: {
    label: "Done",
    dotClass: "bg-success border-2 border-success",
    textClass: "text-success",
  },
  overdue: {
    label: "Overdue",
    dotClass: "bg-destructive border-2 border-destructive ring-2 ring-destructive/10",
    textClass: "text-destructive",
  },
};

export function statusOf(
  task: Pick<PersonalTaskView, "dueDate"> & { status: string },
  todayIso: string,
): PersonalTaskDisplayStatus {
  return effectiveStatus(task, todayIso) as PersonalTaskDisplayStatus;
}

/** The status cycle: clicking the dot advances a task through its states. */
export function nextStatus(
  status: PersonalTaskDisplayStatus,
): PersonalTaskView["status"] {
  if (status === "todo" || status === "overdue") return "in_progress";
  if (status === "in_progress") return "completed";
  return "todo";
}

export function StatusDot({
  status,
  size = 10,
}: {
  status: PersonalTaskDisplayStatus;
  size?: number;
}) {
  const meta = STATUS_META[status];
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={`inline-block shrink-0 rounded-full ${meta.dotClass}`}
    />
  );
}

export function CategoryChip({ type }: { type: PlanTaskType }) {
  const mock = isMockType(type);
  return (
    <Badge size="sm" tone={mock ? "primary" : "neutral"}>
      {PLAN_CATEGORIES[type].short}
    </Badge>
  );
}

export function CompleteToggle({
  completed,
  onToggle,
  label,
}: {
  completed: boolean;
  onToggle?: () => void;
  label: string;
}) {
  return (
    <Checkbox
      checked={completed}
      onCheckedChange={() => onToggle?.()}
      aria-label={label}
      size="sm"
      className="mt-0.5"
    />
  );
}

export function ResultLine({ task }: { task: PlanTaskView }) {
  const parts: string[] = [];
  if (task.score != null) parts.push(`${task.score} / ${task.marks}`);
  if (task.percentile != null) parts.push(`${task.percentile}%ile`);
  if (task.wrong != null) parts.push(`${task.wrong} wrong`);
  if (task.unattempted != null) parts.push(`${task.unattempted} skipped`);
  if (!parts.length) return null;
  return (
    <span className="text-[11px] tabular-nums text-muted-foreground">
      {parts.join(" · ")}
    </span>
  );
}

/**
 * The 2px square progress rule — the same gauge the metric strip uses. Round
 * shapes are reserved for status dots and the answer-distribution ring, so a
 * planner percentage is always a rule, never a ring.
 */
export function ProgressRule({
  done,
  total,
  label,
  className,
}: {
  done: number;
  total: number;
  label: string;
  className?: string;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div
      className={`block h-0.5 overflow-hidden rounded-full bg-border ${className ?? ""}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${label} progress`}
    >
      <span
        className="block h-full rounded-full bg-primary"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function PlanErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Alert
      tone="warning"
      title="The study plan could not load"
      action={
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      }
      className="mb-5"
    >
      <p className="max-w-2xl">{message}</p>
    </Alert>
  );
}
