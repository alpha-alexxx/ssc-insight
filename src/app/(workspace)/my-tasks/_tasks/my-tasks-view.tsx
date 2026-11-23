"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Add01Icon } from "@/components/animate-ui/icons/hugeicons/add-01";
import { Button } from "@/components/button";
import { Dialog } from "@/components/dialog";
import { Input } from "@/components/input";
import { PageHeader } from "@/components/page-header";
import { PlainIcon } from "@/components/icon";
import { Skeleton } from "@/components/skeleton";
import { toast } from "@/components/toast-stack";
import { useUiStore } from "@/stores/ui-store";
import {
  useInvalidateTodos,
  useTodoList,
  useTodoMutations,
} from "@/components/use-todos-data";
import { addIsoDays, istTodayIso } from "@/lib/plan/view-model";
import { longDate, weekdayDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PersonalCalendar } from "@/components/shared/tasks/personal-calendar";
import { usePlanData } from "@/components/use-plan-data";
import { OverviewStrip } from "./overview-strip";
import { QuickAddBar } from "./quick-add-bar";
import { TaskToolbar, filterCount } from "./task-toolbar";
import { TaskRow } from "@/components/shared/tasks/task-row";
import { BoardView } from "./board-view";
import { BulkBar } from "./bulk-bar";
import { TaskEditor } from "@/components/shared/tasks/task-editor";
import { GroupsManagerDialog } from "@/components/shared/tasks/groups-manager";
import { AiPlanSheet } from "./ai-plan-sheet";
import { TasksEmptyState } from "./tasks-empty-state";
import { PlanRail } from "./plan-rail";
import {
  activeFilterEntries,
  useTasksViewState,
  type TaskFilters,
  type TaskLayout,
  type TaskViewTab,
} from "./use-tasks-view-state";
import type { Task, TaskDraft, TaskListResponse } from "@/components/shared/tasks/types";

const TAB_ITEMS: { id: TaskViewTab; label: string }[] = [
  { id: "myday", label: "My Day" },
  { id: "upcoming", label: "Upcoming" },
  { id: "all", label: "All" },
  { id: "completed", label: "Completed" },
];

/** Unfiltered listing that keeps the rail (groups + counts) and the overview
 * strip fed; inactive list queries alias this cache entry for free. */
const RAIL_QUERY = "view=all&limit=100&sort=date";
const LIST_LIMIT = 50;

type ApplyOp = {
  type: "update" | "delete" | "restore";
  id: string;
  version: number;
  data?: TaskDraft;
};

type ConfirmState =
  | { kind: "task"; task: Task }
  | { kind: "selected"; count: number }
  | { kind: "scope"; count: number }
  | null;

type RescheduleState =
  | { mode: "single"; task: Task }
  | { mode: "bulk" }
  | null;

