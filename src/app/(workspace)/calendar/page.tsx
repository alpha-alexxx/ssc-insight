import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { prefetchInto } from "@/lib/rsc/prefetch";
import { requireUser } from "@/lib/auth/require-user";
import { loadExamContext } from "@/lib/exam-settings";
import { listAttempts } from "@/lib/repository";
import { getPlanPayload, listPersonalTasks } from "@/lib/plan/progress";
import { istTodayIso } from "@/lib/plan/view-model";
import { attemptKeys } from "@/lib/queries/attempts";
import { planKeys } from "@/lib/queries/plan";
import { todoTasksQueryOptions } from "@/lib/queries/todos";
import { CalendarRoute } from "./_calendar/calendar-route";

export const dynamic = "force-dynamic";

/**
 * `/calendar` — the unified ledger, served as a Server Component.
 *
 * All three layers are prefetched: the plan (assignments and day revision), the
 * personal dated tasks, and the logged attempts the calendar places by IST
 * completion date. The derived per-date index is then built client-side from
 * one payload, exactly as before.
 */
export default async function CalendarPage() {
  const { id: userId } = await requireUser();
  const ctx = await loadExamContext(userId);
  const queryClient = getQueryClient();

  await prefetchInto(queryClient, [
    {
      key: planKeys.current(),
      load: async () => ({
        ...(await getPlanPayload(userId)),
        today: istTodayIso(),
      }),
    },
    {
      key: todoTasksQueryOptions.queryKey,
      load: () => listPersonalTasks(userId),
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
      <CalendarRoute />
    </HydrationBoundary>
  );
}
