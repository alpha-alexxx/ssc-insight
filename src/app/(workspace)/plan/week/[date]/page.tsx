import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { prefetchInto } from "@/lib/rsc/prefetch";
import { requireUser } from "@/lib/auth/require-user";
import { getPlanPayload } from "@/lib/plan/progress";
import { istTodayIso } from "@/lib/plan/view-model";
import { isIsoDate } from "@/lib/format";
import { planKeys } from "@/lib/queries/plan";
import { PlanWeekRoute } from "./_plan-week/plan-week-route";

export const dynamic = "force-dynamic";

/** `/plan/week/[date]` — the seven-day schedule around the named date. */
export default async function PlanWeekPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!isIsoDate(date)) notFound();

  const { id: userId } = await requireUser();
  const queryClient = getQueryClient();
  await prefetchInto(queryClient, [
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
      <PlanWeekRoute date={date} />
    </HydrationBoundary>
  );
}
