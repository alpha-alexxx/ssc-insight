import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { prefetchInto } from "@/lib/rsc/prefetch";
import { requireUser } from "@/lib/auth/require-user";
import { loadTrashPage } from "@/lib/services/trash";
import { trashKeys, trashListParams } from "@/lib/queries/trash";
import { PageHeader } from "@/components/page-header";
import { TrashView } from "./_trash/trash-view";

export const dynamic = "force-dynamic";

/**
 * `/trash` — recoverable records, served as a Server Component.
 *
 * Prefetches the first page with the exact key `TrashView` reads, so the list
 * is in the HTML rather than arriving after hydration. The query parameters
 * survive a shared link because they are parsed here with the same normalizer
 * the client uses (`trashListParams`), which strips defaults so both sides
 * produce a byte-identical cache key.
 */
export default async function TrashPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id: userId } = await requireUser();
  const params = await searchParams;

  // A repeated query key arrives as an array; take the first value, matching
  // how the rest of the app treats duplicates.
  const flat = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );

  const listParams = trashListParams({
    kind: flat.kind ?? "all",
    q: flat.q ?? "",
    status: flat.status ?? "all",
    sort: flat.sort ?? "recent",
    page: Number(flat.page ?? 1) || 1,
  });

  const queryClient = getQueryClient();
  await prefetchInto(queryClient, [
    {
      key: trashKeys.list(listParams),
      load: () => loadTrashPage(userId, listParams),
    },
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageHeader
        title="Trash"
        description="Deleted mocks, tasks, custom exams and groups stay recoverable here for 15 days."
      />
      <TrashView />
    </HydrationBoundary>
  );
}
