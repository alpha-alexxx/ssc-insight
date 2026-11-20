"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { PlainIcon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { ScopeFilters } from "@/components/scope-filters";
import { useFiltersState } from "@/components/shared/use-filters-state";
import { useAnalyticsData } from "@/components/shared/use-analytics-data";
import { attemptListQueryOptions } from "@/lib/queries/attempts";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Attempt } from "@/lib/domain";
import { MockDetailDialog } from "@/components/mock-detail-dialog";
import { deleteAttemptRequest } from "@/lib/queries/attempts";
import { HistoryPanel } from "./history-panel";

/**
 * Client shell for `/history`: paged record list, its filter row, and the
 * header. The list query is seeded by the page's server prefetch under the same
 * key, so the first paint contains the first page.
 */
export function HistoryRoute() {
  const router = useRouter();
  const s = useFiltersState();
  // The detail dialog is route-local: opening a record is a property of this
  // page, not of the workspace chrome.
  const [detail, setDetail] = useState<Attempt | null>(null);
  const { allAttempts } = useAnalyticsData({
    scope: "full",
    filters: s.filters,
    // Analytics is not rendered here; the attempt list carries its own KPIs.
    enabled: false,
  });

  // The unified 350ms search debounce: a one-character query is too broad to
  // fetch, so it holds until the second character (or clears).
  const debouncedSearch = useDebouncedValue(s.filters.search ?? "", 350);
  const gated = useMemo(
    () => ({
      ...s.filters,
      search: debouncedSearch.length >= 2 ? debouncedSearch : "",
    }),
    [s.filters, debouncedSearch],
  );

  const list = useQuery(
    attemptListQueryOptions({
      filters: gated,
      page: s.page,
      pageSize: s.pageSize,
      sort: s.sort,
      dir: s.dir,
      withStats: true,
    }),
  );

  // A filter/sort/page-size change can leave the page past the end of the new
  // result set; clamp once the server answers.
  useEffect(() => {
    if (list.data && s.page > list.data.pageCount) s.setPage(list.data.pageCount);
  }, [list.data, s.page, s.setPage]);

  const platforms = useMemo(
    () => [...new Set(allAttempts.map((a) => a.platform))].sort(),
    [allAttempts],
  );

  return (
    <div className="mx-auto w-full max-w-[1560px] px-3 py-4 sm:px-5 md:py-5">
      <PageHeader
        title="Mock history"
        description="Every saved result with its actual attempt date, score, and details."
        actions={
          <Button size="sm" onClick={() => router.push("/add")}>
            <PlainIcon name="plus" size={14} /> Add mock
          </Button>
        }
      />
      <div className="mb-4">
        <ScopeFilters
          mode="type"
          scope={s.scope}
          setScope={s.setScope}
          filters={s.filters}
          setFilters={s.updateFilters}
          changeFilter={s.changeFilter}
          platforms={platforms}
        />
      </div>
      {list.isFetching && (
        <p role="status" className="mb-3 flex items-center gap-2 text-xs text-muted">
          <PlainIcon name="refresh" size={12} className="animate-spin" /> Updating
          your results…
        </p>
      )}
      <HistoryPanel
        data={list.data}
        isFetching={list.isFetching}
        error={list.isError ? list.error : null}
        onRetry={() => {
          s.clearFilters();
          void list.refetch();
        }}
        sort={{ key: s.sort, dir: s.dir }}
        onSort={s.changeSort}
        onPageChange={s.setPage}
        onPageSizeChange={s.setPageSize}
        search={s.filters.search ?? ""}
        onSearch={(value) => s.changeFilter("search", value)}
        onOpen={setDetail}
        onAdd={() => router.push("/add")}
        // A comparison is a place: send the record to /compare with its id
        // selected, and let that page own its own selection state.
        onCompare={(attempt) => router.push(`/compare?ids=${attempt.id}`)}
        accountTotal={allAttempts.length}
      />
      <MockDetailDialog
        attempt={detail}
        onClose={() => setDetail(null)}
        onEdit={(attempt) => router.push(`/add?id=${attempt.id}`)}
        onCompare={(attempt) => router.push(`/compare?ids=${attempt.id}`)}
        onDelete={() => void deleteAttempt(detail, setDetail, router)}
        busy={false}
      />
    </div>
  );
}

/** Delete one saved record (soft delete: it moves to Trash). */
async function deleteAttempt(
  attempt: Attempt | null,
  done: (value: Attempt | null) => void,
  router: ReturnType<typeof useRouter>,
) {
  if (!attempt) return;
  try {
    await deleteAttemptRequest(attempt.id);
    done(null);
    router.refresh();
  } catch {
    // The dialog stays open; the user can retry.
  }
}
