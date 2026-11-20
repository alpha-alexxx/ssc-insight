import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { prefetchInto } from "@/lib/rsc/prefetch";
import { requireUser } from "@/lib/auth/require-user";
import { getPlanPayload, listPersonalTasks } from "@/lib/plan/progress";
import { istTodayIso } from "@/lib/plan/view-model";
import { planKeys } from "@/lib/queries/plan";
import { todoTasksQueryOptions } from "@/lib/queries/todos";
import { MyTasksRoute } from "./_tasks/my-tasks-route";

export const dynamic = "force-dynamic";

/**
 * `/my-tasks` — the personal task workspace.
 *
 * Personal tasks and the plan are separate stores, so both are prefetched: the
 * board renders the tasks, and the plan rail shows what the schedule expects.
 */
export default async function MyTasksPage() {
  const { id: userId } = await requireUser();
  const queryClient = getQueryClient();

  await prefetchInto(queryClient, [
    {
      key: todoTasksQueryOptions.queryKey,
      load: () => listPersonalTasks(userId),
    },
    {
      key: planKeys.current(),
      load: async () => ({
        ...(await getPlanPayload(userId)),
        today: istTodayIso(),
      }),
    },
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MyTasksRoute />
    </HydrationBoundary>
  );
}
