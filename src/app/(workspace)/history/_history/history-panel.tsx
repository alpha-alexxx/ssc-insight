"use client";
import { memo, useMemo } from "react";
import { PlainIcon } from "@/components/icon";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Panel } from "@/components/dashboard-panels";
import { Skeleton } from "@/components/skeleton";
import { EmptyState } from "@/components/empty-state";
import {
  DataTable,
  type DataTableColumn,
  type DataTableSort,
} from "@/components/data-table";
import { AttemptPagination } from "@/components/attempt-pagination";
import { MetricBand, MetricCell } from "@/components/metric-strip";
import {
  accuracyTone,
  scoreBarTone,
  typeChip,
} from "@/components/attempt-display";
import {
  totals,
  formatNumber as n,
  formatTime,
  type Attempt,
  type AttemptStats,
  type PagedAttempts,
  type PageSize,
  type SortKey,
} from "@/lib/domain";
import { istTimeLabel, longDate, mockTypeLabel, shortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Mock history — a server-paged record list you can actually search.
 *
 * Two defects in the previous version are fixed structurally rather than
 * cosmetically:
 *
 *  1. The empty state keyed off the FILTERED total, so it was unreachable:
 *     a user with 200 mocks and a narrow filter was told to log their first
 *     one. It now distinguishes "nothing saved yet" (the returned
 *     `totalMocks` across the account) from "nothing matches these filters".
 *  2. The KPI "delta" slot rendered an absolute average under a green
 *     up-arrow. Each metric now carries its own honest reference.
 *
 * The table itself is Hairline's DataTable: sortable headers drive the
 * server sort (the page is server-owned), and a narrow container gets one
 * card per row instead of a nine-column scroll. The search field stays in
 * the panel header because the search is server-side too (two-character
 * gate, debounce, URL mirror) — DataTable's own search only filters the
 * rows in front of it.
 */

/** Memoized: the shell re-renders per chat token/keystroke; rows don't need to. */
export const HistoryPanel = memo(function HistoryPanel({
  data,
  isFetching,
  error,
  onRetry,
  sort,
  onSort,
  onPageChange,
  onPageSizeChange,
  search,
  onSearch,
  onOpen,
  onAdd,
  onCompare,
  accountTotal,
}: {
  /** The current server-paged page; undefined during first load. */
  data: PagedAttempts | undefined;
  isFetching: boolean;
  /** Present only when the list failed to load. */
  error?: Error | null;
  onRetry?: () => void;
  sort: { key: SortKey; dir: "asc" | "desc" };
  onSort: (key: SortKey) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: PageSize) => void;
  search: string;
  onSearch: (value: string) => void;
  onOpen: (attempt: Attempt) => void;
  onAdd: () => void;
  /** Adds one result to the compare selection. */
  onCompare: (attempt: Attempt) => void;
  /** Every saved result in the account, ignoring filters. Distinguishes
   * "nothing saved" from "nothing matches". */
  accountTotal: number;
}) {
  const items = data?.items ?? [];
  const firstLoad = data === undefined && !error;
  const stats = data?.stats;

  /* One column set for the whole table; the value functions give the
     server's sort keys their client-side ordering (already applied to the
     page by the server, so the local sort is a stable no-op). */
  const columns = useMemo<DataTableColumn<Attempt>[]>(
    () => [
      {
        key: "name",
        header: "Mock",
        width: "minmax(0,1.7fr)",
        card: "title",
        sortable: true,
        searchable: true,
        value: (a) => a.name,
        /* Not itself a button: the narrow card wraps the title cell in its
           own row control, and a button cannot nest in a button. The row's
           open action lives in the trailing actions column instead. */
        cell: (a) => (
          <span
            className="flex items-center gap-2.5"
            title={`Open ${a.name}`}
          >
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-[10px]",
                typeChip(a.type),
              )}
              aria-hidden="true"
            >
              <PlainIcon name="file" size={15} />
            </span>
            <span className="min-w-0">
              <span className="block max-w-56 truncate text-[13px] font-medium">
                {a.name}
              </span>
              <span className="mt-0.5 block text-[11px] text-muted-foreground">
                {mockTypeLabel(a.type)}
              </span>
            </span>
          </span>
        ),
      },
      {
        key: "type",
        header: "Type",
        sortable: true,
        searchable: true,
        card: "subtitle",
        value: (a) => a.type,
        cell: (a) => (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-medium",
              typeChip(a.type),
            )}
          >
            {mockTypeLabel(a.type)}
          </span>
        ),
      },
      {
        key: "platform",
        header: "Platform",
        sortable: true,
        searchable: true,
        card: "subtitle",
        value: (a) => a.platform,
        cell: (a) => (
          <span className="rounded-[8px] bg-muted px-2 py-1 text-[11px] text-muted-foreground">
            {a.platform}
          </span>
        ),
      },
      {
        key: "date",
        header: "Attempt date",
        sortable: true,
        searchable: true,
        card: "subtitle",
        value: (a) => a.completedAt,
        cell: (a) => (
          <span className="text-[12px] text-muted-foreground">
            <time
              dateTime={a.completedAt}
              title={longDate(a.completedAt)}
              className="block"
            >
              {shortDate(a.completedAt)}
            </time>
            <span className="block text-[10px]">
              {istTimeLabel(a.completedAt)}
            </span>
          </span>
        ),
      },
      {
        key: "score",
        header: "Score",
        sortable: true,
        card: "trailing",
        width: "minmax(5.5rem,0.9fr)",
        value: (a) => {
          const t = totals(a);
          return t.maxScore ? t.score / t.maxScore : 0;
        },
        cell: (a) => {
          const t = totals(a);
          const pct = t.maxScore ? (t.score / t.maxScore) * 100 : 0;
          return (
            <span className="inline-flex min-w-32 flex-col items-end">
              <span className="text-[13px] font-medium tabular-nums text-foreground">
                {n(t.score)}
                <span className="text-[11px] font-normal text-muted-foreground">
                  {" "}/ {t.maxScore}
                </span>
              </span>
              <span className="mt-1 block h-0.5 w-24 bg-muted">
                <span
                  className={cn("block h-full", scoreBarTone(pct))}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </span>
            </span>
          );
        },
      },
      {
        key: "accuracy",
        header: "Accuracy",
        sortable: true,
        card: "trailing",
        value: (a) => totals(a).accuracy ?? null,
        cell: (a) => {
          const t = totals(a);
          return (
            <span
              className={cn(
                "rounded-[8px] px-2 py-1 text-[12px] tabular-nums",
                accuracyTone(t.accuracy),
              )}
            >
              {t.accuracy == null ? "—" : `${n(t.accuracy)}%`}
            </span>
          );
        },
      },
      {
        key: "percentile",
        header: "Percentile",
        sortable: true,
        card: "hidden",
        value: (a) => a.percentile ?? null,
        cell: (a) => (
          <span className="text-[12px] tabular-nums text-muted-foreground">
            {a.percentile == null ? "—" : `${n(a.percentile)}%`}
          </span>
        ),
      },
      {
        key: "time",
        header: "Time",
        sortable: true,
        card: "hidden",
        value: (a) => totals(a).timeSeconds ?? null,
        cell: (a) => (
          <span className="text-[12px] tabular-nums text-muted-foreground">
            {formatTime(totals(a).timeSeconds)}
          </span>
        ),
      },
      {
        key: "actions",
        header: "",
        sortable: false,
        searchable: false,
        width: "6rem",
        card: "trailing",
        value: () => null,
        cell: (a) => (
          <span className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
              aria-label={`Add ${a.name} to the comparison`}
              onClick={() => onCompare(a)}
            >
              <PlainIcon name="compare" size={14} />
            </button>
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
              aria-label={`Open ${a.name}`}
              onClick={() => onOpen(a)}
            >
              <PlainIcon name="arrowRight" size={14} />
            </button>
          </span>
        ),
      },
    ],
    [onOpen, onCompare],
  );

  const controlledSort: DataTableSort | null = {
    key: sort.key,
    dir: sort.dir,
  };

  return (
    <div className="min-w-0">
      {stats && <HistoryStats stats={stats} />}

      <Panel
        icon="history"
        title="Mock history"
        description={
          error
            ? "Could not load your results."
            : `${n(data?.total ?? 0)} result${(data?.total ?? 0) === 1 ? "" : "s"} · sorted by ${sortLabel(sort.key)}`
        }
        action={
          <Input
            value={search}
            onValueChange={onSearch}
            aria-label="Search mocks"
            placeholder="Search mocks…  /"
            leading={<PlainIcon name="search" size={14} tone="muted" />}
            clearable
            className="w-full sm:w-56"
            onKeyDown={(e) => {
              if (e.key === "Escape" && search) {
                e.stopPropagation();
                onSearch("");
              }
            }}
          />
        }
      >
        {search.length === 1 && (
          <p className="border-b border-border px-4 py-2 text-[11px] text-muted-foreground">
            Keep typing — search starts at two characters.
          </p>
        )}

        {error ? (
          <EmptyState
            scene="offline"
            title="Your results could not be loaded."
            description={error.message || "Check your connection, then try again."}
            action={
              onRetry ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRetry}
                  icon={<PlainIcon name="refresh" size={13} />}
                >
                  Try again
                </Button>
              ) : undefined
            }
          />
        ) : firstLoad ? (
          <div className="space-y-2 p-4" role="status" aria-label="Loading results">
            <span className="sr-only">Loading results</span>
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} height={48} />
            ))}
          </div>
        ) : items.length ? (
          <div
            className={cn(
              "px-4 pb-4 transition-opacity sm:px-5",
              isFetching && !firstLoad && "opacity-60",
            )}
          >
            {/* Desktop: the full table; a narrow container gets one card per
                row instead of a nine-column horizontal scroll. */}
            <DataTable
              columns={columns}
              rows={items}
              getRowId={(a) => a.id}
              rowLabel={(a) => a.name}
              noun={["mock", "mocks"]}
              label="Saved mock results, sortable by column"
              searchable={false}
              selectable={false}
              sort={controlledSort}
              onSortChange={(next) => {
                // The direction is the pager's canonical rule, not the
                // table's local guess: same key flips, new key starts asc
                // for text and desc for numbers.
                if (next) onSort(next.key as SortKey);
              }}
              pageSize={data?.pageSize ?? 10}
            />
          </div>
        ) : accountTotal > 0 ? (
          // Filtered empty — the branch the old version could never reach.
          <EmptyState
            scene="search"
            title="No results match these filters."
            description={`You have ${n(accountTotal)} saved result${
              accountTotal === 1 ? "" : "s"
            }. Widen the platform, subject or date range — or clear the search — to see them.`}
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                icon={<PlainIcon name="refresh" size={13} />}
              >
                Reset filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            scene="inbox"
            title="Your next chapter starts with one mock."
            description="Add your first result to start building your track record."
            action={
              <Button
                size="sm"
                onClick={onAdd}
                icon={<PlainIcon name="plus" size={14} />}
              >
                Log your first mock
              </Button>
            }
          />
        )}

        {data && data.total > 0 && (
          <AttemptPagination
            page={data.page}
            pageCount={data.pageCount}
            total={data.total}
            pageSize={data.pageSize}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        )}
      </Panel>
    </div>
  );
});

