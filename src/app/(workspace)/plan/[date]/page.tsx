import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { prefetchInto, safely } from "@/lib/rsc/prefetch";
import { requireUser } from "@/lib/auth/require-user";
import { loadScopedAttemptsOrNull } from "@/lib/services/attempts";
import { loadExamContext } from "@/lib/exam-settings";
import { getPlanPayload } from "@/lib/plan/progress";
import { istTodayIso } from "@/lib/plan/view-model";
import { isIsoDate } from "@/lib/format";
import { attemptKeys } from "@/lib/queries/attempts";
import { planKeys } from "@/lib/queries/plan";
import { todoKeys, todoTasksQueryOptions } from "@/lib/queries/todos";
import { listPersonalTasks } from "@/lib/plan/progress";
import { PlanDayRoute } from "./_plan/plan-day-route";

export const dynamic = "force-dynamic";

/**
 * `/plan/[date]` — the daily study workspace.
 *
 * An unparseable date segment renders the route's `not-found.tsx` rather than
 * redirecting: the URL is shareable, so the visitor must see that this exact
 * address has no day behind it.
 *
 * The segment is already decoded by Next. Decoding it again throws on a stray
 * `%` and used to take the whole view down, so the check is a plain shape test.
 */
export default async function PlanDayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!isIsoDate(date)) notFound();

  const { id: userId } = await requireUser();
  // Guarded: an unreachable database must degrade the page, not 500 it.
  const ctx = await safely(() => loadExamContext(userId));
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
      load: async () =>
        (await loadScopedAttemptsOrNull(userId, ctx)) ?? undefined,
    },
  ]);
  void todoKeys;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PlanDayRoute date={date} />
    </HydrationBoundary>
  );
}
