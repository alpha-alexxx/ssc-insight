import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { prefetchInto } from "@/lib/rsc/prefetch";
import { requireUser } from "@/lib/auth/require-user";
import { loadExamContext } from "@/lib/exam-settings";
import { listAttempts } from "@/lib/repository";
import { loadAnalytics, parseScope } from "@/lib/services/analytics";
import {
  analyticsKeys,
  serializeAnalyticsParams,
} from "@/lib/queries/analytics";
import { allAttemptsQueryOptions } from "@/lib/queries/attempts";
import { filtersFrom } from "@/lib/repository";
import { PerformanceRoute } from "./_performance/performance-route";

export const dynamic = "force-dynamic";

/**
 * `/performance` — the analytical workspace, served as a Server Component.
 *
 * The analytical scope lives in the URL (`?view=`), so a shared link restores
 * the same charts. The prefetch key is built by `serializeAnalyticsParams` —
 * the very function the client hook uses — which is what makes the hydrated
 * payload land in the key `useAnalyticsData` reads instead of a parallel one.
 */
export default async function PerformancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id: userId } = await requireUser();
  const params = await searchParams;
  const view = Array.isArray(params.view) ? params.view[0] : params.view;
  const scope = parseScope(view ?? "all");

  // Rebuild the filter object the client would send, from the same URL the
  // browser is on, so key and request agree.
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      if (value[0] != null) search.set(key, value[0]);
    } else if (value != null) {
      search.set(key, value);
    }
  }
  const filters = filtersFrom(`?${search.toString()}`);

  const queryClient = getQueryClient();
  const ctx = await loadExamContext(userId);
  const analyticsParams = serializeAnalyticsParams(scope, filters);

  await prefetchInto(queryClient, [
    {
      key: analyticsKeys.request(analyticsParams),
      load: () => loadAnalytics(userId, scope, filters, ctx),
    },
    {
      key: allAttemptsQueryOptions.queryKey,
      // The filter row's platform list comes from the account's own attempts.
      load: () =>
        listAttempts(userId, {
          examId: ctx.activeExamId,
          tier: ctx.activeTierId,
          type: "all",
          subject: "all",
        }),
    },
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PerformanceRoute />
    </HydrationBoundary>
  );
}
