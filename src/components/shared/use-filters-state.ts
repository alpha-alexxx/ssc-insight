"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  mirrorsWorkspaceState,
  parseWorkspaceState,
  serializeWorkspaceState,
  type WorkspaceListState,
} from "@/lib/filters-url";
import type { DashboardScope, Filters, PageSize, SortKey } from "@/lib/domain";

/**
 * Persisted-record filters, the dashboard scope, and list paging for ONE route.
 *
 * Extracted from the old workspace shell (which owned this for every view at
 * once) so each route page can own its own filter state. The contract that must
 * survive the move:
 *
 * - State is mirrored to the address bar with `history.replaceState`, never
 *   `router.push`. Typing a search term must perform **no** RSC round trip;
 *   shared links still restore the view, and Back changes routes, not filters.
 * - Any filter change resets paging, because the result set moved and a stale
 *   page number can point past the end.
 * - On mount the hook reads the URL once, so a deep link like
 *   `/history?search=algebra&page=3` opens on that state.
 */

export type FiltersState = {
  filters: Filters;
  scope: DashboardScope;
  page: number;
  comparePage: number;
  pageSize: PageSize;
  sort: SortKey;
  dir: "asc" | "desc";
  setScope: (scope: DashboardScope) => void;
  updateFilters: (updater: (prev: Filters) => Filters) => void;
  changeFilter: (key: keyof Filters, value: string) => void;
  setPage: (page: number) => void;
  setComparePage: (page: number) => void;
  setPageSize: (size: PageSize) => void;
  changeSort: (key: SortKey) => void;
  /** Restore "everything": the action a filtered-empty state advertises. */
  clearFilters: () => void;
};

export function useFiltersState(): FiltersState {
  const pathname = usePathname();
  // Seed from the URL SYNCHRONOUSLY, not in an effect. A first render with
  // default filters builds a different TanStack key than the one the server
  // prefetched, so the hydrated payload is ignored and the route refetches what
  // it already had. `useSearchParams` is the same source the mirror below writes
  // to, and is populated on the server render and the client's first render
  // alike, so key and prefetch agree on paint one.
  const searchParams = useSearchParams();
  const initial = useMemo(
    () => parseWorkspaceState(`?${searchParams.toString()}`),
    // Re-seeding on every param change is unnecessary (the mirror keeps the URL
    // in step); the mount value is what the first render needs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [filters, setFilters] = useState<Filters>(initial.filters);
  const [scope, setScope] = useState<DashboardScope>(initial.scope);
  const [page, setPage] = useState(initial.list.page);
  const [comparePage, setComparePage] = useState(initial.list.page);
  const [pageSize, setPageSizeState] = useState<PageSize>(initial.list.pageSize);
  const [sortState, setSortState] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: initial.list.sort,
    dir: initial.list.dir,
  });
  const sort = sortState.key;
  const dir = sortState.dir;

  const updateFilters = useCallback((updater: (prev: Filters) => Filters) => {
    setFilters(updater);
    setPage(1);
    setComparePage(1);
  }, []);

  const changeFilter = useCallback(
    (key: keyof Filters, value: string) => {
      updateFilters((f) => ({ ...f, [key]: value }));
    },
    [updateFilters],
  );

  const clearFilters = useCallback(() => {
    updateFilters(() => ({ type: "all" }));
  }, [updateFilters]);

  /** Same key flips direction; a new key starts asc for text columns, desc otherwise. */
  const changeSort = useCallback((key: SortKey) => {
    setPage(1);
    setSortState((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : {
            key,
            dir: key === "name" || key === "type" || key === "platform" ? "asc" : "desc",
          },
    );
  }, []);

  const setPageSize = useCallback((size: PageSize) => {
    setPageSizeState(size);
    setPage(1);
    setComparePage(1);
  }, []);

  // Restore shareable URL state on entry. Synchronous setState is the point:
  // this is a sync with an external system (the address bar), and it must land
  // before the debounced query reads `filters`.
  const [urlReady, setUrlReady] = useState(false);
  const firstPathname = useRef(pathname);
  useEffect(() => {
    // The mount case is already seeded above; only a genuine route change (the
    // layout keeps this component alive across navigations) re-reads the URL.
    if (firstPathname.current === pathname) {
      setUrlReady(true);
      return;
    }
    firstPathname.current = pathname;
    const state = parseWorkspaceState(window.location.search);
    /* eslint-disable react-hooks/set-state-in-effect */
    setFilters(state.filters);
    setScope(state.scope);
    if (pathname === "/compare") {
      setComparePage(state.list.page);
      setPageSizeState(state.list.pageSize);
    } else {
      setPage(state.list.page);
      setPageSizeState(state.list.pageSize);
      setSortState({ key: state.list.sort, dir: state.list.dir });
    }
    setUrlReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [pathname]);

  // Keep the address bar in step. replaceState (not a router navigation) so
  // typing never triggers RSC round-trips or spams history.
  useEffect(() => {
    if (!urlReady) return;
    // Planner and Add routes carry their own query context (`date`, `task`,
    // `returnTo`); rewriting them with the filter mirror would strip it.
    if (!mirrorsWorkspaceState(pathname)) return;
    const list: WorkspaceListState = {
      page: pathname === "/compare" ? comparePage : page,
      pageSize,
      sort,
      dir,
    };
    const url = serializeWorkspaceState(pathname, {
      filters,
      scope: pathname === "/dashboard" ? "all" : scope,
      list,
    });
    if (window.location.pathname + window.location.search !== url)
      window.history.replaceState(null, "", url);
  }, [pathname, filters, scope, urlReady, page, comparePage, pageSize, sort, dir]);

  return {
    filters,
    scope,
    page,
    comparePage,
    pageSize,
    sort,
    dir,
    setScope,
    updateFilters,
    changeFilter,
    setPage,
    setComparePage,
    setPageSize,
    changeSort,
    clearFilters,
  };
}
