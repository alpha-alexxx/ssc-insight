import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { prefetchInto, safely } from "@/lib/rsc/prefetch";
import { requireUser } from "@/lib/auth/require-user";
import { loadScopedAttemptsOrNull } from "@/lib/services/attempts";
import { loadExamContext } from "@/lib/exam-settings";
import { loadAnalytics, parseScope } from "@/lib/services/analytics";
import {
  analyticsKeys,
  serializeAnalyticsParams,
} from "@/lib/queries/analytics";
import { allAttemptsQueryOptions } from "@/lib/queries/attempts";
import { filtersSchema } from "@/lib/domain";
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

  // Rebuild the filter object the client would send, from the same parameters
  // the browser is on, so the prefetch key and the client's request agree.
  // Built as a plain object: `filtersFrom` expects an absolute URL, and a
  // relative "?…" is not one.
  const flat: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first != null) flat[key] = first;
  }
  const filters = filtersSchema.parse(flat);

  const queryClient = getQueryClient();
  // Guarded: an unreachable database must degrade the page, not 500 it.
  const ctx = await safely(() => loadExamContext(userId));
  const analyticsParams = serializeAnalyticsParams(scope, filters);

  await prefetchInto(queryClient, [
    {
      key: analyticsKeys.request(analyticsParams),
      load: () => loadAnalytics(userId, scope, filters, ctx),
    },
    {
      key: allAttemptsQueryOptions.queryKey,
      // The filter row's platform list comes from the account's own attempts.
      load: async () =>
        (await loadScopedAttemptsOrNull(userId, ctx)) ?? undefined,
    },
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PerformanceRoute />
    </HydrationBoundary>
  );
}
