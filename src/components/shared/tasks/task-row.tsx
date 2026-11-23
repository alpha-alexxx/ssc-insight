"use client";

import { Button } from "@/components/button";
import { DropdownMenu } from "@/components/dropdown-menu";
import { Checkbox } from "@/components/checkbox";
import { PlainIcon } from "@/components/icon";
import { ProgressRule, STATUS_META, StatusDot, statusOf, type PersonalTaskDisplayStatus } from "@/components/shared/plan/plan-shared";
import { addIsoDays } from "@/lib/plan/view-model";
import { linkHost } from "@/lib/plan/view-model";
import { shortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Task } from "./types";

/**
 * One task as an editorial row — hairline-separated, not a card. The row
 * answers everything at a glance: status (dot + text chip, never color
 * alone), due date, priority, group, subtask progress, and link. Actions
 * live behind hover reveals (desktop) and the ⋯ menu (always reachable,
 * which is what touch uses).
 *
 * Hairline rebuild: the menu is the declarative Hairline DropdownMenu, the
 * select checkbox is the Hairline Checkbox, and every color is a token.
 */
export function TaskRow({
  task,
  today,
  groupName,
  selecting = false,
  selected = false,
  pending = false,
  onToggleSelected,
  onCycleStatus,
  onEdit,
  onReschedule,
  onPostpone,
  onDuplicate,
  onTrash,
}: {
  task: Task;
  today: string;
  /** Resolved group name; omitted when Ungrouped. */
  groupName?: string;
  selecting?: boolean;
  selected?: boolean;
  /** A mutation is in flight for this row (optimistic window). */
  pending?: boolean;
  onToggleSelected?: () => void;
  onCycleStatus?: (next: "todo" | "in_progress" | "completed") => void;
  onEdit: () => void;
  onReschedule: () => void;
  onPostpone: () => void;
  onDuplicate: () => void;
  onTrash: () => void;
}) {
  const display = statusOf(task, today) as PersonalTaskDisplayStatus;
  const meta = STATUS_META[display];
  const done = display === "completed";
  const host = task.url ? linkHost(task.url) : null;
  const subtasksDone = task.subtasks.filter((sub) => sub.completed).length;

  const dueLabel = (() => {
    if (!task.dueDate) return null;
    if (task.dueDate === today && !done) return "Today";
    if (task.dueDate === addIsoDays(today, 1) && !done) return "Tomorrow";
    return shortDate(task.dueDate);
  })();

  return (
    <li
      className={cn(
        "group/row flex items-start gap-2.5 border-b border-border px-3 py-3 transition-colors last:border-b-0 hover:bg-muted/40",
        pending && "opacity-60",
      )}
    >
      {selecting && onToggleSelected && (
        <Checkbox
          size="sm"
          className="mt-1"
          checked={selected}
          aria-label={`Select ${task.title}`}
          onCheckedChange={onToggleSelected}
        />
      )}
      {onCycleStatus && (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            onCycleStatus(
              display === "overdue" || display === "todo"
                ? "in_progress"
                : display === "in_progress"
                  ? "completed"
                  : "todo",
            )
          }
          aria-label={`Status: ${meta.label}. Activate to mark ${
            display === "todo" || display === "overdue"
              ? "in progress"
              : display === "in_progress"
                ? "done"
                : "to do"
          }.`}
          title={`Status: ${meta.label} — click to advance`}
          className="relative mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full transition-transform after:absolute after:-inset-2 after:content-[''] hover:scale-110 motion-reduce:transition-none motion-reduce:hover:scale-100"
        >
          <StatusDot status={display} size={16} />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={onEdit}
          className="block w-full text-left"
          aria-label={`${task.title} — open task`}
        >
          <span
            className={cn(
              "break-words text-sm font-medium leading-snug underline-offset-4 hover:underline",
              done && "text-muted-foreground line-through",
            )}
          >
            {task.title}
          </span>
        </button>
        {task.notes && (
          <p className="mt-0.5 line-clamp-1 break-words text-xs text-muted-foreground">
            {task.notes}
          </p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-medium",
              meta.textClass,
            )}
          >
            <StatusDot status={display} size={6} />
            {meta.label}
          </span>
          {display === "overdue" && task.dueDate ? (
            <span className="font-medium tabular-nums text-destructive">
              Overdue · {shortDate(task.dueDate)}
            </span>
          ) : dueLabel ? (
            <span
              className={cn(
                "tabular-nums",
                dueLabel === "Today" && !done && "font-medium text-primary",
              )}
            >
              {done && task.dueDate ? `Was due ${dueLabel}` : dueLabel}
            </span>
          ) : (
            <span>No date</span>
          )}
          {task.priority === "high" && !done && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
              High
            </span>
          )}
          {groupName && (
            <span className="max-w-40 truncate rounded-full px-2 py-0.5 shadow-[inset_0_0_0_1px_var(--border)]">
              {groupName}
            </span>
          )}
          {task.subtasks.length > 0 && (
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              {subtasksDone}/{task.subtasks.length}
              <ProgressRule
                done={subtasksDone}
                total={task.subtasks.length}
                label={`${task.title} subtasks`}
                className="w-10"
              />
            </span>
          )}
          {host && (
            <a
              href={task.url ?? "#"}
              target="_blank"
              rel="noopener noreferrer nofollow"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Open ${host} link for ${task.title} in a new tab`}
              title={`Open ${host}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-card px-2 py-0.5 shadow-[inset_0_0_0_1px_var(--border)] transition-colors hover:bg-accent hover:text-primary"
            >
              <span
                className="flex size-3.5 items-center justify-center rounded-[3px] bg-muted text-[8px] font-semibold uppercase"
                aria-hidden="true"
              >
                {host.replace(/^www\./, "").charAt(0)}
              </span>
              <span className="max-w-32 truncate">{host}</span>
            </a>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <>
          {!selecting && (
            <div className="hidden opacity-0 transition-opacity focus-within:opacity-100 group-hover/row:opacity-100 sm:flex motion-reduce:opacity-100">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={`Edit ${task.title}`}
                disabled={pending}
                onClick={onEdit}
              >
                <PlainIcon name="edit" size={14} />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={`Reschedule ${task.title}`}
                disabled={pending}
                onClick={onReschedule}
              >
                <PlainIcon name="calendarPlus" size={14} />
              </Button>
            </div>
          )}
          <DropdownMenu
            trigger={
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={`More actions for ${task.title}`}
                disabled={pending}
              >
                <PlainIcon name="more" size={15} />
              </Button>
            }
            align="end"
            label={`More actions for ${task.title}`}
            items={[
              {
                type: "item",
                id: "edit",
                label: "Edit task",
                icon: <PlainIcon name="edit" size={13} />,
                onSelect: onEdit,
              },
              {
                type: "item",
                id: "reschedule",
                label: "Reschedule…",
                icon: <PlainIcon name="calendarPlus" size={13} />,
                onSelect: onReschedule,
              },
              ...(!done
                ? [
                    {
                      type: "item" as const,
                      id: "postpone",
                      label: "Postpone 1 day",
                      icon: <PlainIcon name="calendar" size={13} />,
                      onSelect: onPostpone,
                    },
                  ]
                : []),
              {
                type: "item",
                id: "duplicate",
                label: "Duplicate",
                icon: <PlainIcon name="copy" size={13} />,
                onSelect: onDuplicate,
              },
              { type: "separator" },
              {
                type: "item",
                id: "trash",
                label: "Move to Trash",
                icon: <PlainIcon name="trash" size={13} />,
                destructive: true,
                onSelect: onTrash,
              },
            ]}
          />
        </>
      </div>
    </li>
  );
}
