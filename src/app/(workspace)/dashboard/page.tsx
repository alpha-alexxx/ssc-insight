import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { prefetchInto } from "@/lib/rsc/prefetch";
import { requireUser } from "@/lib/auth/require-user";
import { listAttempts } from "@/lib/repository";
import { getPlanPayload } from "@/lib/plan/progress";
import { istTodayIso } from "@/lib/plan/view-model";
import { loadAnalytics } from "@/lib/services/analytics";
import { loadExamContext } from "@/lib/exam-settings";
import {
  analyticsKeys,
  serializeAnalyticsParams,
} from "@/lib/queries/analytics";
import { attemptKeys } from "@/lib/queries/attempts";
import { planKeys } from "@/lib/queries/plan";
import { DashboardRoute } from "./_dashboard/dashboard-route";

export const dynamic = "force-dynamic";

/**
 * `/dashboard` — the daily workspace, served as a Server Component.
 *
 * Prefetches the three resources the first screen needs: the merged plan (so
 * "Today's Plan" is populated in the HTML), the `all` analytics projection, and
 * the unfiltered attempt list the outcome cards are joined against. Keys come
 * from the same factories the client hooks import.
 */
export default async function DashboardPage() {
  const { id: userId } = await requireUser();
  const ctx = await loadExamContext(userId);
  const queryClient = getQueryClient();

  // The dashboard always reads the combined scope with no record filters.
  const params = serializeAnalyticsParams("all", {});

  await prefetchInto(queryClient, [
    {
      key: planKeys.current(),
      load: async () => ({
        ...(await getPlanPayload(userId)),
        today: istTodayIso(),
      }),
    },
    {
      key: analyticsKeys.request(params),
      load: () => loadAnalytics(userId, "all", {}, ctx),
    },
    {
      key: attemptKeys.full(),
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
      <DashboardRoute />
    </HydrationBoundary>
  );
}
