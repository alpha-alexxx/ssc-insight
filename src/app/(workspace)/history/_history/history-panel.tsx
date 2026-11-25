"use client";
import { memo, useMemo, useState } from "react";
import { PlainIcon } from "@/components/icon";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { Spinner } from "@/components/spinner";
import { SegmentedControl } from "@/components/segmented-control";
import { Panel } from "@/components/dashboard-panels";
import {
  DataTable,
  type DataTableColumn,
  type DataTableSort,
} from "@/components/data-table";
import { AttemptPagination } from "@/components/attempt-pagination";
import { AttemptCard, AttemptCardSkeleton } from "@/components/attempt-card";
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
import { mockTypeLabel, shortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/empty-state";

/**
 * Mock history — a server-paged record list you can actually search.
 *
 * What changed in this revision:
 *
 *  · The default view is a responsive grid of `AttemptCard`s — one fully
 *    composed card per result (identity, score meter, per-subject bars,
 *    vitals, actions). The old narrow-container fallback of `DataTable` drew
 *    a stack of half-empty rows; the card now owns that job properly.
 *  · The dense table is still here as an explicit second view for desktop
 *    widths (sortable headers drive the server sort). It is hidden below `md`
 *    where a nine-column table can only scroll sideways.
 *  · Sorting is reachable from the card view too, through a sort picker and a
 *    direction toggle that call the same `onSort` the table headers do.
 *  · The refresh indicator lives in the panel header instead of a separate row
 *    above it, so a filter change no longer shoves the content down.
 *
 * Kept from the previous version: the empty state distinguishes "nothing saved
 * yet" (`accountTotal`) from "nothing matches these filters", and each KPI
 * carries its own honest reference rather than one shared arrow.
 */

type HistoryView = "cards" | "table";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "date", label: "Attempt date" },
  { value: "score", label: "Score" },
  { value: "accuracy", label: "Accuracy" },
  { value: "percentile", label: "Percentile" },
  { value: "time", label: "Time taken" },
  { value: "name", label: "Mock name" },
  { value: "platform", label: "Platform" },
  { value: "type", label: "Type" },
];

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
  /** Sends one result to the compare page. */
  onCompare: (attempt: Attempt) => void;
  /** Every saved result in the account, ignoring filters. Distinguishes
   * "nothing saved" from "nothing matches". */
  accountTotal: number;
}) {
  const items = data?.items ?? [];
  const firstLoad = data === undefined && !error;
  const stats = data?.stats;
  const [view, setView] = useState<HistoryView>("cards");
  const refreshing = isFetching && !firstLoad;

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
        cell: (a) => (
          <span className="flex items-center gap-2.5" title={`Open ${a.name}`}>
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
        card: "subtitle",
        value: (a) => a.completedAt,
        cell: (a) => (
          <span className="text-[12px] tabular-nums text-muted-foreground">
            {shortDate(a.completedAt)}
          </span>
        ),
      },
      {
        key: "score",
        header: "Score",
        sortable: true,
        card: "trailing",
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
                  {" "}
                  / {t.maxScore}
                </span>
              </span>
              <span className="mt-1 block h-1 w-24 overflow-hidden rounded-full bg-muted">
                <span
                  className={cn("block h-full rounded-full", scoreBarTone(pct))}
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
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
              aria-label={`Compare ${a.name}`}
              onClick={() => onCompare(a)}
            >
              <PlainIcon name="compare" size={14} />
            </button>
            <button
              type="button"
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
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

  const controlledSort: DataTableSort = { key: sort.key, dir: sort.dir };
  const total = data?.total ?? 0;

  const toolbar = (
    <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
      <Input
        value={search}
        onValueChange={onSearch}
        aria-label="Search mocks"
        placeholder="Search mocks…  /"
        leading={<PlainIcon name="search" size={14} tone="muted" />}
        clearable
        className="w-full sm:w-60"
        onKeyDown={(e) => {
          if (e.key === "Escape" && search) {
            e.stopPropagation();
            onSearch("");
          }
        }}
      />
      <div className="flex min-w-0 items-center gap-2">
        {view === "cards" && (
          <>
            <Select
              label="Sort results by"
              hideLabel
              size="sm"
              className="min-w-0 flex-1 sm:w-40 sm:flex-none"
              value={sort.key}
              onValueChange={(value) => {
                if (value !== sort.key) onSort(value as SortKey);
              }}
              options={SORT_OPTIONS.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
            />
            <button
              type="button"
              onClick={() => onSort(sort.key)}
              aria-label={`Sorted ${sort.dir === "asc" ? "ascending" : "descending"}. Reverse the order`}
              title={sort.dir === "asc" ? "Ascending" : "Descending"}
              className="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)] outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <PlainIcon
                name="arrowRight"
                size={13}
                className={cn(
                  "transition-transform duration-200",
                  sort.dir === "asc" ? "-rotate-90" : "rotate-90",
                )}
              />
            </button>
          </>
        )}
        {/* The dense table is a desktop affordance; below md there is only the card view. */}
        <span className="ml-auto hidden md:block">
          <SegmentedControl
            label="Result layout"
            size="sm"
            value={view}
            onValueChange={(value) => setView(value as HistoryView)}
            options={[
              { value: "cards", label: "Cards" },
              { value: "table", label: "Table" },
            ]}
          />
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-w-0">
      {stats && <HistoryStats stats={stats} />}

      <Panel
        icon="history"
        title="Mock history"
        description={
          error
            ? "Could not load your results."
            : `${n(total)} result${total === 1 ? "" : "s"} · sorted by ${sortLabel(sort.key)}`
        }
        action={toolbar}
      >
        <div className="relative">
          {refreshing && (
            <p
              role="status"
              aria-live="polite"
              className="absolute right-4 top-0 z-10 inline-flex items-center gap-1.5 rounded-full bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)] sm:right-6"
            >
              <Spinner size="xs" label="Updating your results" />
              Updating…
            </p>
          )}

          {search.length === 1 && (
            <p className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground sm:px-6">
              Keep typing — search starts at two characters.
            </p>
          )}

          {error ? (
            <EmptyState
              scene="offline"
              title="Your results could not be loaded."
              description={
                error.message || "Check your connection, then try again."
              }
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
            <div
              className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,19rem),1fr))] gap-3 px-4 pb-4 sm:px-6"
              role="status"
              aria-label="Loading results"
            >
              <span className="sr-only">Loading results</span>
              {Array.from({ length: 6 }, (_, i) => (
                <AttemptCardSkeleton key={i} />
              ))}
            </div>
          ) : items.length ? (
            <div
              className={cn(
                "px-4 pb-4 transition-opacity duration-150 motion-reduce:transition-none sm:px-6",
                refreshing && "opacity-60",
              )}
            >
              {view === "cards" ? (
                <ul
                  aria-label="Saved mock results"
                  className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,19rem),1fr))] gap-3"
                >
                  {items.map((attempt) => (
                    <li key={attempt.id} className="flex min-w-0">
                      <AttemptCard
                        attempt={attempt}
                        onOpen={onOpen}
                        onCompare={onCompare}
                        className="w-full"
                      />
                    </li>
                  ))}
                </ul>
              ) : (
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
                  viewMode="table"
                />
              )}
            </div>
          ) : accountTotal > 0 ? (
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
        </div>

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
 * an average, and a change is shown as a change.
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