export function MyTasksView({
  planApi,
}: {
  /** The shell mounts the plan once; this surface only reads it, so plan
   * work stays on the plan surfaces. */
  planApi: ReturnType<typeof usePlanData>;
}) {
  const today = istTodayIso();
  const {
    tab,
    layout,
    filters,
    setTab,
    setLayout,
    patchFilters,
    clearFilters,
  } = useTasksViewState();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dayDetail, setDayDetail] = useState<string | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [rescheduling, setRescheduling] = useState<RescheduleState>(null);
  const [newDate, setNewDate] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  /** Optimistic overlay: id → patch applied to rows until fresher data
   * (version greater than the patched row) arrives from the refetch. Kept in
   * a ref — it is render input, not render output — and pruned lazily. */
  const overlayRef = useRef(
    new Map<string, { baseVersion: number; patch: Partial<Task> }>(),
  );
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const quickAddRef = useRef<HTMLInputElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  // Debounced search: the query key only changes once typing settles, so the
  // shared cache does not grow one entry per keystroke.
  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  // ---- queries ----------------------------------------------------------
  const { mutateTodoRequest } = useTodoMutations();
  const invalidateTodos = useInvalidateTodos();
  const filterSuffix = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.priority !== "all") params.set("priority", filters.priority);
    if (filters.group !== "all") params.set("group", filters.group);
    if (filters.sort !== "priority") params.set("sort", filters.sort);
    if (search) params.set("search", search);
    return params.toString() ? `&${params.toString()}` : "";
  }, [filters.priority, filters.group, filters.sort, search]);

  const boardMode = layout === "board";
  const myDayMode = tab === "myday" && !boardMode;
  const dayMode = myDayMode && dayDetail !== null && dayDetail !== today;
  const statusSuffix =
    tab === "all" && filters.status !== "all"
      ? `&completion=${filters.status}`
      : "";

  const rail = useTodoList<TaskListResponse>(RAIL_QUERY);
  const overdueQuery = useTodoList<TaskListResponse>(
    myDayMode && !dayMode
      ? `view=overdue&limit=${LIST_LIMIT}${filterSuffix}`
      : RAIL_QUERY,
  );
  const todayQuery = useTodoList<TaskListResponse>(
    myDayMode && !dayMode
      ? `view=today&limit=${LIST_LIMIT}${filterSuffix}`
      : RAIL_QUERY,
  );
  const mainQuery = boardMode
    ? `view=all&limit=100${filterSuffix}${statusSuffix}`
    : dayMode
      ? `view=day&date=${dayDetail}&limit=${LIST_LIMIT}${filterSuffix}`
      : tab === "myday"
        ? RAIL_QUERY
        : `view=${tab}&limit=${LIST_LIMIT}&page=${page}${filterSuffix}${statusSuffix}`;
  const main = useTodoList<TaskListResponse>(mainQuery);

  const counts = rail.data?.counts;
  const groups = useMemo(() => rail.data?.groups ?? [], [rail.data]);

  // ---- derived data -----------------------------------------------------
  /** Apply the optimistic patch, dropping the entry once the refetched row
   * carries the mutation (its version moved past the patched one). Reads a
   * ref, so the identity is stable. */
  const withOverlay = useCallback((task: Task): Task => {
    const entry = overlayRef.current.get(task.id);
    if (!entry) return task;
    if (task.version > entry.baseVersion) {
      overlayRef.current.delete(task.id);
      return task;
    }
    return { ...task, ...entry.patch };
  }, []);

  /** Every loaded task, overlay applied — the pool for bulk version lookups. */
  const allLoaded = useMemo(() => {
    const pool = new Map<string, Task>();
    for (const source of [
      rail.data,
      overdueQuery.data,
      todayQuery.data,
      main.data,
    ]) {
      for (const task of source?.items ?? []) {
        if (!pool.has(task.id)) pool.set(task.id, withOverlay(task));
      }
    }
    return pool;
  }, [rail.data, overdueQuery.data, todayQuery.data, main.data, withOverlay]);

  const taskById = useCallback(
    (id: string) => allLoaded.get(id),
    [allLoaded],
  );

  const groupName = useCallback(
    (id: string | null) =>
      id ? groups.find((group) => group.id === id)?.name : undefined,
    [groups],
  );

  const groupCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const task of rail.data?.items ?? []) {
      if (task.groupId)
        map.set(task.groupId, (map.get(task.groupId) ?? 0) + 1);
    }
    return map;
  }, [rail.data]);
  const groupsWithCounts = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          count: groupCounts.get(group.id) ?? 0,
        }))
        .sort(
          (a, b) => b.count - a.count || a.name.localeCompare(b.name),
        ),
    [groups, groupCounts],
  );

  // Active list rows (per mode)
  const overdueItems = useMemo(
    () => (overdueQuery.data?.items ?? []).map(withOverlay),
    [overdueQuery.data, withOverlay],
  );
  const todayItems = useMemo(
    () => (todayQuery.data?.items ?? []).map(withOverlay),
    [todayQuery.data, withOverlay],
  );
  const mainItems = useMemo(
    () => (main.data?.items ?? []).map(withOverlay),
    [main.data, withOverlay],
  );
  const pageIds = useMemo(
    () =>
      new Set(
        (boardMode || !myDayMode || dayMode
          ? mainItems
          : [...overdueItems, ...todayItems]
        ).map((task) => task.id),
      ),
    [boardMode, myDayMode, dayMode, mainItems, overdueItems, todayItems],
  );
  const selectedOnPage = [...selectedIds].filter((id) => pageIds.has(id));

  const loadError =
    boardMode || !myDayMode || dayMode
      ? main.error || rail.error
      : overdueQuery.error || todayQuery.error || rail.error;
  const loading = boardMode
    ? main.loading
    : dayMode
      ? main.loading
      : myDayMode
        ? overdueQuery.loading || todayQuery.loading
        : main.loading;
  const activeDataLoaded = boardMode
    ? Boolean(main.data)
    : dayMode
      ? Boolean(main.data)
      : myDayMode
        ? Boolean(overdueQuery.data || todayQuery.data)
        : Boolean(main.data);

  const firstRun =
    !!counts && counts.all === 0 && !search && filterCount(filters) === 0;
  const hasFilters = filterCount(filters) > 0 || Boolean(search);

  // ---- navigation handlers ---------------------------------------------
  function openTab(next: TaskViewTab) {
    setTab(next);
    setPage(1);
    setDayDetail(null);
    setSelecting(false);
    setSelectedIds(new Set());
  }
  function openDate(date: string) {
    if (date === today) {
      setDayDetail(null);
    } else {
      setDayDetail(date);
    }
    setTab("myday");
    setPage(1);
    setSelecting(false);
    setSelectedIds(new Set());
  }
  function resetPage() {
    setPage(1);
    setSelectedIds(new Set());
  }

  // ---- mutations --------------------------------------------------------
  async function createTask(draft: TaskDraft): Promise<boolean> {
    setBusy(true);
    try {
      await mutateTodoRequest("/api/todos", "POST", draft);
      toast.success("Task added", {
        description: `${draft.title} · due ${longDate(draft.dueDate ?? today)}`,
      });
      return true;
    } catch (cause) {
      toast.error("Could not add the task", {
        description: cause instanceof Error ? cause.message : "Try again.",
      });
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function patchTask(
    task: Task,
    body: TaskDraft,
    successMessage?: string,
  ): Promise<boolean> {
    const id = task.id;
    setPendingIds((prev) => new Set(prev).add(id));
    overlayRef.current.set(id, {
      baseVersion: task.version,
      patch: body as Partial<Task>,
    });
    try {
      await mutateTodoRequest(`/api/todos/${id}`, "PATCH", {
        version: task.version,
        ...body,
      });
      if (successMessage) toast.success(successMessage);
      return true;
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Could not save. Try again.";
      if (message.includes("changed")) {
        void invalidateTodos();
        toast.info("Task was updated elsewhere", {
          description: "Showing the latest version — try again.",
        });
      } else {
        toast.error("Could not update the task", { description: message });
      }
      return false;
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function runApplyOps(
    ops: ApplyOp[],
    successMessage: string,
  ): Promise<boolean> {
    if (!ops.length) return false;
    setBusy(true);
    try {
      for (let index = 0; index < ops.length; index += 25) {
        await mutateTodoRequest("/api/todos/apply", "POST", {
          idempotencyKey: crypto.randomUUID(),
          operations: ops.slice(index, index + 25),
        });
      }
      toast.success(successMessage);
      return true;
    } catch (cause) {
      toast.error("Bulk action did not finish", {
        description: `${cause instanceof Error ? cause.message : "Try again."} Some changes may already be applied.`,
      });
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function trashByIds(ids: string[]): Promise<boolean> {
    setBusy(true);
    try {
      await mutateTodoRequest("/api/todos", "DELETE", { ids });
      return true;
    } catch (cause) {
      toast.error("Could not move tasks to Trash", {
        description: cause instanceof Error ? cause.message : "Try again.",
      });
      return false;
    } finally {
      setBusy(false);
    }
  }

  // ---- task actions -----------------------------------------------------
  function cycleStatus(task: Task, next: "todo" | "in_progress" | "completed") {
    void patchTask(
      task,
      { status: next },
      next === "completed"
        ? `“${task.title}” completed`
        : next === "in_progress"
          ? `“${task.title}” in progress`
          : `“${task.title}” reopened`,
    );
  }
  function postpone(task: Task) {
    const base = task.dueDate && task.dueDate >= today ? task.dueDate : today;
    const next = addIsoDays(base, 1);
    void patchTask(task, { dueDate: next }, `Rescheduled to ${longDate(next)}`);
  }
  async function duplicate(task: Task) {
    await createTask({
      title: `${task.title} (copy)`,
      dueDate: task.dueDate ?? today,
      notes: task.notes ?? "",
      url: task.url ?? "",
      priority: task.priority,
      groupId: task.groupId,
      subtasks: task.subtasks.map((sub) => ({
        ...sub,
        id: crypto.randomUUID(),
        completed: false,
      })),
    });
  }

  // ---- bulk -------------------------------------------------------------
  async function bulkStatus(next: "completed" | "in_progress") {
    const ops: ApplyOp[] = [];
    for (const id of selectedOnPage) {
      const task = taskById(id);
      if (task && !task.deletedAt)
        ops.push({ type: "update", id, version: task.version, data: { status: next } });
    }
    clearSelection();
    await runApplyOps(
      ops,
      next === "completed"
        ? `${ops.length} ${ops.length === 1 ? "task" : "tasks"} completed`
        : `${ops.length} ${ops.length === 1 ? "task" : "tasks"} in progress`,
    );
  }
  async function bulkRescheduleApply() {
    if (!rescheduling || rescheduling.mode !== "bulk" || !newDate) return;
    const ops: ApplyOp[] = [];
    for (const id of selectedOnPage) {
      const task = taskById(id);
      if (task && !task.deletedAt)
        ops.push({ type: "update", id, version: task.version, data: { dueDate: newDate } });
    }
    setRescheduling(null);
    setNewDate("");
    clearSelection();
    await runApplyOps(
      ops,
      `${ops.length} ${ops.length === 1 ? "task" : "tasks"} rescheduled to ${longDate(newDate)}`,
    );
  }
  async function bulkTrashSelected() {
    const ids = [...selectedOnPage];
    clearSelection();
    if (await trashByIds(ids))
      toast.success(
        `${ids.length} ${ids.length === 1 ? "task" : "tasks"} moved to Trash`,
        { description: "Restore from Trash within 15 days." },
      );
  }
  async function scopeTrash() {
    const view = boardMode ? "all" : tab;
    if (!view || !confirm || confirm.kind !== "scope") return;
    setBusy(true);
    try {
      const query = new URLSearchParams({ view, limit: String(LIST_LIMIT) });
      if (filters.priority !== "all") query.set("priority", filters.priority);
      if (filters.group !== "all") query.set("group", filters.group);
      if (filters.sort !== "priority") query.set("sort", filters.sort);
      if (search) query.set("search", search);
      if (tab === "all" && filters.status !== "all")
        query.set("completion", filters.status);
      await mutateTodoRequest(`/api/todos?${query.toString()}`, "DELETE", {
        scope: true,
      });
      toast.success(
        `${confirm.count} ${confirm.count === 1 ? "task" : "tasks"} moved to Trash`,
        {
          description:
            "Everything matching the current view and filters. Restore from Trash within 15 days.",
        },
      );
    } catch (cause) {
      toast.error("Could not move tasks to Trash", {
        description: cause instanceof Error ? cause.message : "Try again.",
      });
    } finally {
      setBusy(false);
      setConfirm(null);
      setSelectedIds(new Set());
    }
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }
  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleSelectMode(next?: boolean) {
    const on = next ?? !selecting;
    setSelecting(on);
    clearSelection();
  }
  function handleLayout(next: TaskLayout) {
    setLayout(next);
    setSelecting(false);
    clearSelection();
  }

  /** One row with every action wired. Shared by every list section. */
  const renderRow = (task: Task) => (
    <TaskRow
      key={task.id}
      task={task}
      today={today}
      groupName={groupName(task.groupId)}
      selecting={selecting}
      selected={selectedIds.has(task.id)}
      pending={pendingIds.has(task.id)}
      onToggleSelected={() => toggleSelected(task.id)}
      onCycleStatus={(next) => cycleStatus(task, next)}
      onEdit={() => setEditing(task)}
      onReschedule={() => {
        setNewDate(task.dueDate ?? today);
        setRescheduling({ mode: "single", task });
      }}
      onPostpone={() => postpone(task)}
      onDuplicate={() => void duplicate(task)}
      onTrash={() => setConfirm({ kind: "task", task })}
    />
  );

  // ---- keyboard shortcuts ----------------------------------------------
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);
      // Hairline dialogs are native <dialog open> elements; Radix used
      // [role=dialog]. Both are checked so S never fires under an overlay.
      if (typing || document.querySelector("dialog[open], [role='dialog']")) return;
      if (event.key === "s" || event.key === "S") {
        event.preventDefault();
        setSelecting((value) => !value);
        setSelectedIds(new Set());
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [tab]);

  // The shell's `n` shortcut and the palette's "New task" ask for the
  // quick-add bar through the UI store. Consumption is tracked in the store
  // so a remount never re-fires an old request.
  const quickAddNonce = useUiStore((s) => s.quickAddNonce);
  const consumedQuickAddNonce = useUiStore((s) => s.consumedQuickAddNonce);
  const consumeQuickAdd = useUiStore((s) => s.consumeQuickAdd);
  useEffect(() => {
    if (quickAddNonce === consumedQuickAddNonce) return;
    consumeQuickAdd();
    quickAddRef.current?.focus();
    quickAddRef.current?.scrollIntoView({ block: "nearest" });
  }, [consumeQuickAdd, consumedQuickAddNonce, quickAddNonce]);

  // ---- render -----------------------------------------------------------
  const activeEntries = activeFilterEntries(filters);
  const stripCounts = {
    overdue: counts?.overdue ?? 0,
    today: counts?.today ?? 0,
    upcoming: counts?.upcoming ?? 0,
    completed: counts?.completed ?? 0,
    all: counts?.all ?? 0,
  };
  const tabCount = (id: TaskViewTab) => {
    if (!counts) return undefined;
    if (id === "myday") return counts.today + counts.overdue;
    if (id === "upcoming") return counts.upcoming;
    if (id === "all") return counts.all;
    return counts.completed;
  };

  const showQuickAdd = !boardMode;
  const showSelectToggle = !boardMode && (tabCount(tab) ?? 0) > 0;
  const scopeAllowed = !myDayMode && !!main.data?.total;
  const editingTask = editing;

  const listBody = (() => {
    if (loadError) {
      return (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-destructive/10 px-3 py-2.5 text-sm text-destructive shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-destructive)_30%,transparent)]"
        >
          <p>{loadError}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void invalidateTodos()}
          >
            Retry
          </Button>
        </div>
      );
    }
    if (loading && !activeDataLoaded) {
      return (
        <div
          className="space-y-2 py-2"
          role="status"
          aria-label="Loading your tasks"
        >
          <span className="sr-only">Loading your tasks…</span>
          {Array.from({ length: 6 }, (_, row) => (
            <Skeleton key={row} height={56} />
          ))}
        </div>
      );
    }
    if (firstRun) {
      return (
        <TasksEmptyState
          title="A clear page for your work"
          detail="Add your first task below, or describe what you need to get done and let AI prepare a draft for you to review."
        >
          <Button size="sm" onClick={() => quickAddRef.current?.focus()}>
            <PlainIcon name="plus" size={14} /> Add your first task
          </Button>
          <Button size="sm" variant="outline" onClick={() => setAiOpen(true)}>
            <PlainIcon name="sparkles" size={14} /> Plan with AI
          </Button>
        </TasksEmptyState>
      );
    }
    if (boardMode) {
      return mainItems.length === 0 ? (
        <TasksEmptyState
          scene={hasFilters ? "search" : "inbox"}
          title={hasFilters ? "Nothing on the board" : "No tasks yet"}
          detail={
            hasFilters
              ? "No tasks match the current search and filters. Clear them to see the full board."
              : "Add a task to get started, or switch back to the list view."
          }
        >
          {hasFilters && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                clearFilters();
                setSearchInput("");
              }}
            >
              Clear search &amp; filters
            </Button>
          )}
        </TasksEmptyState>
      ) : (
        <div className="space-y-3">
          {main.data && main.data.total > main.data.limit && (
            <p className="text-xs text-muted-foreground">
              Showing the first {main.data.limit} of {main.data.total} tasks —
              narrow with search or filters to reach the rest.
            </p>
          )}
          <BoardView
            tasks={mainItems}
            today={today}
            groupNameOf={(task) => groupName(task.groupId)}
            pendingIds={pendingIds}
            onCycleStatus={cycleStatus}
            onEdit={setEditing}
          />
        </div>
      );
    }
    // List mode
    if (dayMode) {
      return mainItems.length === 0 ? (
        <TasksEmptyState
          title={`Nothing scheduled for ${longDate(dayDetail ?? today)}`}
          detail="Add a task below and it will be due on this day."
        />
      ) : (
        <TaskSection label={`Tasks for ${longDate(dayDetail ?? today)}`} count={mainItems.length}>
          {mainItems.map(renderRow)}
        </TaskSection>
      );
    }
    if (myDayMode) {
      if (overdueItems.length === 0 && todayItems.length === 0) {
        return hasFilters ? (
          <TasksEmptyState
            scene="search"
            title="Nothing due today matches"
            detail="Your overdue and today lists are clear under the current search and filters."
          >
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                clearFilters();
                setSearchInput("");
              }}
            >
              Clear search &amp; filters
            </Button>
          </TasksEmptyState>
        ) : (
          <TasksEmptyState
            title="Nothing due today"
            detail="Overdue and today are clear. Plan ahead in Upcoming, or ask AI to prepare the next few days."
          >
            <Button size="sm" variant="outline" onClick={() => openTab("upcoming")}>
              See upcoming
            </Button>
            <Button size="sm" variant="outline" onClick={() => setAiOpen(true)}>
              <PlainIcon name="sparkles" size={14} /> Plan with AI
            </Button>
          </TasksEmptyState>
        );
      }
      return (
        <div className="space-y-5">
          {overdueItems.length > 0 && (
            <TaskSection label="Overdue" count={overdueItems.length} danger>
              {overdueItems.map(renderRow)}
            </TaskSection>
          )}
          {todayItems.length > 0 && (
            <TaskSection label="Today" count={todayItems.length}>
              {todayItems.map(renderRow)}
            </TaskSection>
          )}
        </div>
      );
    }
    // Upcoming / All / Completed
    if (mainItems.length === 0) {
      return (
        <TasksEmptyState
          scene={
            hasFilters ? "search" : tab === "completed" ? "done" : "inbox"
          }
          title={
            hasFilters
              ? "No tasks match"
              : tab === "completed"
                ? "Nothing completed yet"
                : tab === "upcoming"
                  ? "Nothing scheduled ahead"
                  : "No tasks"
          }
          detail={
            hasFilters
              ? "Try a different search, or clear the filters to see everything."
              : tab === "completed"
                ? "Finish a task — by checking it off or cycling its status — and it lands here."
                : tab === "upcoming"
                  ? "Schedule a task for a future date and it will wait here until it's due."
                  : "Add a task below to get started."
          }
        >
          {hasFilters ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                clearFilters();
                setSearchInput("");
              }}
            >
              Clear search &amp; filters
            </Button>
          ) : null}
        </TasksEmptyState>
      );
    }
    const sectionLabel =
      tab === "upcoming"
        ? "Upcoming"
        : tab === "all"
          ? "All tasks"
          : "Completed";
    return (
      <TaskSection
        label={sectionLabel}
        count={mainItems.length}
        total={main.data?.total}
      >
        {mainItems.map(renderRow)}
      </TaskSection>
    );
  })();

  const quickAddDate = dayMode ? dayDetail ?? today : today;

  return (
    <section aria-label="My tasks" className="personal-workspace min-w-0 @container/mt-page">
      <PageHeader
        icon={
          <span
            aria-hidden="true"
            className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary shadow-[inset_0_0_0_1px_var(--border)]"
          >
            <PlainIcon name="check" size={20} />
          </span>
        }
        title="My tasks"
        description="Your own checklist — capture work, decide what's next, and finish it. Separate from the study plan."
        meta={<span>{weekdayDate(today)}</span>}
        actions={
          <>
            <Button type="button" variant="outline" onClick={() => setAiOpen(true)}>
              <PlainIcon name="sparkles" size={14} /> Plan with AI
            </Button>
            <Button type="button" onClick={() => setCreating(true)}>
              <Add01Icon size={14} /> Add task
            </Button>
          </>
        }
      />

      <OverviewStrip counts={stripCounts} onOpen={openTab} />

      <div className="mt-5 grid min-w-0 items-start gap-5 @5xl/mt-page:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]">
        <main className="flex min-w-0 flex-col gap-3 @5xl/mt-page:col-start-1 @5xl/mt-page:row-start-1">
          {/* Tabs */}
          <div
            role="tablist"
            aria-label="Task views"
            className="-mx-3 flex gap-1 overflow-x-auto border-b border-border px-3"
          >
            {TAB_ITEMS.map((item) => {
              const count = tabCount(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  aria-controls={`tasks-panel-${item.id}`}
                  onClick={() => openTab(item.id)}
                  className={cn(
                    "min-h-11 whitespace-nowrap border-b-2 px-3 text-[13px] font-medium transition-colors",
                    tab === item.id
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                  {count !== undefined && count > 0 && (
                    <span className="ml-1.5 tabular-nums">{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div id={`tasks-panel-${tab}`} role="tabpanel" aria-label={`${tab} tasks`} className="flex min-w-0 flex-col gap-3">
            {showQuickAdd && (
              <QuickAddBar
                date={quickAddDate}
                disabled={busy}
                inputRef={quickAddRef}
                onAdd={(title) =>
                  createTask({
                    title,
                    dueDate: quickAddDate,
                    priority: "normal",
                    groupId:
                      filters.group !== "all" && filters.group !== "ungrouped"
                        ? filters.group
                        : null,
                    subtasks: [],
                  })
                }
                onDetails={() => setCreating(true)}
              />
            )}

            {dayMode && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-primary/5 px-3 py-2 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_30%,transparent)]">
                <p className="text-xs text-foreground">
                  Working on <span className="font-medium">{longDate(dayDetail ?? today)}</span>
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDayDetail(null)}
                >
                  Back to today
                </Button>
              </div>
            )}

            <TaskToolbar
              tab={tab}
              layout={layout}
              filters={filters}
              groups={groups}
              search={searchInput}
              onSearch={(value) => {
                setSearchInput(value);
                resetPage();
              }}
              onPatchFilters={(patch) => {
                patchFilters(patch);
                resetPage();
              }}
              onClearFilters={() => {
                clearFilters();
                resetPage();
              }}
              onLayout={handleLayout}
              selecting={selecting}
              hasItems={showSelectToggle}
              onToggleSelect={() => toggleSelectMode()}
              searchRef={searchRef}
            />

            {activeEntries.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {activeEntries.map((entry) => (
                  <button
                    key={entry.key}
                    type="button"
                    onClick={() => {
                      patchFilters({ [entry.key]: "all" } as Partial<TaskFilters>);
                      resetPage();
                    }}
                    className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_35%,transparent)] transition-colors hover:bg-primary/15"
                    aria-label={`Remove ${entry.key} filter`}
                  >
                    {entry.key === "group" && entry.value !== "ungrouped"
                      ? groupName(entry.value) ?? "Group"
                      : entry.label}
                    <span aria-hidden="true">×</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    clearFilters();
                    resetPage();
                  }}
                  className="inline-flex min-h-8 items-center text-[11px] font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  Clear all
                </button>
              </div>
            )}

            {selecting && (
              <BulkBar
                selectedCount={selectedOnPage.length}
                pageTotal={pageIds.size}
                busy={busy}
                scopeTotal={scopeAllowed ? main.data?.total ?? 0 : 0}
                onSelectAll={() => setSelectedIds(new Set(pageIds))}
                onClear={clearSelection}
                onComplete={() => void bulkStatus("completed")}
                onInProgress={() => void bulkStatus("in_progress")}
                onReschedule={() => {
                  setNewDate(quickAddDate);
                  setRescheduling({ mode: "bulk" });
                }}
                onTrash={() =>
                  setConfirm({ kind: "selected", count: selectedOnPage.length })
                }
                onScopeTrash={
                  scopeAllowed
                    ? () =>
                        setConfirm({
                          kind: "scope",
                          count: main.data?.total ?? 0,
                        })
                    : undefined
                }
              />
            )}

            {listBody}

            {!boardMode &&
              !myDayMode &&
              main.data &&
              main.data.total > main.data.limit && (
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-[12px] text-muted-foreground">
                  <span>
                    {main.data.total} {main.data.total === 1 ? "task" : "tasks"} ·
                    Page {main.data.page} of{" "}
                    {Math.ceil(main.data.total / main.data.limit)}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => {
                        setPage(page - 1);
                        clearSelection();
                      }}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page * main.data.limit >= main.data.total}
                      onClick={() => {
                        setPage(page + 1);
                        clearSelection();
                      }}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
          </div>
        </main>

        <aside className="flex min-w-0 flex-col gap-4 @5xl/mt-page:col-start-2 @5xl/mt-page:row-start-1">
          <PlanRail plan={planApi.plan} today={today} />
          <section className="rounded-2xl bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)]" aria-label="Task calendar">
            <PersonalCalendar
              selected={dayDetail ?? today}
              onSelect={openDate}
              onAdd={() => setCreating(true)}
            />
          </section>
          <section className="rounded-2xl bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)]" aria-label="Groups">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-foreground">Groups</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setGroupsOpen(true)}
              >
                Manage
              </Button>
            </div>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Group tasks by subject or project. Click one to filter All tasks.
            </p>
            <ul className="mt-3 space-y-1">
              {groupsWithCounts.length === 0 && (
                <li className="rounded-lg border border-dashed border-border px-3 py-3 text-center text-[11px] text-muted-foreground">
                  No groups yet — create one from any task&apos;s editor, or
                  open Manage.
                </li>
              )}
              {groupsWithCounts.map((group) => (
                <li key={group.id}>
                  <button
                    type="button"
                    aria-pressed={filters.group === group.id && tab === "all"}
                    onClick={() => {
                      patchFilters({ group: group.id });
                      openTab("all");
                    }}
                    className={cn(
                      "flex min-h-9 w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] transition-colors",
                      filters.group === group.id
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-foreground hover:bg-accent",
                    )}
                  >
                    <span className="min-w-0 truncate">{group.name}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {group.count}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      {/* ---- overlays ---- */}
      {creating && (
        <TaskEditor
          key="create"
          todo={{
            id: "",
            title: "",
            dueDate: quickAddDate,
            notes: null,
            priority: "normal",
            status: "todo",
            groupId:
              filters.group !== "all" && filters.group !== "ungrouped"
                ? filters.group
                : null,
            subtasks: [],
            version: 1,
            deletedAt: null,
          }}
          groups={groups}
          busy={busy}
          onSave={async (draft) => createTask(draft)}
          onCreateGroup={async (name) => {
            try {
              const group = await mutateTodoRequest<{ id: string }>(
                "/api/todos/groups",
                "POST",
                { name },
              );
              return group?.id ?? null;
            } catch {
              return null;
            }
          }}
          onClose={() => setCreating(false)}
        />
      )}
      {editingTask && (
        <TaskEditor
          key={editingTask.id}
          todo={editingTask}
          groups={groups}
          busy={busy}
          onSave={async (draft) => {
            const ok = await patchTask(editingTask, draft);
            if (ok) setEditing(null);
            return ok;
          }}
          onCreateGroup={async (name) => {
            try {
              const group = await mutateTodoRequest<{ id: string }>(
                "/api/todos/groups",
                "POST",
                { name },
              );
              return group?.id ?? null;
            } catch {
              return null;
            }
          }}
          onClose={() => setEditing(null)}
        />
      )}
      {confirm?.kind === "task" && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open && !busy) setConfirm(null);
          }}
          title="Move to Trash?"
          description={`“${confirm.task.title}” and its subtasks can be restored later from Trash.`}
          footer={
            <>
              <Button variant="ghost" disabled={busy} onClick={() => setConfirm(null)}>
                Cancel
              </Button>
              <Button
                disabled={busy}
                onClick={async () => {
                  const task = confirm.task;
                  setConfirm(null);
                  await trashByIds([task.id]);
                  toast.success(`“${task.title}” moved to Trash`, {
                    description: "Restore it anytime from Trash.",
                  });
                }}
              >
                Move to Trash
              </Button>
            </>
          }
        />
      )}
      {confirm && confirm.kind !== "task" && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open && !busy) setConfirm(null);
          }}
          title={
            confirm.kind === "selected"
              ? `Move ${confirm.count} ${confirm.count === 1 ? "task" : "tasks"} to Trash?`
              : `Move all ${confirm.count} matching ${confirm.count === 1 ? "task" : "tasks"} to Trash?`
          }
          description={
            confirm.kind === "selected"
              ? "Selected tasks and their subtasks can be restored from Trash."
              : "Applies to everything matching the current view, search, and filters — not just this page. You can restore them from Trash."
          }
          footer={
            <>
              <Button variant="ghost" disabled={busy} onClick={() => setConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={busy}
                onClick={() => {
                  if (confirm.kind === "selected") void bulkTrashSelected();
                  else void scopeTrash();
                  setConfirm(null);
                }}
              >
                Move to Trash
              </Button>
            </>
          }
        />
      )}
      {rescheduling && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open && !busy) setRescheduling(null);
          }}
          title={
            rescheduling.mode === "bulk"
              ? `Reschedule ${selectedOnPage.length} ${selectedOnPage.length === 1 ? "task" : "tasks"}`
              : "Reschedule task"
          }
          description={
            rescheduling.mode === "bulk"
              ? "Every selected task moves to this date. Subtasks move with their tasks."
              : `“${rescheduling.task.title}”. Subtasks move with this task.`
          }
        >
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!newDate) return;
              if (rescheduling.mode === "bulk") {
                void bulkRescheduleApply();
              } else {
                const task = rescheduling.task;
                setRescheduling(null);
                void patchTask(
                  task,
                  { dueDate: newDate },
                  `Rescheduled to ${longDate(newDate)}`,
                );
              }
            }}
          >
            <Input
              label="New date"
              type="date"
              required
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() => setRescheduling(null)}
              >
                Cancel
              </Button>
              <Button disabled={busy}>Reschedule</Button>
            </div>
          </form>
        </Dialog>
      )}
      <GroupsManagerDialog
        open={groupsOpen}
        onOpenChange={setGroupsOpen}
        groups={groupsWithCounts}
        busy={busy}
        onCreate={async (name) => {
          try {
            await mutateTodoRequest("/api/todos/groups", "POST", { name });
            toast.success(`Group “${name}” created`);
            return true;
          } catch {
            return false;
          }
        }}
        onRename={async (id, name) => {
          try {
            await mutateTodoRequest(`/api/todos/groups/${id}`, "PATCH", { name });
            toast.success("Group renamed");
            return true;
          } catch {
            return false;
          }
        }}
        onDelete={async (id) => {
          try {
            await mutateTodoRequest(`/api/todos/groups/${id}`, "DELETE");
            if (filters.group === id) patchFilters({ group: "all" });
            toast.success("Group removed", {
              description: "Its tasks are now Ungrouped.",
            });
            return true;
          } catch {
            return false;
          }
        }}
      />
      <AiPlanSheet open={aiOpen} onOpenChange={setAiOpen} />
    </section>
  );
}

/** One grouped section of rows with a serif header. */
function TaskSection({
  label,
  count,
  danger = false,
  total,
  children,
}: {
  label: string;
  count: number;
  danger?: boolean;
  total?: number;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={`${label}: ${count} tasks`}>
      <div className="flex items-baseline justify-between gap-2 border-b border-border bg-muted/30 px-3 py-2">
        <h3
          className={cn(
            "font-serif text-[15px] text-foreground",
            danger && "text-destructive",
          )}
        >
          {label}
        </h3>
        <span className="text-xs tabular-nums text-muted-foreground">
          {count}
          {total !== undefined && total > count ? ` of ${total}` : ""}
        </span>
      </div>
      <ul>{children}</ul>
    </section>
  );
}
