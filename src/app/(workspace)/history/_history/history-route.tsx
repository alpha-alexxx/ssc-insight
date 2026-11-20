"use client";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUiStore } from "@/stores/ui-store";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { PlainIcon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { ScopeFilters } from "@/components/scope-filters";
import { useFiltersState } from "@/components/shared/use-filters-state";
import { useAnalyticsData } from "@/components/shared/use-analytics-data";
import { attemptListQueryOptions } from "@/lib/queries/attempts";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { HistoryPanel } from "./history-panel";

/**
 * Client shell for `/history`: paged record list, its filter row, and the
 * header. The list query is seeded by the page's server prefetch under the same
 * key, so the first paint contains the first page.
 */
export function HistoryRoute() {
  const router = useRouter();
  const s = useFiltersState();
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
  const { page, setPage } = s;
  useEffect(() => {
    // `s` is a fresh object every render, so the fields that matter are pulled
    // out above and listed individually; depending on `s` would re-run this on
    // every keystroke.
    if (list.data && page > list.data.pageCount) setPage(list.data.pageCount);
  }, [list.data, page, setPage]);

  const platforms = useMemo(
    () => [...new Set(allAttempts.map((a) => a.platform))].sort(),
    [allAttempts],
  );

  return (
    <div className="mx-auto w-full max-w-[1560px]">
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
        onOpen={(attempt) => useUiStore.getState().openAttempt(attempt.id)}
        onAdd={() => router.push("/add")}
        // A comparison is a place: send the record to /compare with its id
        // selected, and let that page own its own selection state.
        onCompare={(attempt) => router.push(`/compare?ids=${attempt.id}`)}
        accountTotal={allAttempts.length}
      />

    </div>
  );
}

