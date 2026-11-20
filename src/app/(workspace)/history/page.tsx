import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { prefetchInto, safely } from "@/lib/rsc/prefetch";
import { requireUser } from "@/lib/auth/require-user";
import { loadExamContext } from "@/lib/exam-settings";
import {
  attemptFiltersFrom,
  clientFiltersFrom,
  loadAttemptPage,
  loadScopedAttemptsOrNull,
  parseAttemptListQuery,
} from "@/lib/services/attempts";
import { attemptKeys } from "@/lib/queries/attempts";
import { HistoryRoute } from "./_history/history-route";

export const dynamic = "force-dynamic";

/**
 * `/history` — the server-paged record list, served as a Server Component.
 *
 * The page and the client hook derive their request the same way: the query
 * string is parsed by the shared `parseAttemptListQuery`, the search term is
 * gated by the same two-character rule, and the paging defaults match. That is
 * what makes the prefetch land on the key `HistoryRoute` actually reads.
 */
export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id: userId } = await requireUser();
  const params = await searchParams;

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first != null) search.set(key, first);
  }

  // Guarded: an unreachable database must degrade the page, not 500 it.
  const ctx = await safely(() => loadExamContext(userId));
  const list = parseAttemptListQuery(Object.fromEntries(search.entries()));
  const filters = attemptFiltersFrom(list, ctx);

  // Mirror the client's search gate: one character is too broad to fetch.
  const rawSearch = filters.search ?? "";
  const gated = {
    ...filters,
    search: rawSearch.length >= 2 ? rawSearch : "",
  };
  // The KEY must be built from the filters the client can express (no injected
  // examId/tier), or it never matches the hook's key and the payload is dropped.
  const keyFilters = {
    ...clientFiltersFrom(list),
    search: rawSearch.length >= 2 ? rawSearch : "",
  };

  const paging = {
    filters: keyFilters,
    page: list.page ?? 1,
    pageSize: list.pageSize ?? 10,
    sort: list.sort ?? "date",
    dir: list.dir ?? "desc",
    withStats: true,
  } as const;

  const queryClient = getQueryClient();
  await prefetchInto(queryClient, [
    {
      key: attemptKeys.list(paging),
      load: () =>
        loadAttemptPage(userId, gated, {
          page: paging.page,
          pageSize: paging.pageSize,
          sort: paging.sort,
          dir: paging.dir,
          withStats: true,
        }),
    },
    {
      // The filter row's platform list and the account total.
      key: attemptKeys.full(),
      load: async () =>
        (await loadScopedAttemptsOrNull(userId, ctx)) ?? undefined,
    },
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HistoryRoute />
    </HydrationBoundary>
  );
}
