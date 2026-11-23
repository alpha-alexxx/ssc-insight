"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/checkbox";
import { Dialog } from "@/components/dialog";
import { Input } from "@/components/input";
import { PlainIcon } from "@/components/icon";
import { SegmentedControl } from "@/components/segmented-control";
import { Select } from "@/components/select";
import { Textarea } from "@/components/textarea";
import { safeHttpUrlCore } from "@/lib/plan/view-model";
import type {
  Subtask,
  Task,
  TaskDraft,
  TaskGroup,
  TaskPriority,
  TaskStatus,
} from "./types";

const PRIORITIES: { id: TaskPriority; label: string }[] = [
  { id: "low", label: "Low" },
  { id: "normal", label: "Normal" },
  { id: "high", label: "High" },
];
const STATUSES: { id: TaskStatus; label: string }[] = [
  { id: "todo", label: "To do" },
  { id: "in_progress", label: "In progress" },
  { id: "completed", label: "Done" },
];

/**
 * Create/edit dialog with progressive disclosure: title, date, and priority
 * are always visible; group, link, notes, and subtasks live under
 * "More options". `onSave` resolves true when persisted, so "Save & add
 * another" can reset the form. On phones the panel anchors to the bottom of
 * the screen (the Hairline Dialog's own responsive posture).
 *
 * The form body is exported separately as `TaskEditorForm` so a host that
 * already owns an overlay — the calendar's bottom sheet — can render the same
 * editor without nesting a second dialog.
 *
 * Hairline rebuild: the overlay is the Hairline Dialog; the fields are the
 * Hairline Input/Select/Textarea/Checkbox; priority and status are
 * SegmentedControl groups (radiogroup semantics, arrow-key navigation).
 */
export function TaskEditor({
  todo,
  groups,
  busy = false,
  error = "",
  onSave,
  onCreateGroup,
  onClose,
}: TaskEditorProps) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
      title={todo.id ? "Edit task" : "Add task"}
      description={
        todo.id
          ? "Update the details below; status also cycles from the list."
          : "Start with the essentials — subtasks and links can be added anytime."
      }
    >
      <TaskEditorForm
        todo={todo}
        groups={groups}
        busy={busy}
        error={error}
        onSave={onSave}
        onCreateGroup={onCreateGroup}
        onClose={onClose}
        variant="dialog"
      />
    </Dialog>
  );
}

export type TaskEditorProps = {
  todo: Task;
  groups: TaskGroup[];
  busy?: boolean;
  /** Parent-level error (e.g. a 409 from a stale save). */
  error?: string;
  onSave: (draft: TaskDraft) => Promise<boolean>;
  /** Inline group creation; resolves the new group id, or null on failure. */
  onCreateGroup?: (name: string) => Promise<string | null>;
  onClose: () => void;
};

/**
 * The editor's actual controls, with no overlay of its own. `variant="dialog"`
 * defers the heading to the host dialog; `"drawer"` shows the description line
 * only, so the drawer's handle and head stay the single chrome.
 */
