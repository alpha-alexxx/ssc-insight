"use client";
import { useQuery } from "@tanstack/react-query";
import { TaskEditorForm } from "@/components/shared/tasks/task-editor";
import { Sheet } from "@/components/sheet";
import { Skeleton } from "@/components/skeleton";
import { todoGroupsQueryOptions } from "@/lib/queries/todos";
import type { Task, TaskDraft, TaskListResponse } from "@/components/shared/tasks/types";
import { useTodoList } from "@/components/use-todos-data";

/**
 * The full personal-task editor as a bottom sheet.
 *
 * It renders `TaskEditorForm` rather than `TaskEditor` because the latter owns
 * its own overlay, and an overlay inside a sheet nests two focus traps.
 * The form itself is identical, so a personal task has exactly one editing
 * surface across /calendar, /my-tasks and the plan day.
 *
 * The editor needs the todos-API row (it carries `version`, `groupId`,
 * `subtasks` and `url`), while the calendar holds the leaner PersonalTaskView.
 * Rather than widen that model or invent a GET-by-id route, the sheet reads
 * the same cached day list /my-tasks uses and picks the matching row.
 */
export function PersonalTaskDrawer({
  open,
  onOpenChange,
  task,
  draft,
  onSave,
  onCreateGroup,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The PersonalTaskView being edited, or null for a new task. */
  task: { id: string; dueDate: string | null } | null;
  /** Seed for a new task (the selected day, or an empty add). */
  draft: { dueDate: string } | null;
  onSave: (draft: TaskDraft) => Promise<boolean>;
  onCreateGroup?: (name: string) => Promise<string | null>;
}) {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      side="bottom"
      title={task ? "Edit task" : "Add task"}
      description={
        <span className="sr-only">
          {task
            ? "Update this personal task's title, date, priority and details."
            : "Create a personal task for the selected date."}
        </span>
      }
    >
      <div className="pt-2">
        {task ? (
          <TaskEditorLoader
            id={task.id}
            dueDate={task.dueDate}
            onSave={onSave}
            onCreateGroup={onCreateGroup}
            onClose={() => onOpenChange(false)}
          />
        ) : (
          <TaskEditorForm
            key={draft?.dueDate ?? "new"}
            todo={blankTask(draft?.dueDate ?? "")}
            groups={[]}
            onSave={(values) => onSave(values)}
            onCreateGroup={onCreateGroup}
            onClose={() => onOpenChange(false)}
            variant="drawer"
          />
        )}
      </div>
    </Sheet>
  );
}

function TaskEditorLoader({
  id,
  dueDate,
  onSave,
  onCreateGroup,
  onClose,
}: {
  id: string;
  dueDate: string | null;
  onSave: (draft: TaskDraft) => Promise<boolean>;
  onCreateGroup?: (name: string) => Promise<string | null>;
  onClose: () => void;
}) {
  const groups = useQuery(todoGroupsQueryOptions);
  const list = useTodoList<TaskListResponse>(
    `view=day&date=${dueDate ?? ""}&limit=100`,
  );
  const row = list.data?.items.find((item) => item.id === id);

  if (!row)
    return (
      <div className="space-y-3 py-2" aria-busy="true">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-2/3" />
      </div>
    );

  return (
    <TaskEditorForm
      key={row.id}
      todo={row as Task}
      groups={(groups.data ?? []).map((group) => ({
        id: group.id,
        name: group.name,
      }))}
      onSave={onSave}
      onCreateGroup={onCreateGroup}
      onClose={onClose}
      variant="drawer"
    />
  );
}

function blankTask(dueDate: string): Task {
  return {
    id: "",
    title: "",
    dueDate: dueDate || null,
    notes: null,
    priority: "normal",
    status: "todo",
    groupId: null,
    subtasks: [],
    version: 0,
    deletedAt: null,
    url: null,
    category: "other",
  };
}
