"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlainIcon } from "@/components/icon";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/checkbox";
import { Dialog } from "@/components/dialog";
import { Skeleton } from "@/components/skeleton";
import { Textarea } from "@/components/textarea";
import { AttemptRecordCard } from "@/components/attempt-outcome-card";
import { EmptyState } from "@/components/empty-state";
import { PlanErrorCard, ProgressRule } from "@/components/shared/plan/plan-shared";
import { PlanTaskRow } from "@/components/shared/plan/plan-task-row";
import { ResultEditor } from "./day/result-editor";
import { usePlanData } from "@/components/use-plan-data";
import { useTodoList, useTodoMutations } from "@/components/use-todos-data";
import { TaskStatusButton } from "@/components/shared/tasks/task-status-button";
import type { Task, TaskListResponse } from "@/components/shared/tasks/types";
import { useHorizontalSwipe } from "@/hooks/use-horizontal-swipe";
import { istDateKey, longDate, shortDate } from "@/lib/format";
import {
  dayAssignmentStats,
  dayNeighbours,
  dayTypeLabel,
  istTodayIso,
  isMockType,
  nextRecommendedAction,
  planProgressStats,
  revisionQueue,
  type PlanTaskView,
} from "@/lib/plan/view-model";
import type { Attempt } from "@/lib/domain";
import { cn } from "@/lib/utils";

/**
 * Daily study workspace (/plan/[date]) — the guided day flow. One column in
 * workflow order (1 Today's work → 2 Daily habits → 3 Revision blocks →
 * 4 Weak-area notes, then personal tasks and logged attempts), a NEXT UP
 * callout answering "what do I do now?", 2px rules as the only gauge idiom,
 * and a desktop context rail (phase progress, plan-wide %, jump to today).
 * Results are per-task and explicit; the plan is read-only.
 *
 * Hairline rebuild: panels are token-composed cards (rounded-2xl bg-card +
 * inset hairline border), the habits/revision ticks are the Hairline
 * Checkbox, the mark-all confirmation is the Hairline Dialog, and the empty
 * day (a date with no plan work) is the Hairline EmptyState. The day's
 * URL contract (`/plan/[date]`) and every handler are unchanged.
 */
