import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { prefetchInto } from "@/lib/rsc/prefetch";
import { requireUser } from "@/lib/auth/require-user";
import { loadExamContext } from "@/lib/exam-settings";
import { getAttempt, listAttempts } from "@/lib/repository";
import { attemptDetailQueryOptions, attemptKeys } from "@/lib/queries/attempts";
import { AddRoute } from "./_add/add-route";

export const dynamic = "force-dynamic";

/**
 * `/add` — the mock entry form.
 *
 * When `?id=` is present the attempt is prefetched so the form opens filled in;
 * the known-attempts list powers duplicate detection. `/add` deliberately does
 * not mirror filter state to the URL, because it owns its own query context
 * (`date`, `name`, `returnTo`).
 */
export default async function AddPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id: userId } = await requireUser();
  const params = await searchParams;
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const ctx = await loadExamContext(userId);
  const queryClient = getQueryClient();

  await prefetchInto(queryClient, [
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
    ...(id
      ? [
          {
            key: attemptDetailQueryOptions(id).queryKey,
            load: () => getAttempt(userId, id),
          },
        ]
      : []),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AddRoute />
    </HydrationBoundary>
  );
}
