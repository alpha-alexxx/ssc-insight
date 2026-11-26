"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/checkbox";
import { Input } from "@/components/input";
import { PlainIcon } from "@/components/icon";
import { Select } from "@/components/select";
import { Spinner } from "@/components/spinner";
import { Textarea } from "@/components/textarea";
import { AiSettingsForm } from "@/components/ai-settings-form";
import { api } from "@/lib/api-client";
import {
  MAX_TODO_PROMPT_CHARS,
  type AiCredentialSummary,
} from "@/lib/ai/client-types";
import { addIsoDays, istTodayIso } from "@/lib/plan/view-model";
import { weekdayDate, shortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useInvalidateTodos, useTodoList } from "@/components/use-todos-data";
import type { Task, TaskDraft, TaskListResponse, Subtask } from "./types";

/** "Mon 3 Nov" — the compact date the ledger rows lead with. */
function weekdayDateLabel(iso: string): string {
  if (!iso) return "Needs date";
  const weekday = weekdayDate(iso).split(",")[0] ?? "";
  return `${weekday.slice(0, 3)} ${shortDate(iso)}`;
}

const fieldLabel =
  "text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground";

type Proposal = {
  type: "create" | "update" | "delete";
  id?: string;
  version?: number;
  data?: TaskDraft;
};

type DraftResponse = {
  needsDates: boolean;
  question?: string;
  operations: Proposal[];
  before?: Record<string, Task>;
  contextTruncated?: boolean;
};

export function TodoAiComposer({
  onChanged,
  compact = false,
  variant = "compact",
  configured,
  onAiConfigured,
  onTakeoverChange,
  onApplied,
}: {
  onChanged?: () => void;
  compact?: boolean;
  /** "page" renders the slim prompt + the takeover ledger for the /ask
   * composer; "compact" is the sheet/planner behavior. */
  variant?: "compact" | "page";
  /** Live AI status; when false in sheet/dialog mode, shows provider setup. */
  configured?: boolean;
  /** Notifies the host so AI status can be refetched after setup. */
  onAiConfigured?: (credential: AiCredentialSummary | null) => void;
  /** Fires whenever the takeover state flips (a parsed draft opens or closes). */
  onTakeoverChange?: (active: boolean) => void;
  /** Fires after Apply succeeds with the number of applied changes. */
  onApplied?: (count: number) => void;
}) {
  const slim = compact || variant === "page";

  if (slim && configured === false) {
    return (
      <section
        className="flex flex-col gap-4 py-2"
        aria-label="AI todo assistant"
      >
        <div>
          {variant !== "page" && (
            <h3 className="font-serif text-[1.375rem] font-medium leading-tight text-foreground">
              Plan your study todos
            </h3>
          )}
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Todo planning runs on AI. Set up a provider to draft revision todos
            and reschedules here — manual entry stays available in My Tasks.
          </p>
        </div>
        <div className="rounded-xl bg-muted/40 p-4 shadow-[inset_0_0_0_1px_var(--border)]">
          <AiSettingsForm
            variant="panel"
            showHeading={false}
            onChanged={onAiConfigured}
          />
        </div>
      </section>
    );
  }

  return (
    <TodoAiComposerInner
      onChanged={onChanged}
      compact={compact}
      variant={variant}
      onTakeoverChange={onTakeoverChange}
      onApplied={onApplied}
    />
  );
}