export function PlanDayView({
  date,
  planApi,
  attempts,
  onAddMock,
  onOpenAttempt,
}: {
  date: string;
  planApi: ReturnType<typeof usePlanData>;
  attempts: Attempt[];
  onAddMock: (date: string, task?: PlanTaskView) => void;
  onOpenAttempt: (attempt: Attempt) => void;
}) {
  const router = useRouter();
  const { plan, loading, error, refresh, updateTask, toggleChecklist, toggleDayRevision, saveDayNotes } =
    planApi;
  const today = istTodayIso();

  // Hooks before any conditional return: the personal-tasks rail and the
  // record-step state exist for whatever day resolves below.
  const [openResult, setOpenResult] = useState<{ date: string; key: string } | null>(
    null,
  );
  const [markAllOpen, setMarkAllOpen] = useState(false);
  const todos = useTodoList<TaskListResponse>(`view=day&date=${date}&limit=20`);
  const { mutateTodoRequest } = useTodoMutations();
  // Optimistic overlay for the personal-task section. State (not a ref) so
  // render may read it; only event handlers mutate it.
  const [personalOverlay] = useState(
    () => new Map<string, { baseVersion: number; patch: Partial<Task> }>(),
  );
  const [personalPending, setPersonalPending] = useState<Set<string>>(
    new Set(),
  );
  const [newTaskBusy, setNewTaskBusy] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskError, setNewTaskError] = useState("");
  const neighbours = plan
    ? dayNeighbours(plan.days, date)
    : { current: undefined, previous: undefined, next: undefined };
  const swipe = useHorizontalSwipe((direction) => {
    const target = direction === 1 ? neighbours.next : neighbours.previous;
    if (target) router.push(`/plan/${target.date}`);
  });

  if (loading && !plan)
    return (
      <div
        className="rounded-2xl bg-card p-6 shadow-[inset_0_0_0_1px_var(--border)]"
        aria-busy="true"
      >
        <Skeleton className="mb-4 w-56" />
        <Skeleton shape="block" height={160} className="rounded-xl" />
      </div>
    );
  if (!plan)
    return (
      <PlanErrorCard message={error || "The study plan could not load."} onRetry={() => void refresh()} />
    );

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    return <PlanNotFound date={date} plan={plan} />;
  const { current, previous, next } = neighbours;
  if (!current || current.date !== date)
    return <PlanNotFound date={date} plan={plan} />;

  const stats = dayAssignmentStats(current);
  const phase = plan.phases.find((p) => p.phase === current.phase);
  const dayDate = current.date;
  /**
   * Quick-add for this date. The task is created through the same endpoint
   * My Tasks uses, with the day prefilled, so both surfaces show one record
   * rather than two implementations drifting apart.
   */
  async function addPersonalTask(title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setNewTaskBusy(true);
    setNewTaskError("");
    try {
      await mutateTodoRequest("/api/todos", "POST", {
        title: trimmed.slice(0, 200),
        dueDate: dayDate,
      });
    } catch (e) {
      setNewTaskError(
        e instanceof Error ? e.message : "Could not add the task.",
      );
    } finally {
      setNewTaskBusy(false);
    }
  }
  const dayAttempts = attempts.filter(
    (attempt) => istDateKey(attempt.completedAt) === current.date,
  );
  const checklistDone = current.checklist.filter((item) => item.done).length;
  const outstanding = current.tasks.filter((task) => !task.completed);

  const recommended = nextRecommendedAction(plan.days, today);
  const carriedOver =
    recommended && recommended.day.date !== current.date ? recommended : null;
  const nextUp =
    recommended && recommended.day.date === current.date ? recommended : null;
  const queue = revisionQueue(plan.days, today);
  const weeklyRevisionDay = /rev-?2/i.test(current.dayType);
  const finalRevisionDay = current.phase === 3;

  // Phase progress: assignments across every day of this phase.
  const phaseDays = plan.days.filter((day) => day.phase === current.phase);
  const phaseStats = phaseDays.reduce(
    (acc, day) => {
      const dayStats = dayAssignmentStats(day);
      return {
        completed: acc.completed + dayStats.completed,
        total: acc.total + dayStats.total,
      };
    },
    { completed: 0, total: 0 },
  );
  const planStats = planProgressStats(plan.days);
  const nearestToday =
    plan.days.find((day) => day.date === today) ??
    [...plan.days].filter((day) => day.date < today).at(-1) ??
    plan.days[0];

  const withPersonalOverlay = (task: Task): Task => {
    const entry = personalOverlay.get(task.id);
    if (!entry) return task;
    // A newer server version supersedes the optimistic patch. The entry is
    // ignored here rather than deleted: mutating the Map during render is
    // what React forbids. The write settles below and prunes its own entry,
    // so the overlay cannot grow without bound.
    if (task.version > entry.baseVersion) return task;
    return { ...task, ...entry.patch };
  };
  const personalTasks = (todos.data?.items ?? []).map(withPersonalOverlay);

  async function cyclePersonalStatus(task: Task, next: "todo" | "in_progress" | "completed") {
    setPersonalPending((prev) => new Set(prev).add(task.id));
    personalOverlay.set(task.id, {
      baseVersion: task.version,
      patch: { status: next },
    });
    try {
      await mutateTodoRequest(`/api/todos/${task.id}`, "PATCH", {
        version: task.version,
        status: next,
      });
    } catch {
      // The refetch (fired by the mutation event) restores the real state;
      // API errors already surface through the session/error envelope.
    } finally {
      // The write settled: drop this row's optimistic overlay so the next
      // read of the list is authoritative.
      personalOverlay.delete(task.id);
      setPersonalPending((prev) => {
        const next2 = new Set(prev);
        next2.delete(task.id);
        return next2;
      });
    }
  }

  function markAllDone() {
    setMarkAllOpen(false);
    for (const task of outstanding) updateTask(task.key, { completed: true });
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* ---- Top nav: prev · calendar … add record · next ---- */}
      <div className="mb-5 grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2">
        <div
          role="group"
          aria-label="Plan day navigation"
          className="col-span-2 inline-flex gap-1 sm:col-span-1 sm:w-auto"
        >
          {previous ? (
            <Link
              href={`/plan/${previous.date}`}
              className="inline-flex min-h-9 flex-1 items-center justify-center gap-1 rounded-full px-3 text-[12px] font-medium text-foreground shadow-[inset_0_0_0_1px_var(--border)] transition-colors hover:bg-accent sm:flex-none"
              title={`Day ${previous.day} · ${longDate(previous.date)}`}
            >
              <PlainIcon name="arrowLeft" size={13} /> Day {previous.day}
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex min-h-9 flex-1 items-center justify-center gap-1 rounded-full px-3 text-[12px] font-medium text-muted-foreground opacity-50 sm:flex-none"
            >
              <PlainIcon name="arrowLeft" size={13} /> Day 1
            </span>
          )}
          {next ? (
            <Link
              href={`/plan/${next.date}`}
              className="inline-flex min-h-9 flex-1 items-center justify-center gap-1 rounded-full px-3 text-[12px] font-medium text-foreground shadow-[inset_0_0_0_1px_var(--border)] transition-colors hover:bg-accent sm:flex-none"
              title={`Day ${next.day} · ${longDate(next.date)}`}
            >
              Day {next.day} <PlainIcon name="arrowRight" size={13} />
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex min-h-9 flex-1 items-center justify-center gap-1 rounded-full px-3 text-[12px] font-medium text-muted-foreground opacity-50 sm:flex-none"
            >
              Day 50 <PlainIcon name="arrowRight" size={13} />
            </span>
          )}
        </div>
        <Link
          href="/calendar"
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:min-h-0 sm:justify-start"
        >
          <PlainIcon name="calendar" size={15} /> Calendar
        </Link>
        <Link
          href={`/plan/week/${current.date}`}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:min-h-0 sm:justify-start"
        >
          <PlainIcon name="layers" size={15} /> Week
        </Link>
        <Button
          size="sm"
          className="w-full sm:ml-auto sm:w-auto"
          onClick={() => onAddMock(current.date)}
        >
          <PlainIcon name="plus" size={13} /> Add mock record
        </Button>
      </div>

      {/* ---- Hero: dateline · Day N · type · next-up · figures ---- */}
      <header className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {phase?.name ?? `Phase ${current.phase}`} · {longDate(current.date)}
          {current.date === today
            ? " · today"
            : current.date < today
              ? " · past"
              : " · upcoming"}
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div className="min-w-0">
            <h1 className="text-[clamp(2rem,7vw,2.75rem)] font-semibold leading-none tracking-[-0.03em] text-foreground">
              Day {current.day}
              <span className="ml-2 align-middle rounded-full px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)]">
                CGL plan
              </span>
            </h1>
            <p
              className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary"
              title={current.dayType}
            >
              {dayTypeLabel(current.dayType)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3" aria-live="polite">
            <HeroFigure label="Work" value={`${stats.completed}/${stats.total}`} rule={stats.total ? stats.completed / stats.total : null} />
            <HeroFigure
              label="Habits"
              value={`${checklistDone}/${current.checklist.length}`}
              rule={current.checklist.length ? checklistDone / current.checklist.length : null}
            />
            <HeroFigure
              label="Attempts"
              value={String(dayAttempts.length)}
              rule={null}
            />
            {stats.dayCompleted && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-success)_30%,transparent)]">
                <PlainIcon name="check" size={11} /> Day complete
              </span>
            )}
          </div>
        </div>

        {/* Next-up callout: the workflow's "what do I do now?" answer.
            Phones: label + name on one row, stats + full-width actions on
            the next; sm+ keeps the single inline row. */}
        {(nextUp || carriedOver) && (
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-primary/5 px-4 py-3 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_30%,transparent)]">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
              {carriedOver ? "Carried over" : "Next up"}
            </span>
            {carriedOver ? (
              <Link
                href={`/plan/${carriedOver.day.date}`}
                className="min-w-0 flex-1 basis-full text-sm font-medium text-foreground underline-offset-4 hover:text-primary hover:underline sm:basis-0"
              >
                Day {carriedOver.day.day} · {carriedOver.task.name}
                <span className="ml-2 text-[11px] font-normal text-muted-foreground">
                  {longDate(carriedOver.day.date)}
                </span>
              </Link>
            ) : (
              <>
                <p className="min-w-0 flex-1 basis-full break-words text-sm font-medium text-foreground sm:basis-0">
                  {nextUp!.task.name}
                </p>
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  {nextUp!.task.questions} Q · {nextUp!.task.marks} marks
                </span>
                <div className="flex w-full items-center gap-1.5 sm:ml-auto sm:w-auto">
                  {nextUp!.task.url && (
                    <a
                      href={nextUp!.task.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-9 flex-1 items-center justify-center gap-1 rounded-full bg-card px-2 py-1 text-[11px] font-medium text-primary shadow-[inset_0_0_0_1px_var(--border)] transition-colors hover:bg-accent sm:min-h-0 sm:flex-none"
                    >
                      Start <PlainIcon name="arrowUpRight" size={11} />
                    </a>
                  )}
                  {isMockType(nextUp!.task.type) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="min-h-9 flex-1 sm:min-h-0 sm:flex-none"
                      onClick={() => onAddMock(current.date, nextUp!.task)}
                    >
                      Log attempt
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Slim plan context for phones — the desktop rail hides below lg. */}
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground lg:hidden">
          <span className="truncate">
            {phase?.name ?? `Phase ${current.phase}`} · Day {current.day} of{" "}
            {plan.days.length} ·{" "}
            {phaseStats.total
              ? Math.round((phaseStats.completed / phaseStats.total) * 100)
              : 0}
            % of phase
          </span>
          {nearestToday && nearestToday.date !== current.date && (
            <Link
              href={`/plan/${nearestToday.date}`}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {nearestToday.date === today
                ? "Jump to today"
                : `Latest day (${shortDate(nearestToday.date)})`}
              →
            </Link>
          )}
        </div>
      </header>

      {/* ---- Guided flow + desktop context rail ---- */}
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]">
        {/* Swipe scoped to the flow column (the calendar's pattern) — the
            hook itself ignores gestures that start in form fields. */}
        <main className="flex min-w-0 flex-col gap-5" {...swipe}>
          {/* 1 · Today's work */}
          <FlowSection
            index={1}
            label="Today's work"
            count={`${stats.completed} of ${stats.total}`}
            rule={stats.total ? stats.completed / stats.total : null}
            action={
              outstanding.length > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-primary"
                  onClick={() => setMarkAllOpen(true)}
                >
                  Mark all done
                </Button>
              ) : null
            }
          >
            <section className="overflow-hidden rounded-2xl bg-card shadow-[inset_0_0_0_1px_var(--border)]" aria-label="Today's assignments">
              <p className="border-b border-border px-4 py-2.5 text-[11px] leading-relaxed text-muted-foreground sm:px-5">
                Work through each item, then record how it went — checking a
                task reveals its result step.
              </p>
              <ul className="divide-y divide-border">
                {current.tasks.map((task) => {
                  const recorded = task.completed && task.score != null;
                  const open = openResult?.date === current.date && openResult.key === task.key;
                  return (
                    <PlanTaskRow
                      key={task.key}
                      task={task}
                      onToggleCompleted={(completed) => updateTask(task.key, { completed })}
                      onLogAttempt={
                        isMockType(task.type) && !task.completed
                          ? () => onAddMock(current.date, task)
                          : undefined
                      }
                    >
                      {task.completed && (
                        <div className="ml-0 sm:ml-[52px]">
                          <Button
                            type="button"
                            variant={recorded ? "outline" : "primary"}
                            size="xs"
                            aria-expanded={open}
                            onClick={() =>
                              setOpenResult(open ? null : { date: current.date, key: task.key })
                            }
                          >
                            <PlainIcon name={recorded ? "settings" : "trend"} size={11} />
                            {recorded ? "Edit result" : "Record result"}
                          </Button>
                          {open && (
                            <ResultEditor
                              task={task}
                              planApi={planApi}
                              attempts={attempts}
                              onClose={() => setOpenResult(null)}
                            />
                          )}
                        </div>
                      )}
                      {!task.completed && task.notes && (
                        <p className="mt-2 ml-0 text-[11px] text-muted-foreground sm:ml-[52px]">
                          {task.notes}
                        </p>
                      )}
                    </PlanTaskRow>
                  );
                })}
              </ul>
            </section>
          </FlowSection>

          {/* 2 · Daily habits */}
          <FlowSection
            index={2}
            label="Daily habits"
            count={`${checklistDone} of ${current.checklist.length}`}
            rule={current.checklist.length ? checklistDone / current.checklist.length : null}
          >
            <section className="rounded-2xl bg-card px-4 py-4 shadow-[inset_0_0_0_1px_var(--border)] sm:px-5" aria-label="Daily checklist">
              <p className="text-[11px] text-muted-foreground">
                The plan&apos;s four habits for every study day — they decide
                whether the day counts as complete.
              </p>
              <ul className="mt-3.5 flex flex-col gap-3">
                {current.checklist.map((item) => (
                  <li key={item.id}>
                    <Checkbox
                      checked={item.done}
                      size="md"
                      label={
                        <span className={item.done ? "text-muted-foreground line-through" : undefined}>
                          {item.label}
                        </span>
                      }
                      onCheckedChange={(done) =>
                        toggleChecklist(current.day, item.id, done)
                      }
                    />
                  </li>
                ))}
              </ul>
            </section>
          </FlowSection>

          {/* 3 · Revision blocks (+ honest revision hints) */}
          {(current.revisionTasks.length > 0 ||
            weeklyRevisionDay ||
            finalRevisionDay) && (
            <FlowSection
              index={3}
              label="Revision blocks"
              count={
                current.revisionTasks.length
                  ? `${current.revisionDone.length} of ${current.revisionTasks.length}`
                  : null
              }
              rule={
                current.revisionTasks.length
                  ? current.revisionDone.length / current.revisionTasks.length
                  : null
              }
            >
              <section className="rounded-2xl bg-card px-4 py-4 shadow-[inset_0_0_0_1px_var(--border)] sm:px-5" aria-label="Revision">
                {current.revisionTasks.length > 0 ? (
                  <ul className="flex flex-col gap-2.5">
                    {current.revisionTasks.map((label, index) => {
                      const done = current.revisionDone.includes(String(index));
                      return (
                        <li key={index}>
                          <Checkbox
                            checked={done}
                            size="md"
                            label={
                              <span className={done ? "text-muted-foreground line-through" : undefined}>
                                {label}
                              </span>
                            }
                            onCheckedChange={(checked) =>
                              toggleDayRevision(current.day, index, checked)
                            }
                          />
                        </li>
                      );
                    })}
                  </ul>
                ) : weeklyRevisionDay ? (
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Weekly Rev-2 day. {queue.rev2.length === 0
                      ? "Every completed task from this week already has its Rev-2 tick."
                      : `${queue.rev2.length} completed ${queue.rev2.length === 1 ? "task" : "tasks"} from this week still need their Rev-2 tick — open a task's result editor and mark it.`}
                  </p>
                ) : finalRevisionDay ? (
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Final-revision window. {queue.rev3.length === 0
                      ? "Nothing is left to revisit."
                      : `${queue.rev3.length} ${queue.rev3.length === 1 ? "item is" : "items are"} still waiting for a Rev-3 pass — tick Rev-3 in each task's result editor.`}
                  </p>
                ) : (
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    No revision blocks scheduled today. Rev-1 happens right
                    after each task — tick it in the task&apos;s result editor.
                  </p>
                )}
              </section>
            </FlowSection>
          )}

          {/* 4 · Weak areas & mistake notebook */}
          <FlowSection index={4} label="Weak areas & notes" count={null} rule={null}>
            <DayNotes day={current.day} initial={current.notes} onSave={saveDayNotes} />
          </FlowSection>

          {/* Personal tasks for this date */}
          <section className="overflow-hidden rounded-2xl bg-card shadow-[inset_0_0_0_1px_var(--border)]" aria-label="Your tasks for this date">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 sm:px-5">
              <h2 className="text-base font-semibold text-foreground">
                Your personal tasks
              </h2>
              <div className="flex items-center gap-3">
                <form
                  className="flex items-center gap-1.5"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void addPersonalTask(newTaskTitle).then(() => {
                      setNewTaskTitle("");
                    });
                  }}
                >
                  <label className="sr-only" htmlFor="plan-day-new-task">
                    New task for {longDate(current.date)}
                  </label>
                  <input
                    id="plan-day-new-task"
                    className="h-7 w-40 rounded-full bg-background px-3 text-[12px] text-foreground outline-none placeholder:text-muted-foreground/70 shadow-[inset_0_0_0_1px_var(--border)] focus-visible:shadow-[inset_0_0_0_1px_var(--ring)] sm:w-56"
                    placeholder="Add a task for this day…"
                    maxLength={200}
                    value={newTaskTitle}
                    disabled={newTaskBusy}
                    onChange={(event) => setNewTaskTitle(event.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={newTaskBusy || !newTaskTitle.trim()}
                  >
                    <PlainIcon name="plus" size={13} /> Add
                  </Button>
                </form>
                <Link
                  href="/my-tasks"
                  className="text-[11px] font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Open My Tasks →
                </Link>
              </div>
            </div>
            {newTaskError && (
              <p role="alert" className="border-b border-border px-4 py-2 text-[11px] text-destructive sm:px-5">
                {newTaskError}
              </p>
            )}
            {personalTasks.length > 0 ? (
              <ul className="divide-y divide-border">
                {personalTasks.map((task) => (
                  <li key={task.id} className="flex items-start gap-2.5 px-4 py-3 sm:px-5">
                    <TaskStatusButton
                      task={task}
                      today={current.date}
                      pending={personalPending.has(task.id)}
                      onCycle={(nextStatus) => void cyclePersonalStatus(task, nextStatus)}
                      className="mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "break-words text-sm font-medium leading-snug",
                          task.status === "completed" && "text-muted-foreground line-through",
                        )}
                      >
                        {task.title}
                      </p>
                      {task.notes && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{task.notes}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-4 text-[13px] text-muted-foreground sm:px-5">
                Nothing personal is due on this date. Add a task if today needs
                one — it appears here and in My Tasks.
              </p>
            )}
          </section>

          {/* Logged attempts */}
          <section className="rounded-2xl bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)] sm:p-5" aria-label="Logged attempts">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-foreground">Logged attempts</h2>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                  Tracker results whose attempt date is this day.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onAddMock(current.date)}>
                <PlainIcon name="plus" size={12} /> Add
              </Button>
            </div>
            {dayAttempts.length ? (
              <ul className="mt-3 flex flex-col gap-2">
                {dayAttempts.map((attempt) => (
                  <li key={attempt.id}>
                    <AttemptRecordCard attempt={attempt} onOpen={onOpenAttempt} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-3 flex items-start gap-3 rounded-xl border border-dashed border-border px-4 py-4">
                <PlainIcon name="file" size={17} className="mt-0.5 shrink-0 text-muted-foreground" />
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Nothing logged for this date yet. Log a mock to record how it
                  went — the plan itself never moves.
                </p>
              </div>
            )}
          </section>
        </main>

        {/* Desktop context rail */}
        <aside className="hidden min-w-0 flex-col gap-5 lg:flex lg:col-start-2 lg:row-start-1">
          <section className="rounded-2xl bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)] sm:p-5" aria-label="Plan context">
            <h2 className="text-base font-semibold text-foreground">Plan context</h2>
            <div className="mt-3.5">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-foreground">
                  Day {current.day} of {plan.days.length}
                </p>
                <p className="text-[11px] tabular-nums text-muted-foreground">
                  {shortDate(plan.startDate)} – {longDate(plan.endDate)}
                </p>
              </div>
              <ProgressRule
                done={stats.completed}
                total={stats.total}
                label={`Day ${current.day}`}
                className="mt-2"
              />
            </div>
            <div className="mt-4 border-t border-border pt-3.5">
              <p className="text-xs font-medium text-foreground">
                {phase?.name ?? `Phase ${current.phase}`}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {phaseStats.completed} of {phaseStats.total} assignments across
                days {phaseDays[0]?.day}–{phaseDays.at(-1)?.day}
              </p>
              <ProgressRule
                done={phaseStats.completed}
                total={phaseStats.total}
                label={phase?.name ?? `Phase ${current.phase}`}
                className="mt-2"
              />
            </div>
            <div className="mt-4 border-t border-border pt-3.5">
              <p className="text-xs font-medium text-foreground">
                Whole plan · {planStats.completionPct}%
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {planStats.completedDays} of {planStats.totalDays} days ·{" "}
                {planStats.completedAssignments} of {planStats.totalAssignments}{" "}
                assignments
              </p>
              <ProgressRule
                done={planStats.completedAssignments}
                total={planStats.totalAssignments}
                label="Whole plan"
                className="mt-2"
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3.5">
              {nearestToday && nearestToday.date !== current.date && (
                <Link
                  href={`/plan/${nearestToday.date}`}
                  className={
                    nearestToday.date === today
                      ? "inline-flex h-7 items-center rounded-full bg-primary/10 px-3 text-[12px] font-medium text-primary transition-colors hover:bg-primary/15"
                      : "inline-flex h-7 items-center rounded-full px-3 text-[12px] font-medium text-foreground shadow-[inset_0_0_0_1px_var(--border)] transition-colors hover:bg-accent"
                  }
                >
                  {nearestToday.date === today
                    ? "Jump to today"
                    : `Latest day (${shortDate(nearestToday.date)})`}
                </Link>
              )}
              <Link
                href="/calendar"
                className="inline-flex h-7 items-center rounded-full px-3 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Open calendar
              </Link>
            </div>
          </section>
        </aside>
      </div>

      {/* Mark-all-done confirmation */}
      {markAllOpen && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) setMarkAllOpen(false);
          }}
          title={`Mark all ${outstanding.length} ${
            outstanding.length === 1 ? "task" : "tasks"
          } done?`}
          description={`Every outstanding assignment for Day ${current.day} gets its tick. You can untick any task afterwards.`}
          footer={
            <>
              <Button variant="ghost" onClick={() => setMarkAllOpen(false)}>
                Cancel
              </Button>
              <Button onClick={markAllDone}>Mark all done</Button>
            </>
          }
        />
      )}
    </div>
  );
}

/** Hero context figure: serif value over a 2px rule — the page's one gauge. */
function HeroFigure({
  label,
  value,
  rule,
}: {
  label: string;
  value: string;
  rule: number | null;
}) {
  return (
    <div className="min-w-16">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 font-serif text-xl tabular-nums leading-none text-foreground">
        {value}
      </p>
      {rule != null && (
        <ProgressRule
          done={Math.round(rule * 100)}
          total={100}
          label={label}
          className="mt-1.5 w-20"
        />
      )}
    </div>
  );
}

/** One numbered step of the guided day flow. */
function FlowSection({
  index,
  label,
  count,
  rule,
  action,
  children,
}: {
  index: number;
  label: string;
  count: string | null;
  rule: number | null;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={label}>
      <div className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span
          className="grid size-5 shrink-0 place-items-center rounded-full border border-border text-[10px] font-semibold tabular-nums text-muted-foreground"
          aria-hidden="true"
        >
          {index}
        </span>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground">
          {label}
        </h2>
        {count && <span className="text-[11px] tabular-nums text-muted-foreground">{count}</span>}
        {rule != null && (
          <ProgressRule
            done={Math.round(rule * 100)}
            total={100}
            label={`${label} progress`}
            className="w-full sm:w-auto sm:min-w-16 sm:flex-1"
          />
        )}
        {action && <div className="ml-auto shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  );
}

function PlanNotFound({
  date,
  plan,
}: {
  date: string;
  plan: NonNullable<ReturnType<typeof usePlanData>["plan"]>;
}) {
  const today = istTodayIso();
  const nearest =
    plan.days.find((day) => day.date === today) ??
    [...plan.days].filter((day) => day.date < today).at(-1) ??
    plan.days[0];
  return (
    <div className="mx-auto max-w-lg py-10">
      <EmptyState
        scene="inbox"
        title={`No plan day for ${date}`}
        description={
          <>
            The plan runs {longDate(plan.startDate)} – {longDate(plan.endDate)}.
            Pick a date inside that window.
          </>
        }
      >
        {nearest && (
          <Link
            href={`/plan/${nearest.date}`}
            className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {nearest.date === today
              ? "Go to today"
              : `Go to the latest day (${shortDate(nearest.date)})`}
          </Link>
        )}
        <Link
          href="/calendar"
          className="inline-flex h-9 items-center gap-1 rounded-full px-4 text-[13px] font-medium text-foreground shadow-[inset_0_0_0_1px_var(--border)] transition-colors hover:bg-accent"
        >
          <PlainIcon name="calendar" size={14} /> Open the study calendar
        </Link>
      </EmptyState>
    </div>
  );
}

/** The mistake notebook — explicit Save, blur-save kept, and pending edits
 * flush to the right day when the date changes. */
function DayNotes({
  day,
  initial,
  onSave,
}: {
  day: number;
  initial: string;
  onSave: (day: number, notes: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState({ day, value: initial, saved: initial });
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Day change re-seed (React adjust-state pattern). Dirty edits flush to
  // the day they were written for instead of being lost.
  if (initial !== draft.saved || day !== draft.day) {
    if (draft.value !== draft.saved) void onSave(draft.day, draft.value);
    setDraft({ day, value: initial, saved: initial });
    setSaving(false);
    setSavedAt(null);
  }

  async function persist() {
    if (draft.value === draft.saved || saving) return;
    setSaving(true);
    try {
      await onSave(draft.day, draft.value);
      setDraft((current) => ({ ...current, saved: current.value }));
      setSavedAt(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl bg-card px-4 py-4 shadow-[inset_0_0_0_1px_var(--border)] sm:px-5" aria-label="Day notes">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">
          What needs another look from today&apos;s work?
        </p>
        <div className="flex items-center gap-2">
          {savedAt && (
            <span role="status" className="text-[11px] text-success">
              Saved {savedAt}
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            loading={saving}
            disabled={saving || draft.value === draft.saved}
            onClick={() => void persist()}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
      <Textarea
        aria-label="Day notes"
        minRows={4}
        maxRows={10}
        maxLength={2000}
        value={draft.value}
        placeholder="Weak areas, recurring mistakes, formulas to revisit…"
        onChange={(e) =>
          setDraft((current) => ({ ...current, value: e.target.value }))
        }
        onBlur={() => void persist()}
      />
    </section>
  );
}
