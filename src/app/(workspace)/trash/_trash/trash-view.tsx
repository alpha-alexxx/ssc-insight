"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Dialog } from "@/components/dialog";
import { DropdownMenu } from "@/components/dropdown-menu";
import { EmptyState } from "@/components/empty-state";
import { Pagination } from "@/components/pagination";
import { SearchInput } from "@/components/search-input";
import { SegmentedControl } from "@/components/segmented-control";
import { Select } from "@/components/select";
import { Skeleton } from "@/components/skeleton";
import { PlainIcon } from "@/components/icon";
import { toast } from "@/components/toast-stack";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { TrashDetailSheet } from "./trash-detail-sheet";
import {
  TRASH_EXPIRING_DAYS,
  TRASH_KIND_META,
  TRASH_KIND_ORDER,
  TRASH_RETENTION_DAYS,
  type TrashItem,
  type TrashKind,
  type TrashOutcome,
} from "@/lib/trash-core";
import { longDate, shortDate } from "@/lib/format";
import {
  TRASH_INVALIDATE_SCOPES,
  emptyTrashRequest,
  purgeTrashRequest,
  restoreTrashRequest,
  trashListParams,
  trashListQueryOptions,
} from "@/lib/queries/trash";

/**
 * Trash — the one place deleted records recover.
 *
 * Four kinds (mocks, tasks, custom exams, task groups) share one server-paged
 * list so a search or a sort costs one round trip instead of one per module.
 * Every row states the same three things in the same order — what it was,
 * when it was deleted, how long is left — because the user is making one
 * decision per row: restore it, or spend the remaining days.
 *
 * The destructive paths (permanent delete, Empty Trash) never act on a click:
 * both open a confirmation that names the count and, for a group, the live
 * tasks that will lose their grouping.
 */

type KindFilter = TrashKind | "all";

/** Stable identity for a trashed row: the same shape the API accepts. */
const rowKey = (item: { kind: TrashKind; id: string }) =>
  `${item.kind}:${item.id}`;
const toItemRef = (item: TrashItem) => ({ kind: item.kind, id: item.id });

/** Maps each trashed record kind to its workspace icon. */
function kindIconName(
  kind: TrashKind,
): Parameters<typeof PlainIcon>[0]["name"] {
  switch (kind) {
    case "attempt":
      return "history";
    case "task":
      return "list";
    case "exam":
      return "book";
    case "group":
      return "layers";
    default:
      return "file";
  }
}

/** Trash card — the MIGRATION.md Card pattern composed from tokens. */
function TrashPanel({
  title,
  badge,
  description,
  action,
  children,
}: {
  title: string;
  badge?: React.ReactNode;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl bg-card text-card-foreground shadow-[inset_0_0_0_1px_var(--border)]">
      <div className="flex flex-col gap-3 border-b border-border/80 bg-accent/20 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-background text-foreground shadow-2xs ring-1 ring-primary/10">
            <PlainIcon name="trash" size={16} tone="primary" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-[15px] font-semibold leading-tight text-foreground">
                {title}
              </h2>
              {badge}
            </div>
            {description && (
              <p className="mt-0.5 truncate text-[12px] leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        {action && (
          <div className="flex shrink-0 items-center justify-end gap-2">
            {action}
          </div>
        )}
      </div>
      <div className="p-3.5 sm:p-6 sm:pt-4">{children}</div>
    </section>
  );
}

