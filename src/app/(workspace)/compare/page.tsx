import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { prefetchInto } from "@/lib/rsc/prefetch";
import { requireUser } from "@/lib/auth/require-user";
import { loadExamContext } from "@/lib/exam-settings";
import { getAttempt } from "@/lib/repository";
import {
  attemptFiltersFrom,
  loadAttemptPage,
  parseAttemptListQuery,
} from "@/lib/services/attempts";
import { attemptKeys, attemptDetailQueryOptions } from "@/lib/queries/attempts";
import { CompareRoute } from "./_compare/compare-route";

export const dynamic = "force-dynamic";

/**
 * `/compare` — the picker plus the comparison ledger, served as a Server
 * Component.
 *
 * Both halves are prefetched: the picker page (always date-descending, with KPI
 * aggregates for the "filtered average" line) and every attempt named in
 * `?ids=`, hydrated per record. That second prefetch is what makes a shared
 * comparison link render its four columns in the first paint instead of
 * resolving them one request at a time after hydration.
 */
export default async function ComparePage({
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

  const ctx = await loadExamContext(userId);
  const list = parseAttemptListQuery(Object.fromEntries(search.entries()));
  const filters = attemptFiltersFrom(list, ctx);
  const rawSearch = filters.search ?? "";
  const gated = {
    ...filters,
    search: rawSearch.length >= 2 ? rawSearch : "",
  };
  const paging = {
    filters: gated,
    page: list.page ?? 1,
    pageSize: list.pageSize ?? 10,
    sort: "date" as const,
    dir: "desc" as const,
    withStats: true,
  };

  // The selection is the page's content; cap it exactly as the client does.
  const ids = (search.get("ids") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 4);

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
    ...ids.map((id) => ({
      key: attemptDetailQueryOptions(id).queryKey,
      load: () => getAttempt(userId, id),
    })),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CompareRoute />
    </HydrationBoundary>
  );
}