function sortLabel(key: SortKey): string {
  const labels: Record<SortKey, string> = {
    name: "mock name",
    type: "type",
    platform: "platform",
    date: "attempt date",
    score: "score",
    accuracy: "accuracy",
    percentile: "percentile",
    time: "time taken",
  };
  return labels[key];
}

/**
 * The four KPI cells. Each states what it is: an absolute average is shown as
 * an average, and a change is shown as a change. The old strip put an average
 * percentage in a slot that always drew a green up-arrow.
 */
function HistoryStats({ stats }: { stats: AttemptStats }) {
  return (
    <MetricBand className="mb-4">
      <MetricCell
        icon="history"
        label="Total mocks"
        value={n(stats.totalMocks)}
        roll={{ value: stats.totalMocks }}
        hint={
          stats.newThisMonth
            ? `${stats.newThisMonth} added this month`
            : "None added this month"
        }
        pct={null}
      />
      <MetricCell
        icon="target"
        label="Average score"
        value={
          stats.avgScore != null
            ? n(Math.round(stats.avgScore * 100) / 100)
            : "—"
        }
        roll={
          stats.avgScore != null
            ? {
                value: Math.round(stats.avgScore * 100) / 100,
                format: { maximumFractionDigits: 1 },
                locales: "en-IN",
              }
            : null
        }
        hint={
          stats.avgScoreMax != null
            ? `out of ${stats.avgScoreMax} · ${n(stats.avgScorePct)}%`
            : stats.avgScorePct != null
              ? `${n(stats.avgScorePct)}% average across mixed papers`
              : "No scored results yet"
        }
        pct={stats.avgScorePct != null ? stats.avgScorePct / 100 : null}
      />
      <MetricCell
        icon="success"
        label="Average accuracy"
        value={stats.avgAccuracy != null ? `${n(stats.avgAccuracy)}%` : "—"}
        roll={
          stats.avgAccuracy != null
            ? {
                value: stats.avgAccuracy,
                suffix: "%",
                format: { maximumFractionDigits: 1 },
                locales: "en-IN",
              }
            : null
        }
        hint={
          stats.accuracyDelta != null
            ? `${stats.accuracyDelta >= 0 ? "+" : ""}${n(stats.accuracyDelta)} pp vs earlier`
            : "No earlier window to compare"
        }
        pct={stats.avgAccuracy != null ? stats.avgAccuracy / 100 : null}
      />
      <MetricCell
        icon="clock"
        label="Average time"
        value={stats.avgTime != null ? formatTime(stats.avgTime) : "—"}
        hint={
          stats.timeDelta != null
            ? `${stats.timeDelta > 0 ? "+" : ""}${Math.round(stats.timeDelta * 100)}% vs earlier`
            : "No earlier window to compare"
        }
        pct={null}
      />
    </MetricBand>
  );
}
