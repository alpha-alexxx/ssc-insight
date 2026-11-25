"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueries, useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { PlainIcon } from "@/components/icon";
import { Button } from "@/components/button";
import { ScopeFilters } from "@/components/scope-filters";
import { useExamScope } from "@/components/exam-context";
import { useFiltersState } from "@/components/shared/use-filters-state";
import { useAnalyticsData } from "@/components/shared/use-analytics-data";
import {
  attemptDetailQueryOptions,
  attemptListQueryOptions,
} from "@/lib/queries/attempts";
import { collectSelectedAttempts } from "@/components/use-attempt-list";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { CompareView, type CompareReference } from "./compare-view";

const MAX_COMPARE = 4;

/**
 * Client shell for `/compare`.
 *
 * The selection is the page's content, not a filter: it is mirrored to `?ids=`
 * (max four) so a comparison survives a reload and can be shared, and the ids
 * are hydrated per record rather than assumed to be on the picker page — a
 * selection made in History must still resolve here.
 */
export function CompareRoute() {
  const router = useRouter();
  const params = useSearchParams();
  const examScope = useExamScope();
  const s = useFiltersState();

  // Seed from the URL so a shared /compare?ids=… opens with its selection.
  const [selected, setSelected] = useState<string[]>(() => {
    const raw = params.get("ids") ?? "";
    return raw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, MAX_COMPARE);
  });

  // Keep the address bar in step. replaceState, not a navigation: selecting a
  // record must not re-render the server tree. `params` is a dependency so a
  // fresh deep link re-syncs; the guard below stops a rewrite loop.
  useEffect(() => {
    const next = new URLSearchParams(window.location.search);
    if (selected.length) next.set("ids", selected.join(","));
    else next.delete("ids");
    const query = next.toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ""}`;
    if (window.location.pathname + window.location.search !== url)
      window.history.replaceState(null, "", url);
  }, [selected, params]);

  const debouncedSearch = useDebouncedValue(s.filters.search ?? "", 350);
  const gated = useMemo(
    () => ({
      ...s.filters,
      search: debouncedSearch.length >= 2 ? debouncedSearch : "",
    }),
    [s.filters, debouncedSearch],
  );

  // The picker list is always date-descending; sort/dir have no UI here.
  const list = useQuery(
    attemptListQueryOptions({
      filters: gated,
      page: s.comparePage,
      pageSize: s.pageSize,
      sort: "date",
      dir: "desc",
      withStats: true,
    }),
  );

  // Hydrate each selected id: a selection can come from anywhere.
  // `useQueries` (not a map of useQuery) is the only correct way to run a
  // variable number of parallel queries — a per-id hook call in a loop breaks
  // the rules of hooks the moment the selection length changes.
  const details = useQueries({
    queries: selected.map((id) => ({
      ...attemptDetailQueryOptions(id),
      enabled: !!id,
    })),
  });
  const compared = collectSelectedAttempts(details);

  const { allAttempts } = useAnalyticsData({
    scope: "full",
    filters: s.filters,
    enabled: false,
  });

  const reference = useMemo<CompareReference>(
    () => ({
      targetFor: (attempt) => {
        const target = examScope.targetForTier(
          `${attempt.examId}:${attempt.tierId}`,
        );
        if (!target?.marks) return null;
        return { marks: target.marks, maxScore: target.maxScore };
      },
      averagePercentage: list.data?.stats?.avgScorePct ?? null,
      averageCount: list.data?.stats?.totalMocks ?? null,
    }),
    [list.data?.stats, examScope],
  );

  const toggle = useCallback((id: string) => {
    setSelected((ids) =>
      ids.includes(id)
        ? ids.filter((x) => x !== id)
        : ids.length < MAX_COMPARE
          ? [...ids, id]
          : ids,
    );
  }, []);

  const platforms = useMemo(
    () => [...new Set(allAttempts.map((a) => a.platform))].sort(),
    [allAttempts],
  );

  return (
    <div className="mx-auto w-full max-w-[1560px]">
      <PageHeader
        title="Compare mocks"
        description="Put up to four results side by side and find the difference behind the scores."
        actions={
          <Button size="sm" onClick={() => router.push("/add")}>
            <PlainIcon name="plus" size={14} /> Add mock
          </Button>
        }
      />
      <div className="mb-4 rounded-2xl bg-card px-3.5 py-3 shadow-[inset_0_0_0_1px_var(--border)] sm:px-5">
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
      <CompareView
        data={list.data}
        isFetching={list.isFetching}
        error={list.isError ? list.error : null}
        onRetry={() => void list.refetch()}
        onPageChange={s.setComparePage}
        onPageSizeChange={s.setPageSize}
        compared={compared}
        selected={selected}
        onToggle={toggle}
        onClear={() => setSelected([])}
        reference={reference}
      />
    </div>
  );
}