export function TrashView() {
  const queryClient = useQueryClient();
  // Seed from the URL so a shared/bookmarked filtered Trash link opens the view
  // it names — and so the first render builds the SAME cache key the server
  // prefetched. Hard-coded defaults here silently discarded every deep link,
  // including the dehydrated payload for it.
  const initialQuery = useSearchParams();

  const [kind, setKind] = useState<KindFilter>(
    () => (initialQuery.get("kind") as KindFilter | null) ?? "all",
  );
  const [search, setSearch] = useState(() => initialQuery.get("q") ?? "");
  const [status, setStatus] = useState<"all" | "expiring">(
    () => (initialQuery.get("status") as "all" | "expiring" | null) ?? "all",
  );
  const [sort, setSort] = useState<"recent" | "expiring">(
    () =>
      (initialQuery.get("sort") as "recent" | "expiring" | null) ?? "recent",
  );
  const [page, setPage] = useState(
    () => Number(initialQuery.get("page") ?? 1) || 1,
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<{ kind: TrashKind; id: string } | null>(
    null,
  );
  const [confirm, setConfirm] = useState<
    | {
        mode: "purge";
        items: { kind: TrashKind; id: string }[];
        ungrouped: number;
      }
    | { mode: "empty"; count: number }
    | null
  >(null);

  const debouncedSearch = useDebouncedValue(search, 350);
  const params = useMemo(
    () =>
      trashListParams({
        kind,
        q: debouncedSearch,
        status,
        sort,
        page,
      }),
    [kind, debouncedSearch, status, sort, page],
  );
  const list = useQuery(trashListQueryOptions(params));
  const data = list.data;
  // A fresh `?? []` every render would make it a new dependency for the
  // memos below and defeat them; the empty array is an identity here.
  const items = useMemo(() => data?.items ?? [], [data]);
  // Empty Trash removes every kind, so it must quote the ALL-kinds count, not
  // the currently filtered one.
  const allCount = data?.counts.all ?? 0;
  const retentionDays = data?.retentionDays ?? TRASH_RETENTION_DAYS;

  const hasActiveFilters =
    kind !== "all" || status !== "all" || search.trim().length > 0;

  const resetFilters = useCallback(() => {
    setKind("all");
    setStatus("all");
    setSearch("");
    setPage(1);
  }, []);

  const invalidate = async () => {
    for (const scope of TRASH_INVALIDATE_SCOPES)
      await queryClient.invalidateQueries({ queryKey: scope });
  };

  /** Per-item failures are reported, never swallowed: a partial bulk
   * action must say which record did not move. */
  const report = (outcome: TrashOutcome, successTitle: string) => {
    if (outcome.failed.length) {
      toast.warning(
        `${successTitle} — ${outcome.done} done, ${outcome.failed.length} not`,
        { description: outcome.failed[0]?.message },
      );
    } else {
      toast.success(successTitle, {
        description: `${outcome.done} item${outcome.done === 1 ? "" : "s"}`,
      });
    }
  };

  const restoreMut = useMutation({
    mutationFn: restoreTrashRequest,
    onSuccess: (outcome) => {
      report(outcome, "Restored");
      setSelected(new Set());
      void invalidate();
    },
    onError: (error: unknown) =>
      toast.error("Could not restore", { description: messageOf(error) }),
  });

  const purgeMut = useMutation({
    mutationFn: purgeTrashRequest,
    onSuccess: (outcome) => {
      report(outcome, "Permanently deleted");
      setConfirm(null);
      setSelected(new Set());
      void invalidate();
    },
    onError: (error: unknown) =>
      toast.error("Could not delete permanently", {
        description: messageOf(error),
      }),
  });

  const emptyMut = useMutation({
    mutationFn: emptyTrashRequest,
    onSuccess: (result) => {
      toast.success("Trash emptied", {
        description: `${result.total} item${result.total === 1 ? "" : "s"} removed for good`,
      });
      setConfirm(null);
      setSelected(new Set());
      void invalidate();
    },
    onError: (error: unknown) =>
      toast.error("Could not empty Trash", { description: messageOf(error) }),
  });

  const purgeItems = useCallback(
    (refs: { kind: TrashKind; id: string }[], ungrouped: number) =>
      setConfirm({ mode: "purge", items: refs, ungrouped }),
    [],
  );

  const pageCount = Math.max(
    1,
    Math.ceil((data?.total ?? 0) / (data?.limit || 50)),
  );
  const busy = restoreMut.isPending || purgeMut.isPending || emptyMut.isPending;

  /** The live tasks that lose their grouping when the chosen groups go. */
  const ungroupedOf = (rows: TrashItem[]) =>
    rows
      .filter((row) => row.kind === "group")
      .reduce((sum, row) => sum + (row.affected ?? 0), 0);

  /** Single item lookup when confirming a 1-row permanent delete. */
  const singleConfirmItem = useMemo(() => {
    if (confirm?.mode !== "purge" || confirm.items.length !== 1) return null;
    const target = confirm.items[0];
    return (
      items.find((r) => r.kind === target.kind && r.id === target.id) ?? null
    );
  }, [confirm, items]);

  const columns = useMemo<DataTableColumn<TrashItem>[]>(
    () => [
      {
        key: "title",
        header: "Record",
        card: "title",
        value: (row) => row.title,
        cell: (row) => (
          <div className="flex min-w-0 items-start gap-2.5 py-0.5">
            <span
              aria-hidden="true"
              className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl border border-border/80 bg-accent/50 text-muted-foreground shadow-2xs"
            >
              <PlainIcon
                name={kindIconName(row.kind)}
                size={15}
                tone="primary"
              />
            </span>

            <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
              <button
                type="button"
                onClick={() => setDetail({ kind: row.kind, id: row.id })}
                className="max-w-full truncate text-left text-[13px] font-semibold leading-snug text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:underline"
                aria-label={`View details of ${row.title}`}
              >
                {row.title}
              </button>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] leading-tight text-muted-foreground">
                <Badge size="sm" tone="neutral">
                  {TRASH_KIND_META[row.kind].label}
                </Badge>

                {row.subtitle ? (
                  <span className="max-w-[220px] truncate sm:max-w-[300px]">
                    {row.subtitle}
                  </span>
                ) : null}

                {row.context ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/90">
                    <span
                      aria-hidden="true"
                      className="size-1 rounded-full bg-border"
                    />
                    {row.kind === "task" ? "Due" : "Mock date"}{" "}
                    {shortDate(row.context)}
                  </span>
                ) : null}

                {row.kind === "group" && (row.affected ?? 0) > 0 ? (
                  <span className="inline-flex items-center rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
                    {row.affected} task{row.affected === 1 ? "" : "s"}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "deletedAt",
        header: "Deleted",
        align: "right",
        card: "subtitle",
        value: (row) => row.deletedAt,
        cell: (row) => (
          <span
            className="text-[12px] tabular-nums text-muted-foreground"
            title={longDate(row.deletedAt)}
          >
            {shortDate(row.deletedAt)}
          </span>
        ),
      },
      {
        key: "daysLeft",
        header: "Time left",
        align: "right",
        card: "trailing",
        value: (row) => row.daysLeft,
        cell: (row) => {
          const expiringSoon = row.daysLeft <= TRASH_EXPIRING_DAYS;
          return (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11.5px] font-medium tabular-nums",
                expiringSoon
                  ? "bg-warning/15 font-semibold text-warning"
                  : "bg-muted/70 text-muted-foreground",
              )}
              title={`Expires ${longDate(row.expiresAt)}`}
            >
              {expiringSoon && (
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-current"
                />
              )}
              {row.daysLeft}d left
            </span>
          );
        },
      },
      {
        key: "actions",
        header: "",
        card: "hidden",
        width: "76px",
        cell: (row) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              disabled={busy}
              aria-label={`Restore ${row.title}`}
              title="Restore"
              onClick={() => restoreMut.mutate([toItemRef(row)])}
              className="hidden text-muted-foreground hover:text-primary sm:inline-flex"
            >
              <PlainIcon name="refresh" size={14} />
            </Button>

            <DropdownMenu
              align="end"
              label={`Actions for ${row.title}`}
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Actions for ${row.title}`}
                >
                  <PlainIcon name="more" size={16} />
                </Button>
              }
              items={[
                {
                  id: "restore",
                  label: "Restore",
                  icon: <PlainIcon name="refresh" size={14} />,
                  disabled: busy,
                  onSelect: () => restoreMut.mutate([toItemRef(row)]),
                },
                {
                  id: "detail",
                  label: "View details",
                  icon: <PlainIcon name="file" size={14} />,
                  onSelect: () => setDetail({ kind: row.kind, id: row.id }),
                },
                { type: "separator" },
                {
                  id: "purge",
                  label: "Delete permanently",
                  icon: <PlainIcon name="trash" size={14} />,
                  destructive: true,
                  disabled: busy,
                  onSelect: () =>
                    purgeItems([toItemRef(row)], row.affected ?? 0),
                },
              ]}
            />
          </div>
        ),
      },
    ],
    [busy, restoreMut, purgeItems],
  );

  return (
    <div className="min-w-0 space-y-4">
      {/* ── Retention Policy Banner ── */}
      <div className="flex flex-col gap-2.5 rounded-2xl border border-border/80 bg-accent/30 px-3.5 py-3 shadow-2xs sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="flex items-start gap-2.5 sm:items-center">
          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border border-border/70 bg-background text-muted-foreground sm:mt-0">
            <PlainIcon name="clock" size={14} tone="primary" />
          </span>
          <p className="min-w-0 flex-1 text-[12px] leading-relaxed text-muted-foreground">
            Deleted records stay in Trash for{" "}
            <span className="font-semibold text-foreground">
              {retentionDays} days
            </span>{" "}
            before permanent automatic removal. Restore any record before it
            expires, or purge it early.
          </p>
        </div>

        {hasActiveFilters && (
          <div className="flex shrink-0 items-center justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Reset filters
            </Button>
          </div>
        )}
      </div>

      {/* ── Responsive Filter & Search Toolbar ── */}
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        {/* Scrollable segmented rail on mobile so 5 tabs never overflow */}
        <div className="-mx-1 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <SegmentedControl
            label="Filter by type"
            size="sm"
            value={kind}
            onValueChange={(option) => {
              setKind(option as KindFilter);
              setPage(1);
            }}
            options={(["all", ...TRASH_KIND_ORDER] as KindFilter[]).map(
              (option) => ({
                value: option,
                label: (
                  <>
                    {option === "all" ? "All" : TRASH_KIND_META[option].plural}
                    {data ? (
                      <span className="ml-1 tabular-nums opacity-70">
                        {data.counts[option]}
                      </span>
                    ) : null}
                  </>
                ),
              }),
            )}
          />
        </div>

        {/* Search + Selects: stacked cleanly on mobile, inline on tablet/desktop */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput
            className="w-full sm:w-56 md:w-64"
            size="sm"
            shortcut={null}
            placeholder="Search deleted records…"
            value={search}
            onValueChange={(next) => {
              setSearch(next);
              setPage(1);
            }}
          />

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="sr-only text-xs text-muted-foreground xl:not-sr-only">
                Show
              </span>
              <div className="w-full sm:w-auto">
                <Select
                  label="Show"
                  hideLabel
                  size="sm"
                  value={status}
                  onValueChange={(next) => {
                    setStatus(next as "all" | "expiring");
                    setPage(1);
                  }}
                  options={[
                    { value: "all", label: "Everything" },
                    { value: "expiring", label: "Expiring soon" },
                  ]}
                />
              </div>
            </div>

            <div className="flex min-w-0 items-center gap-1.5">
              <span className="sr-only text-xs text-muted-foreground xl:not-sr-only">
                Sort
              </span>
              <div className="w-full sm:w-auto">
                <Select
                  label="Sort"
                  hideLabel
                  size="sm"
                  value={sort}
                  onValueChange={(next) => {
                    setSort(next as "recent" | "expiring");
                    setPage(1);
                  }}
                  options={[
                    { value: "recent", label: "Recently deleted" },
                    { value: "expiring", label: "Earliest expiration" },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content Surface ── */}
      {list.isError ? (
        <TrashPanel title="Deleted records" description="Could not load Trash.">
          <EmptyState
            scene="offline"
            title="Trash could not be loaded."
            description={
              list.error instanceof Error
                ? list.error.message
                : "Check your connection, then try again."
            }
            action={{
              label: "Try again",
              icon: <PlainIcon name="refresh" size={14} />,
              onAction: () => void list.refetch(),
            }}
          />
        </TrashPanel>
      ) : !data ? (
        <TrashPanel title="Deleted records" description="Loading records…">
          <div className="space-y-2.5" role="status" aria-label="Loading Trash">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} shape="block" height={60} />
            ))}
          </div>
        </TrashPanel>
      ) : items.length ? (
        <TrashPanel
          title="Deleted records"
          badge={
            <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-primary">
              {data.total}
            </span>
          }
          description={`${data.total} item${data.total === 1 ? "" : "s"} recoverable${
            kind !== "all"
              ? ` in ${TRASH_KIND_META[kind].plural.toLowerCase()}`
              : ""
          }`}
          action={
            <Button
              size="sm"
              variant="outline"
              disabled={busy || !allCount}
              icon={<PlainIcon name="trash" size={13} />}
              onClick={() => setConfirm({ mode: "empty", count: allCount })}
            >
              Empty Trash
              {allCount > 0 && (
                <span className="ml-1 tabular-nums text-muted-foreground">
                  ({allCount})
                </span>
              )}
            </Button>
          }
        >
          <div
            className={cn(
              "transition-opacity",
              list.isFetching && !list.isPlaceholderData && "opacity-60",
            )}
          >
            <DataTable
              label="Deleted records"
              noun={["record", "records"]}
              columns={columns}
              rows={items}
              getRowId={rowKey}
              rowLabel={(row) => row.title}
              searchable={false}
              selectable
              selected={[...selected]}
              onSelectedChange={(ids) => setSelected(new Set(ids))}
              pageSize={data.limit || 50}
              actions={[
                {
                  id: "restore",
                  label: "Restore",
                  run: (rows) => restoreMut.mutate(rows.map(toItemRef)),
                },
                {
                  id: "purge",
                  label: "Delete permanently",
                  tone: "destructive",
                  run: (rows) =>
                    purgeItems(rows.map(toItemRef), ungroupedOf(rows)),
                },
              ]}
            />
          </div>

          {data.total > (data.limit || 50) && (
            <Pagination
              className="mt-4 border-t border-border/80 pt-3.5"
              page={page}
              pageCount={pageCount}
              onPageChange={setPage}
            />
          )}
        </TrashPanel>
      ) : (
        <TrashPanel
          title="Deleted records"
          badge={
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
              0
            </span>
          }
          description="No recoverable items match the current view"
        >
          <EmptyState
            scene={hasActiveFilters ? "search" : "done"}
            title={
              hasActiveFilters
                ? "Nothing matches your filters."
                : "Trash is completely empty."
            }
            description={
              hasActiveFilters
                ? `Try a different search or filter — deleted records stay recoverable for ${retentionDays} days.`
                : `Deleted mocks, tasks, custom exams, and groups appear here and stay recoverable for ${retentionDays} days.`
            }
            action={
              hasActiveFilters
                ? {
                    label: "Clear filters",
                    icon: <PlainIcon name="refresh" size={14} />,
                    onAction: resetFilters,
                  }
                : undefined
            }
          />
        </TrashPanel>
      )}

      {/* ── Record Detail Sheet ── */}
      <TrashDetailSheet
        kind={detail?.kind ?? null}
        id={detail?.id ?? ""}
        busy={busy}
        onClose={() => setDetail(null)}
        onRestore={() => {
          if (!detail) return;
          restoreMut.mutate([detail], { onSettled: () => setDetail(null) });
        }}
        onPurge={() => {
          if (!detail) return;
          const matchingRow = items.find(
            (r) => r.kind === detail.kind && r.id === detail.id,
          );
          setConfirm({
            mode: "purge",
            items: [detail],
            ungrouped:
              detail.kind === "group" ? (matchingRow?.affected ?? 0) : 0,
          });
        }}
      />

      {/* ── Permanent Delete / Empty Trash Confirmation Dialog ── */}
      <Dialog
        open={!!confirm}
        onOpenChange={(open) => {
          if (!open && !busy) setConfirm(null);
        }}
        title={
          confirm?.mode === "empty"
            ? "Empty entire Trash?"
            : "Delete permanently?"
        }
        size="sm"
        description={
          confirm?.mode === "empty"
            ? "Every record currently in Trash will be erased immediately. Export a backup first if you might need any of them."
            : "Selected records will be erased immediately instead of waiting for their expiration date."
        }
        footer={({ close }) => (
          <>
            <Button variant="outline" size="sm" disabled={busy} onClick={close}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={busy}
              className="gap-2"
              onClick={() => {
                if (!confirm) return;
                if (confirm.mode === "empty") emptyMut.mutate();
                else purgeMut.mutate(confirm.items);
              }}
            >
              <PlainIcon name="trash" size={14} tone="current" />
              <span>
                {busy
                  ? "Deleting…"
                  : confirm?.mode === "empty"
                    ? "Empty Trash"
                    : "Delete permanently"}
              </span>
            </Button>
          </>
        )}
      >
        {confirm && (
          <div className="overflow-hidden rounded-xl border border-border/80 bg-accent/40 shadow-2xs">
            {/* Summary target row */}
            <div className="flex items-center gap-2.5 p-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-xl border border-border bg-background text-foreground shadow-2xs">
                <PlainIcon
                  name={
                    singleConfirmItem
                      ? kindIconName(singleConfirmItem.kind)
                      : "trash"
                  }
                  size={15}
                  tone="primary"
                />
              </span>

              <div className="grid min-w-0 flex-1 text-left">
                <span className="truncate text-[12px] font-semibold leading-tight text-foreground">
                  {confirm.mode === "empty"
                    ? `All ${confirm.count} item${confirm.count === 1 ? "" : "s"} in Trash`
                    : singleConfirmItem
                      ? singleConfirmItem.title
                      : `${confirm.items.length} selected record${confirm.items.length === 1 ? "" : "s"}`}
                </span>
                <span className="mt-0.5 truncate text-[11px] leading-tight text-muted-foreground">
                  {confirm.mode === "empty"
                    ? "Mocks, tasks, custom exams, and groups"
                    : singleConfirmItem
                      ? TRASH_KIND_META[singleConfirmItem.kind].label
                      : "Permanent removal from workspace"}
                </span>
              </div>

              <span className="shrink-0 rounded-md bg-warning/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-tight text-warning">
                Irreversible
              </span>
            </div>

            {/* Ungrouped tasks warning when purging task groups */}
            {confirm.mode === "purge" && confirm.ungrouped > 0 && (
              <>
                <div className="h-px w-full bg-border/70" aria-hidden="true" />
                <div className="flex items-center gap-2 bg-warning/10 px-2.5 py-2 text-[11px] font-medium text-warning">
                  <PlainIcon name="layers" size={14} tone="current" />
                  <span className="min-w-0 flex-1">
                    {confirm.ungrouped} live task
                    {confirm.ungrouped === 1 ? "" : "s"} will become ungrouped
                    (tasks themselves are kept).
                  </span>
                </div>
              </>
            )}

            {/* Hairline divider + permanent reassurance strip */}
            <div className="h-px w-full bg-border/70" aria-hidden="true" />
            <div className="flex items-center gap-2 bg-background/50 px-2.5 py-2 text-[11px] text-muted-foreground">
              <PlainIcon name="clock" size={14} tone="muted" />
              <span className="truncate">
                This action is immediate and cannot be undone.
              </span>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

function messageOf(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : "Try again in a moment.";
}