export function TaskEditorForm({
  todo,
  groups,
  busy = false,
  error = "",
  onSave,
  onCreateGroup,
  onClose,
  variant = "dialog",
}: TaskEditorProps & { variant?: "dialog" | "drawer" }) {
  const editing = Boolean(todo.id);
  const [title, setTitle] = useState(todo.title);
  const [date, setDate] = useState(todo.dueDate ?? "");
  const [priority, setPriority] = useState<TaskPriority>(
    (todo.priority as TaskPriority) || "normal",
  );
  const [status, setStatus] = useState<TaskStatus>(
    (todo.status as TaskStatus) || "todo",
  );
  const [groupId, setGroupId] = useState(todo.groupId ?? "");
  const [url, setUrl] = useState(todo.url ?? "");
  const [notes, setNotes] = useState(todo.notes ?? "");
  const [subtasks, setSubtasks] = useState<Subtask[]>(todo.subtasks);
  const [newSub, setNewSub] = useState("");
  const hasMore = Boolean(
    todo.groupId || todo.url || todo.notes || todo.subtasks.length,
  );
  const [moreOpen, setMoreOpen] = useState(editing && hasMore);
  const [groupForm, setGroupForm] = useState<string | null>(null);
  const [groupError, setGroupError] = useState("");
  const [localError, setLocalError] = useState("");

  const urlProblem =
    url && !safeHttpUrlCore(url)
      ? "Use a full link starting with https:// or http://"
      : "";

  function addSubtask() {
    const value = newSub.trim();
    if (!value) return;
    setSubtasks((list) => [
      ...list,
      { id: crypto.randomUUID(), title: value, completed: false },
    ]);
    setNewSub("");
  }

  function buildDraft(): TaskDraft | null {
    if (!title.trim()) {
      setLocalError("Give the task a title.");
      return null;
    }
    if (!date) {
      setLocalError("Choose a due date.");
      return null;
    }
    setLocalError("");
    const draft: TaskDraft = {
      title: title.trim(),
      dueDate: date,
      priority,
      notes,
      url,
      groupId: groupId || null,
      subtasks: subtasks
        .map((sub) => ({ ...sub, title: sub.title.trim() }))
        .filter((sub) => sub.title),
    };
    if (editing) draft.status = status;
    else if (status === "completed") draft.completed = true;
    return draft;
  }

  async function save(keepOpen: boolean) {
    const draft = buildDraft();
    if (!draft) return;
    const ok = await onSave(draft);
    if (!ok) return;
    if (keepOpen) {
      onClose();
      return;
    }
    // Save & add another: keep the date and group, clear everything else.
    setTitle("");
    setSubtasks([]);
    setNotes("");
    setUrl("");
    setPriority("normal");
    setStatus("todo");
    setMoreOpen(Boolean(groupId) || groupForm !== null);
  }

  async function createGroup() {
    if (!onCreateGroup || !groupForm?.trim()) return;
    setGroupError("");
    const id = await onCreateGroup(groupForm.trim());
    if (id) {
      setGroupId(id);
      setGroupForm(null);
    } else {
      setGroupError("Could not create the group. Try again.");
    }
  }

  return (
    <>
      {variant === "drawer" && (
        <p className="text-xs text-muted-foreground">
          {editing
            ? "Update the details below; status also cycles from the calendar row."
            : "Start with the essentials — subtasks and links can be added anytime."}
        </p>
      )}
      <form
        className="mt-4 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void save(true);
        }}
      >
        <Input
          label="Task"
          value={title}
          maxLength={200}
          required
          placeholder="e.g. Revise algebra — chapter 4"
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <Input
            label="Due date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              Priority
            </p>
            <SegmentedControl
              label="Priority"
              block
              value={priority}
              onValueChange={(value) => setPriority(value as TaskPriority)}
              options={PRIORITIES.map((item) => ({
                value: item.id,
                label: item.label,
              }))}
            />
          </div>
        </div>
        {editing && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              Status
            </p>
            <SegmentedControl
              label="Status"
              block
              value={status}
              onValueChange={(value) => setStatus(value as TaskStatus)}
              options={STATUSES.map((item) => ({
                value: item.id,
                label: item.label,
              }))}
            />
          </div>
        )}
        <button
          type="button"
          onClick={() => setMoreOpen(!moreOpen)}
          aria-expanded={moreOpen}
          className="inline-flex min-h-9 items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <PlainIcon
            name="chevronDown"
            size={14}
            className={
              moreOpen ? "rotate-180 transition-transform" : "transition-transform"
            }
          />
          More options
          {hasMore && !moreOpen && (
            <span
              className="size-1.5 rounded-full bg-primary"
              aria-hidden="true"
            />
          )}
        </button>
        {moreOpen && (
          <div className="space-y-4 rounded-xl bg-muted/40 p-3.5 shadow-[inset_0_0_0_1px_var(--border)]">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Select
                label="Group"
                value={groupId}
                onValueChange={(value) => setGroupId(value)}
                options={[
                  { value: "", label: "Ungrouped" },
                  ...groups
                    .filter((group) => group.id)
                    .map((group) => ({ value: group.id, label: group.name })),
                ]}
              />
              <div className="min-w-0">
                {onCreateGroup && groupForm === null ? (
                  <button
                    type="button"
                    onClick={() => setGroupForm("")}
                    className="mt-6 inline-flex min-h-9 items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <PlainIcon name="plus" size={12} /> New group
                  </button>
                ) : onCreateGroup && groupForm !== null ? (
                  <div>
                    <Input
                      label="New group name"
                      autoFocus
                      value={groupForm}
                      maxLength={80}
                      placeholder="e.g. Maths revision"
                      onChange={(e) => setGroupForm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void createGroup();
                        }
                      }}
                    />
                    <div className="mt-2 flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={busy || !groupForm.trim()}
                        onClick={() => void createGroup()}
                      >
                        Create
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setGroupForm(null);
                          setGroupError("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                    {groupError && (
                      <p role="alert" className="mt-1 text-xs text-destructive">
                        {groupError}
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
            <Input
              label="External link"
              type="url"
              value={url}
              maxLength={2048}
              placeholder="https://…"
              onChange={(e) => setUrl(e.target.value)}
              aria-invalid={Boolean(urlProblem)}
              error={urlProblem}
            />
            <Textarea
              label="Notes"
              value={notes}
              maxLength={2000}
              minRows={3}
              maxRows={8}
              onChange={(e) => setNotes(e.target.value)}
            />
            <fieldset className="space-y-2.5">
              <legend className="mb-2 text-sm font-medium text-foreground">
                Subtasks
              </legend>
              <p className="text-xs text-muted-foreground">
                Subtasks share this task&apos;s date. Completing all of
                them marks the task done.
              </p>
              {subtasks.map((sub, index) => (
                <div key={sub.id} className="flex items-center gap-2">
                  <Checkbox
                    size="sm"
                    checked={sub.completed}
                    aria-label={`Complete subtask ${sub.title}`}
                    onCheckedChange={(checked) =>
                      setSubtasks(
                        subtasks.map((item, n) =>
                          n === index
                            ? { ...item, completed: checked }
                            : item,
                        ),
                      )
                    }
                  />
                  <Input
                    aria-label={`Subtask ${index + 1}`}
                    value={sub.title}
                    required
                    maxLength={200}
                    className="min-w-0 flex-1"
                    onChange={(e) =>
                      setSubtasks(
                        subtasks.map((item, n) =>
                          n === index
                            ? { ...item, title: e.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={`Remove subtask ${sub.title}`}
                    onClick={() =>
                      setSubtasks(subtasks.filter((_, n) => n !== index))
                    }
                  >
                    <PlainIcon name="close" size={14} />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  aria-label="New subtask"
                  placeholder="Add a subtask and press Enter…"
                  value={newSub}
                  maxLength={200}
                  className="min-w-0 flex-1"
                  onChange={(e) => setNewSub(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSubtask();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={!newSub.trim()}
                  onClick={addSubtask}
                >
                  Add
                </Button>
              </div>
            </fieldset>
          </div>
        )}
        {(localError || error) && (
          <p role="alert" className="text-sm text-destructive">
            {localError || error}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          {!editing && (
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => void save(false)}
            >
              Save &amp; add another
            </Button>
          )}
          <div className="ml-auto flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : editing ? "Save changes" : "Add task"}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