function TodoAiComposerInner({
  onChanged,
  compact = false,
  variant = "compact",
  onTakeoverChange,
  onApplied,
}: {
  onChanged?: () => void;
  compact?: boolean;
  variant?: "compact" | "page";
  onTakeoverChange?: (active: boolean) => void;
  onApplied?: (count: number) => void;
}) {
  const page = variant === "page";
  const slim = compact || page;

  const [open, setOpen] = useState(slim);
  const [prompt, setPrompt] = useState("");
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [draft, setDraft] = useState<DraftResponse | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const token = useRef(crypto.randomUUID());

  const showLedger = Boolean(reviewing && draft && !draft.needsDates);
  const takeover = page && showLedger;

  useLayoutEffect(() => {
    onTakeoverChange?.(takeover);
  }, [takeover, onTakeoverChange]);

  const reference = useTodoList<TaskListResponse>("limit=100&view=all");
  const invalidateTodos = useInvalidateTodos();
  const groups = reference.data?.groups ?? [];
  const existingTodos = reference.data?.items ?? [];
  const duplicateLookupTruncated =
    (reference.data?.total ?? 0) > existingTodos.length;
  const loadTodoReference = reference.refresh;

  async function generate() {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const result = await api<DraftResponse>("/api/ai/todos", {
        method: "POST",
        body: JSON.stringify({
          prompt,
          date: date || undefined,
          endDate: endDate || undefined,
        }),
      });
      setDraft(result);
      setSelected(result.operations.map((_, i) => i));
      setExpanded({});
      setReviewing(!result.needsDates);
      token.current = crypto.randomUUID();
      void loadTodoReference();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not prepare todos. Your existing todos are unchanged.",
      );
    } finally {
      setBusy(false);
    }
  }

  function changeOperation(index: number, patch: TaskDraft) {
    setDraft((current) =>
      current
        ? {
            ...current,
            operations: current.operations.map((op, i) =>
              i === index ? { ...op, data: { ...op.data, ...patch } } : op,
            ),
          }
        : null,
    );
    token.current = crypto.randomUUID();
  }

  function proposedValue(op: Proposal, before: Task | null) {
    const rawSubtasks: Subtask[] = op.data?.subtasks ?? before?.subtasks ?? [];
    const explicitCompletion = op.data?.completed;
    const completed =
      explicitCompletion !== undefined
        ? explicitCompletion
        : rawSubtasks.length
          ? rawSubtasks.every((subtask) => subtask.completed)
          : before?.status === "completed";
    const subtasks =
      explicitCompletion === undefined
        ? rawSubtasks
        : rawSubtasks.map((subtask) => ({
            ...subtask,
            completed: explicitCompletion,
          }));
    return {
      title: op.data?.title ?? before?.title ?? "",
      dueDate: op.data?.dueDate ?? before?.dueDate ?? "",
      priority: op.data?.priority ?? before?.priority ?? "normal",
      subtasks,
      completed,
    };
  }

  function duplicateWarning(index: number, op: Proposal, before: Task | null) {
    if (op.type === "delete") return "";
    const value = proposedValue(op, before);
    const title = value.title.trim().toLocaleLowerCase();
    if (!title || !value.dueDate) return "";
    const existing = existingTodos.some(
      (todo) =>
        todo.id !== op.id &&
        todo.dueDate === value.dueDate &&
        todo.title.trim().toLocaleLowerCase() === title,
    );
    const proposed = draft?.operations.some((other, otherIndex) => {
      if (otherIndex === index || other.type === "delete") return false;
      const otherBefore = other.id ? (draft.before?.[other.id] ?? null) : null;
      const otherValue = proposedValue(other, otherBefore);
      return (
        otherValue.dueDate === value.dueDate &&
        otherValue.title.trim().toLocaleLowerCase() === title
      );
    });
    return existing || proposed
      ? "Likely duplicate: another todo has the same title and date. You can still apply it."
      : "";
  }

  async function apply() {
    if (!draft) return;
    setBusy(true);
    setError("");
    try {
      await api("/api/todos/apply", {
        method: "POST",
        body: JSON.stringify({
          idempotencyKey: token.current,
          operations: draft.operations.filter((_, i) => selected.includes(i)),
        }),
      });
      await invalidateTodos();
      onChanged?.();
      onApplied?.(selected.length);
      setDraft(null);
      setReviewing(false);
      setSelected([]);
      setExpanded({});
      setSuccess("Your selected changes were applied.");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not apply your changes. Your draft is still here.",
      );
    } finally {
      setBusy(false);
    }
  }

  // ── Step 2: Review Ledger (matches SubjectRoster in LogMockFlow) ──
  if (showLedger && draft) {
    const hasInvalidSelection = draft.operations.some(
      (op, i) =>
        selected.includes(i) &&
        op.type !== "delete" &&
        (!(op.data?.title ?? draft.before?.[op.id ?? ""]?.title)?.trim() ||
          !(op.data?.dueDate ?? draft.before?.[op.id ?? ""]?.dueDate) ||
          (op.data?.subtasks ?? []).some((sub) => !sub.title.trim())),
    );

    return (
      <section
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          !slim &&
            "rounded-2xl bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)]",
        )}
        aria-label="Review proposed todos"
      >
        {/* Header */}
        <div className="shrink-0 border-b border-border pb-3 pt-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h3 className="font-serif text-[1.25rem] font-medium leading-tight text-foreground">
              Proposed todos
            </h3>
            <span className={fieldLabel}>
              {selected.length} of {draft.operations.length} selected
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Only checked rows are applied. Click Edit on any row to adjust its
            title, date, priority, or subtasks.
          </p>
        </div>

        {/* Ledger Rows */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1">
          {draft.contextTruncated && (
            <p className="my-2 border-l-2 border-l-warning pl-2.5 text-[11px] leading-relaxed text-warning">
              Only part of your task history fitted in the AI context. Review
              suggestions against the rest of your planner.
            </p>
          )}

          {!draft.operations.length ? (
            <p className="py-6 text-sm text-muted-foreground">
              No changes proposed. Go back and try a more specific instruction.
            </p>
          ) : (
            <ul className="divide-y divide-border border-b border-border">
              {draft.operations.map((op, index) => {
                const before = op.id ? (draft.before?.[op.id] ?? null) : null;
                const after = proposedValue(op, before ?? null);
                const duplicate = duplicateWarning(index, op, before ?? null);
                const checked = selected.includes(index);
                const rowOpen = expanded[index] ?? false;
                const dateLabel = after.dueDate
                  ? weekdayDateLabel(after.dueDate)
                  : "Needs date";

                return (
                  <li key={index} className="py-2.5">
                    <div className="flex items-start gap-2.5">
                      <Checkbox
                        size="sm"
                        className="mt-1"
                        checked={checked}
                        disabled={busy}
                        aria-label={`${
                          op.type === "delete"
                            ? "Trash"
                            : op.type === "create"
                              ? "Add"
                              : "Update"
                        } ${after.title || "proposal"}`}
                        onCheckedChange={(value) => {
                          setSelected(
                            value
                              ? [...selected, index]
                              : selected.filter((i) => i !== index),
                          );
                          token.current = crypto.randomUUID();
                        }}
                      />
                      <span
                        aria-hidden="true"
                        className={cn(
                          "w-3 shrink-0 font-serif text-base leading-6",
                          op.type === "delete"
                            ? "text-destructive"
                            : op.type === "create"
                              ? "text-success"
                              : "text-primary",
                        )}
                      >
                        {op.type === "delete"
                          ? "−"
                          : op.type === "create"
                            ? "+"
                            : "~"}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className={fieldLabel}>
                          {op.type === "delete"
                            ? "Trash"
                            : op.type === "create"
                              ? "Add"
                              : "Change"}{" "}
                          · {dateLabel}
                        </p>
                        <p
                          className={cn(
                            "break-words text-sm font-medium leading-snug",
                            op.type === "delete"
                              ? "text-destructive line-through"
                              : "text-foreground",
                          )}
                        >
                          {after.title || "(untitled)"}
                        </p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground">
                          <span className="capitalize">
                            {after.priority} priority
                          </span>
                          {before &&
                            before.dueDate &&
                            before.dueDate !== after.dueDate && (
                              <span className="line-through">
                                was {weekdayDateLabel(before.dueDate)}
                              </span>
                            )}
                          {after.subtasks.length > 0 && (
                            <span>
                              {after.subtasks.filter((s) => s.completed).length}
                              /{after.subtasks.length} subtasks
                            </span>
                          )}
                        </p>

                        {duplicate && (
                          <p
                            role="status"
                            className="mt-1.5 border-l-2 border-l-warning pl-2 text-[11px] leading-relaxed text-warning"
                          >
                            {duplicate}
                          </p>
                        )}

                        {rowOpen && op.type !== "delete" && (
                          <div className="mt-3 space-y-2.5 border-l border-border pl-3">
                            <Input
                              label="Title"
                              size="sm"
                              required
                              maxLength={200}
                              value={op.data?.title ?? before?.title ?? ""}
                              onChange={(e) =>
                                changeOperation(index, {
                                  title: e.target.value,
                                })
                              }
                              disabled={busy}
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                label="Date"
                                type="date"
                                size="sm"
                                required
                                value={
                                  op.data?.dueDate ?? before?.dueDate ?? ""
                                }
                                onChange={(e) =>
                                  changeOperation(index, {
                                    dueDate: e.target.value,
                                  })
                                }
                                disabled={busy}
                              />
                              <Select
                                label="Priority"
                                value={
                                  op.data?.priority ??
                                  before?.priority ??
                                  "normal"
                                }
                                onValueChange={(value) =>
                                  changeOperation(index, { priority: value })
                                }
                                disabled={busy}
                                options={[
                                  { value: "high", label: "High" },
                                  { value: "normal", label: "Normal" },
                                  { value: "low", label: "Low" },
                                ]}
                              />
                            </div>
                            <Select
                              label="Group"
                              value={
                                op.data?.groupId !== undefined
                                  ? (op.data.groupId ?? "")
                                  : (before?.groupId ?? "")
                              }
                              disabled={busy}
                              onValueChange={(value) =>
                                changeOperation(index, {
                                  groupId: value || null,
                                })
                              }
                              options={[
                                { value: "", label: "Ungrouped" },
                                ...groups.map((group) => ({
                                  value: group.id,
                                  label: group.name,
                                })),
                              ]}
                            />
                            <Textarea
                              label="Notes"
                              minRows={2}
                              maxRows={6}
                              maxLength={2000}
                              value={op.data?.notes ?? before?.notes ?? ""}
                              onChange={(e) =>
                                changeOperation(index, {
                                  notes: e.target.value,
                                })
                              }
                              disabled={busy}
                            />
                            <Checkbox
                              size="sm"
                              checked={after.completed}
                              disabled={busy}
                              label="Complete with all subtasks"
                              onCheckedChange={(value) => {
                                const completed = Boolean(value);
                                changeOperation(index, {
                                  completed,
                                  subtasks: after.subtasks.map((subtask) => ({
                                    ...subtask,
                                    completed,
                                  })),
                                });
                              }}
                            />
                            {after.subtasks.map((sub, i) => (
                              <div
                                key={sub.id ?? i}
                                className="flex items-center gap-2"
                              >
                                <Checkbox
                                  size="sm"
                                  checked={sub.completed}
                                  disabled={busy}
                                  aria-label={`Complete proposed subtask ${i + 1}`}
                                  onCheckedChange={(value) =>
                                    changeOperation(index, {
                                      subtasks: after.subtasks.map((item, n) =>
                                        n === i
                                          ? {
                                              ...item,
                                              completed: Boolean(value),
                                            }
                                          : item,
                                      ),
                                      completed: undefined,
                                    })
                                  }
                                />
                                <Input
                                  aria-label={`Subtask ${i + 1} title`}
                                  size="sm"
                                  className="min-w-0 flex-1"
                                  maxLength={200}
                                  value={sub.title}
                                  disabled={busy}
                                  onChange={(event) =>
                                    changeOperation(index, {
                                      subtasks: after.subtasks.map((item, n) =>
                                        n === i
                                          ? {
                                              ...item,
                                              title: event.target.value,
                                            }
                                          : item,
                                      ),
                                      completed: undefined,
                                    })
                                  }
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  disabled={busy}
                                  aria-label={`Remove proposed subtask ${i + 1}`}
                                  onClick={() =>
                                    changeOperation(index, {
                                      subtasks: after.subtasks.filter(
                                        (_, n) => n !== i,
                                      ),
                                      completed: undefined,
                                    })
                                  }
                                >
                                  <PlainIcon name="close" size={14} />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={busy}
                              onClick={() =>
                                changeOperation(index, {
                                  subtasks: [
                                    ...after.subtasks,
                                    {
                                      id: crypto.randomUUID(),
                                      title: "",
                                      completed: false,
                                    },
                                  ],
                                  completed: undefined,
                                })
                              }
                            >
                              Add subtask
                            </Button>
                          </div>
                        )}
                      </div>

                      {op.type !== "delete" && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpanded((current) => ({
                              ...current,
                              [index]: !current[index],
                            }))
                          }
                          aria-expanded={rowOpen}
                          className="shrink-0 pt-1 text-[11px] font-medium text-primary hover:text-primary/80"
                        >
                          {rowOpen ? "Done" : "Edit"}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {duplicateLookupTruncated && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              Duplicate hints compare this draft with the first 100 active
              todos.
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mt-3 border-l-2 border-l-destructive bg-destructive/10 px-3 py-2 text-xs leading-relaxed text-destructive"
            >
              {error}
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="shrink-0 border-t border-border bg-background pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => {
                setReviewing(false);
                setError("");
              }}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => {
                setDraft(null);
                setReviewing(false);
                setSelected([]);
                setExpanded({});
                setError("");
              }}
            >
              Discard
            </Button>
            <Button
              type="button"
              size="sm"
              className="ml-auto"
              disabled={busy || !selected.length || hasInvalidSelection}
              onClick={() => void apply()}
            >
              {busy ? "Applying…" : `Apply ${selected.length}`}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // ── Step 1: Prompt & Dates Compose Step ──
  return (
    <section
      className={cn(
        "flex flex-col gap-4",
        !slim &&
          "rounded-2xl bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)]",
        slim && "py-1",
      )}
      aria-label="AI todo assistant"
    >
      {compact && !page && (
        <div>
          <h3 className="font-serif text-[1.375rem] font-medium leading-tight text-foreground">
            Plan your study todos
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Choose dates and say what you want to plan. You review every
            proposed todo before anything is saved.
          </p>
        </div>
      )}

      {page && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          Choose dates and describe the week. You review every proposed todo
          here before anything is saved.
        </p>
      )}

      {!slim && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl text-foreground">Plan with AI</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Describe the work. Review every change before it is saved.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
          >
            {open ? "Close assistant" : "Create with AI"}
          </Button>
        </div>
      )}

      {open && (
        <>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void generate();
            }}
          >
            <Textarea
              id="ai-todo-prompt"
              label="What would you like to plan?"
              required
              maxLength={MAX_TODO_PROMPT_CHARS}
              minRows={slim ? 3 : 3}
              maxRows={10}
              showCount
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Create revision todos for my weaker subjects, or reschedule unfinished work…"
              disabled={busy}
            />

            <div className="grid grid-cols-2 items-end gap-3">
              <Input
                label="Start date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={busy}
              />
              <Input
                label="End date (optional)"
                type="date"
                min={date || undefined}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={busy}
              />
            </div>

            {draft?.needsDates && (
              <p
                role="status"
                className="border-l-2 border-l-warning pl-3 text-xs leading-relaxed text-warning"
              >
                {draft.question ??
                  "Which date or date range should these todos use?"}{" "}
                Choose the dates above, then prepare the draft again.
              </p>
            )}

            {slim && (
              <div className="border-t border-border pt-3">
                <p className={cn("flex items-center gap-1.5", fieldLabel)}>
                  <PlainIcon
                    name="flash"
                    size={12}
                    className="shrink-0 text-primary"
                  />
                  Start from a template
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => {
                      const today = istTodayIso();
                      setDate(today);
                      setEndDate(addIsoDays(today, 6));
                      setPrompt(
                        "Plan my study todos for the next 7 days based on my progress and unfinished work.",
                      );
                    }}
                  >
                    Next 7 days
                  </Button>
                  {[
                    [
                      "Revision plan",
                      "Create revision todos based on my study plan and recent mock performance.",
                    ],
                    [
                      "Weak topics",
                      "Create practice and revision todos for my weaker subjects and topics.",
                    ],
                    [
                      "Finish backlog",
                      "Review my unfinished todos and propose a manageable rescheduling plan.",
                    ],
                  ].map(([label, value]) => (
                    <Button
                      key={label}
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => {
                        if (!date) setDate(istTodayIso());
                        setPrompt(value);
                      }}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2.5 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <PlainIcon name="info" size={15} className="mt-0.5 shrink-0" />
                <span>
                  Uses your mock performance, study plan, and active tasks.
                  Nothing is saved until you approve.
                </span>
              </p>

              <div className="flex shrink-0 items-center gap-2">
                {draft && !draft.needsDates && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => setReviewing(true)}
                  >
                    Review draft ({draft.operations.length})
                  </Button>
                )}
                <Button
                  type="submit"
                  size="sm"
                  disabled={busy || !prompt.trim()}
                  icon={<PlainIcon name="sparkles" size={14} />}
                >
                  {busy
                    ? "Working…"
                    : draft && !draft.needsDates
                      ? "Regenerate"
                      : "Prepare draft"}
                </Button>
              </div>
            </div>
          </form>

          {busy && (
            <p
              className="flex items-center gap-2.5 text-xs text-muted-foreground"
              role="status"
              aria-busy="true"
            >
              <Spinner variant="dots" size="xs" />
              Reading your request and preparing a draft…
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="border-l-2 border-l-destructive bg-destructive/10 px-3 py-2 text-xs leading-relaxed text-destructive"
            >
              {error}
            </p>
          )}

          {success && (
            <p
              role="status"
              className="border-l-2 border-l-success bg-success/10 px-3 py-2 text-xs leading-relaxed text-success"
            >
              {success}
            </p>
          )}
        </>
      )}
    </section>
  );
}
