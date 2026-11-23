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

/** "Mon 3 Nov" — the compact date the ledger rows lead with. */
function weekdayDateLabel(iso: string): string {
  if (!iso) return "Needs date";
  const weekday = weekdayDate(iso).split(",")[0] ?? "";
  return `${weekday.slice(0, 3)} ${shortDate(iso)}`;
}
import { useInvalidateTodos, useTodoList } from "@/components/use-todos-data";
import type { Task, TaskDraft, TaskListResponse, Subtask } from "./types";

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

/**
 * The same explicit-date, review-before-write workflow in planner and AI sheet.
 * Extracted from plan/personal-todos.tsx so the My Tasks workspace, the AI
 * sheet tab, and any future host share one implementation.
 *
 * Hairline rebuild: fields are the Hairline Input/Select/Textarea, the
 * proposal checkboxes are the Hairline Checkbox, the working indicator is
 * the Hairline Spinner (dots), and every colour is a semantic token. The
 * review ledger keeps its select-then-apply semantics: the installed
 * `approval-card` (one Approve/Deny per card) and `action-receipt` (undo
 * receipts for actions already taken) model different interactions, so the
 * editable proposal rows are composed from tokens instead — recorded in the
 * migration report.
 */
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
   * composer (the host hides the transcript while the draft is open);
   * "compact" is the sheet/planner behavior, unchanged. */
  variant?: "compact" | "page";
  /** The sheet passes the live AI status; the planner host leaves it unset
   * and keeps its always-available behavior. */
  configured?: boolean;
  /** Notifies the host so AI status can be refetched after setup. */
  onAiConfigured?: (credential: AiCredentialSummary | null) => void;
  /** Fires whenever the takeover state flips (a parsed draft opens or
   * closes) so the host can hide the transcript and chips. */
  onTakeoverChange?: (active: boolean) => void;
  /** Fires after Apply succeeds with the number of applied changes. */
  onApplied?: (count: number) => void;
}) {
  // The Todos tab says AI is off instead of failing at submit time.
  if (compact && configured === false) {
    return (
      <section className="flex flex-col gap-5" aria-label="AI todo assistant">
        <div>
          <h3 className="font-serif text-[1.375rem] font-medium leading-tight text-foreground">
            Plan your study todos
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Todo planning runs on AI. Set up a provider to draft revision
            todos and reschedules here — manual entry stays available in My
            Tasks.
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
  const [open, setOpen] = useState(compact),
    [prompt, setPrompt] = useState(""),
    [date, setDate] = useState(""),
    [endDate, setEndDate] = useState("");
  const [draft, setDraft] = useState<DraftResponse | null>(null),
    [selected, setSelected] = useState<number[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  /** Which proposal rows have their fields open. The ledger shows one line per
   * change by default; editing is opt-in so five proposals stay scannable. */
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const token = useRef(crypto.randomUUID());
  const page = variant === "page";
  const slim = compact || page;
  const takeover = page && draft != null && !draft.needsDates;
  // The host hides the transcript/chips while the ledger owns the column.
  // useLayoutEffect (not useEffect): the transcript must be gone before the
  // first paint of the takeover, or it flashes for a frame.
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
  return (
    <section
      className={cn("flex flex-col gap-5", !compact && "rounded-2xl bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)]")}
      aria-label="AI todo assistant"
    >
      {slim && (
        <>
          <div>
            <h3 className="font-serif text-[1.375rem] font-medium leading-tight text-foreground">
              Plan your study todos
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Describe the week — the draft appears here for your review.
            </p>
          </div>
          <div className="flex items-start gap-2.5 border-l-2 border-l-primary pl-3">
            <PlainIcon name="calendarPlus" size={15} className="mt-0.5 shrink-0 text-primary" />
            <p className="min-w-0 text-sm leading-relaxed text-muted-foreground">
              Choose dates and say what you want to plan. You review every
              proposed todo before anything is saved.
            </p>
          </div>
        </>
      )}
      {!compact && (
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
            <label>
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                What would you like to plan?
              </span>
              <Textarea
                required
                maxLength={MAX_TODO_PROMPT_CHARS}
                minRows={slim ? 2 : 3}
                maxRows={10}
                showCount
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Create revision todos for my weaker subjects, or reschedule unfinished work…"
                disabled={busy}
              />
            </label>
            <div className="grid grid-cols-2 gap-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <label>
                Start date
                <Input
                  type="date"
                  value={date}
                  className="mt-1"
                  onChange={(e) => setDate(e.target.value)}
                  disabled={busy}
                />
              </label>
              <label>
                End date (optional)
                <Input
                  type="date"
                  min={date || undefined}
                  value={endDate}
                  className="mt-1"
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={busy}
                />
              </label>
            </div>
            {slim && (
              <div className="border-t border-border pt-3">
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <PlainIcon name="flash" size={12} className="shrink-0 text-primary" />
                  Start from a template
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => {
                      setDate(istTodayIso());
                      setEndDate(addIsoDays(istTodayIso(), 6));
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
                      onClick={() => setPrompt(value)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <p className="text-xs leading-relaxed text-muted-foreground">
              Choose the dates explicitly. AI can use your mock performance,
              study plan, and personal todo notes and subtasks. This context is
              sent to your configured provider; credentials and account identity
              are excluded.
            </p>
            <Button
              className={slim ? "w-full justify-center" : undefined}
              disabled={busy || !prompt.trim()}
            >
              {slim && <PlainIcon name="sparkles" size={18} />}
              {busy
                ? "Working…"
                : draft
                  ? "Generate new draft"
                  : "Prepare draft"}
            </Button>
            <p className={cn("flex items-start gap-2 text-xs leading-relaxed text-muted-foreground", page && "hidden")}>
              {compact && <PlainIcon name="info" size={16} className="mt-0.5 shrink-0" />}
              <span>
                Generating does not save anything. Manual todo entry works
                without AI.
              </span>
            </p>
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
          {draft?.needsDates && (
            <p
              role="status"
              className="rounded-xl bg-warning/10 p-3 text-sm text-warning shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-warning)_35%,transparent)]"
            >
              {draft.question ??
                "Which date or date range should these todos use?"}{" "}
              Choose the dates above, then prepare the draft again.
            </p>
          )}
          {draft && !draft.needsDates && (
            <div className="border-t border-border pt-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Review · {draft.operations.length}{" "}
                  {draft.operations.length === 1 ? "change" : "changes"}
                </h4>
                <span className="text-[11px] text-muted-foreground">
                  Only checked rows are applied
                </span>
              </div>
              {draft.contextTruncated && (
                <p className="mt-2 border-l-2 border-l-warning pl-2.5 text-[11px] leading-relaxed text-warning">
                  Only part of your task history fitted in the AI context.
                  Review suggestions against the rest of your planner.
                </p>
              )}
              {!draft.operations.length && (
                <p className="mt-3 text-sm text-muted-foreground">
                  No changes proposed. Try a more specific instruction.
                </p>
              )}
              <ul className="mt-1 divide-y divide-border">
                {draft.operations.map((op, index) => {
                  const before = op.id ? (draft.before?.[op.id] ?? null) : null;
                  const after = proposedValue(op, before ?? null);
                  const duplicate = duplicateWarning(index, op, before ?? null);
                  const checked = selected.includes(index);
                  const open = expanded[index] ?? false;
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
                          aria-label={`${op.type === "delete" ? "Trash" : op.type === "create" ? "Add" : "Update"} ${after.title || "proposal"}`}
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
                          {op.type === "delete" ? "−" : op.type === "create" ? "+" : "~"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
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
                            <span className="capitalize">{after.priority} priority</span>
                            {before && before.dueDate && before.dueDate !== after.dueDate && (
                              <span className="line-through">
                                was {weekdayDateLabel(before.dueDate)}
                              </span>
                            )}
                            {after.subtasks.length > 0 && (
                              <span>
                                {after.subtasks.filter((s) => s.completed).length}/
                                {after.subtasks.length} subtasks
                              </span>
                            )}
                          </p>
                          {duplicate && (
                            <p
                              role="status"
                              className="mt-1 border-l-2 border-l-warning pl-2 text-[11px] leading-relaxed text-warning"
                            >
                              {duplicate}
                            </p>
                          )}
                          {open && op.type !== "delete" && (
                            <div className="mt-2 space-y-2 border-l border-border pl-3">
                              <Input
                                label="Title"
                                required
                                maxLength={200}
                                value={op.data?.title ?? before?.title ?? ""}
                                onChange={(e) =>
                                  changeOperation(index, { title: e.target.value })
                                }
                                disabled={busy}
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  label="Date"
                                  type="date"
                                  required
                                  value={op.data?.dueDate ?? before?.dueDate ?? ""}
                                  onChange={(e) =>
                                    changeOperation(index, { dueDate: e.target.value })
                                  }
                                  disabled={busy}
                                />
                                <Select
                                  label="Priority"
                                  value={op.data?.priority ?? before?.priority ?? "normal"}
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
                                maxRows={8}
                                maxLength={2000}
                                value={op.data?.notes ?? before?.notes ?? ""}
                                onChange={(e) =>
                                  changeOperation(index, { notes: e.target.value })
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
                                <div key={sub.id ?? i} className="flex items-center gap-2">
                                  <Checkbox
                                    size="sm"
                                    checked={sub.completed}
                                    disabled={busy}
                                    aria-label={`Complete proposed subtask ${i + 1}`}
                                    onCheckedChange={(value) =>
                                      changeOperation(index, {
                                        subtasks: after.subtasks.map((item, n) =>
                                          n === i
                                            ? { ...item, completed: Boolean(value) }
                                            : item,
                                        ),
                                        completed: undefined,
                                      })
                                    }
                                  />
                                  <Input
                                    aria-label={`Subtask ${i + 1} title`}
                                    className="min-w-0 flex-1"
                                    maxLength={200}
                                    value={sub.title}
                                    disabled={busy}
                                    onChange={(event) =>
                                      changeOperation(index, {
                                        subtasks: after.subtasks.map((item, n) =>
                                          n === i ? { ...item, title: event.target.value } : item,
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
                                        subtasks: after.subtasks.filter((_, n) => n !== i),
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
                                      { id: crypto.randomUUID(), title: "", completed: false },
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
                            aria-expanded={open}
                            className="shrink-0 pt-1 text-[11px] font-medium text-primary hover:text-primary/80"
                          >
                            {open ? "Done" : "Edit"}
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
              {duplicateLookupTruncated && (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Duplicate hints compare this draft with the first 100 active
                  todos.
                </p>
              )}
              <div className="sticky bottom-0 -mx-1 mt-3 flex items-center justify-between gap-3 border-t border-border bg-background px-1 py-2.5">
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  {selected.length} of {draft.operations.length} selected
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() => {
                      setDraft(null);
                      setSelected([]);
                      setExpanded({});
                    }}
                  >
                    Discard
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={
                      busy ||
                      !selected.length ||
                      draft.operations.some(
                        (op, i) =>
                          selected.includes(i) &&
                          op.type !== "delete" &&
                          (!(op.data?.title ?? draft.before?.[op.id ?? ""]?.title)?.trim() ||
                            !(op.data?.dueDate ?? draft.before?.[op.id ?? ""]?.dueDate) ||
                            (op.data?.subtasks ?? []).some((sub) => !sub.title.trim())),
                      )
                    }
                    onClick={() => void apply()}
                  >
                    Apply {selected.length}
                  </Button>
                </div>
              </div>
            </div>
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
