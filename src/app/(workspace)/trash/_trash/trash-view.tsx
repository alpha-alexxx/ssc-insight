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
const rowKey = (item: { kind: TrashKind; id: string }) => `${item.kind}:${item.id}`;
const toItemRef = (item: TrashItem) => ({ kind: item.kind, id: item.id });

/** Trash card — the MIGRATION.md Card pattern composed from tokens. */
function TrashPanel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-card text-card-foreground shadow-[inset_0_0_0_1px_var(--border)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 sm:p-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
            <PlainIcon name="trash" size={18} tone="primary" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            {description && (
              <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>
      <div className="p-4 pt-3 sm:p-6 sm:pt-3">{children}</div>
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
    () => (initialQuery.get("sort") as "recent" | "expiring" | null) ?? "recent",
  );
  const [page, setPage] = useState(() => Number(initialQuery.get("page") ?? 1) || 1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<{ kind: TrashKind; id: string } | null>(
    null,
  );
  const [confirm, setConfirm] = useState<
    | { mode: "purge"; items: { kind: TrashKind; id: string }[]; ungrouped: number }
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
      toast.error("Could not delete permanently", { description: messageOf(error) }),
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

  const pageCount = Math.max(1, Math.ceil((data?.total ?? 0) / (data?.limit || 50)));
  const busy = restoreMut.isPending || purgeMut.isPending || emptyMut.isPending;

  /** The live tasks that lose their grouping when the chosen groups go. */
  const ungroupedOf = (rows: TrashItem[]) =>
    rows
      .filter((row) => row.kind === "group")
      .reduce((sum, row) => sum + (row.affected ?? 0), 0);

  const columns = useMemo<DataTableColumn<TrashItem>[]>(() => [
    {
      key: "title",
      header: "Record",
      card: "title",
      value: (row) => row.title,
      cell: (row) => (
        <span className="flex min-w-0 flex-col items-start gap-0.5">
          <button
            type="button"
            onClick={() => setDetail({ kind: row.kind, id: row.id })}
            className="block max-w-full truncate text-left text-[13px] font-medium text-foreground hover:text-primary"
            aria-label={`View details of ${row.title}`}
          >
            {row.title}
          </button>
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-muted-foreground">
            <Badge size="sm" tone="neutral">{TRASH_KIND_META[row.kind].label}</Badge>
            {row.subtitle ? <span className="truncate">{row.subtitle}</span> : null}
            {row.context ? (
              <span>
                {row.kind === "task" ? "due" : "mock date"}{" "}
                {shortDate(row.context)}
              </span>
            ) : null}
          </span>
        </span>
      ),
    },
    {
      key: "deletedAt",
      header: "Deleted",
      align: "right",
      card: "subtitle",
      value: (row) => row.deletedAt,
      cell: (row) => (
        <span className="text-[12px] text-muted-foreground">
          {shortDate(row.deletedAt)}
        </span>
      ),
    },
    {
      key: "daysLeft",
      header: "Left",
      align: "right",
      card: "trailing",
      value: (row) => row.daysLeft,
      cell: (row) => {
        const expiringSoon = row.daysLeft <= TRASH_EXPIRING_DAYS;
        return (
          <span
            className={cn(
              "text-[12px] tabular-nums",
              expiringSoon ? "text-warning" : "text-muted-foreground",
            )}
            title={`Expires ${longDate(row.expiresAt)}`}
          >
            {row.daysLeft} day{row.daysLeft === 1 ? "" : "s"}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "",
      card: "hidden",
      width: "40px",
      cell: (row) => (
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
              onSelect: () => purgeItems([toItemRef(row)], row.affected ?? 0),
            },
          ]}
        />
      ),
    },
  ], [busy, restoreMut, purgeItems]);

  return (
    <div className="min-w-0">
      <div className="mb-4 flex flex-wrap items-start gap-3 rounded-[14px] border border-border bg-muted px-4 py-3">
        <PlainIcon name="clock" size={14} tone="muted" className="mt-0.5 shrink-0" />
        <p className="min-w-0 flex-1 text-xs leading-relaxed text-muted-foreground">
          Deleted records stay here for{" "}
          {data?.retentionDays ?? TRASH_RETENTION_DAYS} days, then are
          permanently and automatically removed. You can restore anything before
          that date, or delete it now.
        </p>
      </div>

      {/* Filter bar — type is a segmented control (with live counts), the rest are
          plain controls so the row stays one line from phone to desktop. */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SegmentedControl
          label="Filter by type"
          size="sm"
          value={kind}
          onValueChange={(option) => {
            setKind(option as KindFilter);
            setPage(1);
          }}
          options={(["all", ...TRASH_KIND_ORDER] as KindFilter[]).map((option) => ({
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
          }))}
        />
        <SearchInput
          className="min-w-0 grow sm:grow-0 sm:w-56"
          size="sm"
          shortcut={null}
          placeholder="Search deleted records…"
          value={search}
          onValueChange={(next) => {
            setSearch(next);
            setPage(1);
          }}
        />
        <div className="flex items-center gap-1.5">
          <span className="sr-only text-xs text-muted-foreground sm:not-sr-only">Show</span>
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
        <div className="flex items-center gap-1.5">
          <span className="sr-only text-xs text-muted-foreground sm:not-sr-only">Sort</span>
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

      {list.isError ? (
        <TrashPanel
          title="Deleted records"
          description="Could not load Trash."
        >
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
        <TrashPanel
          title="Deleted records"
          description="Loading…"
        >
          <div className="space-y-2" role="status" aria-label="Loading Trash">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} shape="block" height={56} />
            ))}
          </div>
        </TrashPanel>
      ) : items.length ? (
        <TrashPanel
          title="Deleted records"
          description={`${data.total} item${data.total === 1 ? "" : "s"} recoverable`}
          action={
            <Button
              size="sm"
              variant="outline"
              disabled={busy || !allCount}
              icon={<PlainIcon name="trash" size={13} />}
              onClick={() => setConfirm({ mode: "empty", count: allCount })}
            >
              Empty Trash
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
              className="mt-3 border-t border-border pt-3"
              page={page}
              pageCount={pageCount}
              onPageChange={setPage}
            />
          )}
        </TrashPanel>
      ) : (
        <TrashPanel
          title="Deleted records"
          description={`0 items recoverable`}
        >
          <EmptyState
            scene={search || kind !== "all" ? "search" : "done"}
            title={search || kind !== "all" ? "Nothing matches here." : "Nothing is waiting here."}
            description={
              search || kind !== "all"
                ? "Try a different search or filter — deleted records stay recoverable for 15 days."
                : `Deleted mocks, tasks, custom exams and groups appear in this list and stay recoverable for ${data.retentionDays} days.`
            }
          />
        </TrashPanel>
      )}

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
          setConfirm({ mode: "purge", items: [detail], ungrouped: 0 });
        }}
      />

      <Dialog
        open={!!confirm}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
        title={confirm?.mode === "empty" ? "Empty Trash?" : "Delete permanently?"}
        size="sm"
        description={
          confirm?.mode === "empty"
            ? `This removes all ${confirm.count} deleted item${confirm.count === 1 ? "" : "s"} for good. There is no way back from here — export a backup first if you might want any of them.`
            : `This removes ${confirm?.items.length ?? 0} record${(confirm?.items.length ?? 0) === 1 ? "" : "s"} for good. It cannot be undone.`
        }
        footer={
          <>
            <Button variant="outline" disabled={busy} onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={busy}
              onClick={() => {
                if (!confirm) return;
                if (confirm.mode === "empty") emptyMut.mutate();
                else purgeMut.mutate(confirm.items);
              }}
            >
              {confirm?.mode === "empty" ? "Empty Trash" : "Delete permanently"}
            </Button>
          </>
        }
      >
        {confirm?.mode === "purge" && confirm.ungrouped > 0 ? (
          <p>
            {confirm.ungrouped} task{confirm.ungrouped === 1 ? "" : "s"} will
            become ungrouped.
          </p>
        ) : null}
      </Dialog>
    </div>
  );
}

function messageOf(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : "Try again in a moment.";
}
