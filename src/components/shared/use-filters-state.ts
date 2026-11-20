"use client";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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
  const [filters, setFilters] = useState<Filters>({});
  const [scope, setScope] = useState<DashboardScope>("full");
  const [page, setPage] = useState(1);
  const [comparePage, setComparePage] = useState(1);
  const [pageSize, setPageSizeState] = useState<PageSize>(10);
  const [sortState, setSortState] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "date",
    dir: "desc",
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
  useEffect(() => {
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
