import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { prefetchInto } from "@/lib/rsc/prefetch";
import { requireUser } from "@/lib/auth/require-user";
import { listRecentAiUsage } from "@/lib/ai/usage";
import { aiKeys } from "@/lib/queries/ai";
import { AskRoute } from "./_ask/ask-route";

export const dynamic = "force-dynamic";

/**
 * `/ask` — the full-page chat with the study coach.
 *
 * The conversation itself is client state (the provider mounted in the
 * workspace layout owns it, so the sheet and this page share one transcript).
 * The usage ledger — the "what did the AI do" history — is the one server-read
 * resource here; it prefetches into the same cache key the rail's query uses,
 * so first paint carries real rows without a second fetch. Status stays with
 * the client query: it is already deduplicated across every surface. The
 * account's first name rides down for the empty-state greeting.
 */
export default async function AskPage() {
  const { id: userId, name } = await requireUser();
  const queryClient = getQueryClient();

  await prefetchInto(queryClient, [
    {
      key: aiKeys.usage(),
      load: async () => ({ entries: await listRecentAiUsage(userId, 30) }),
    },
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AskRoute firstName={name ? name.split(/\s+/)[0] : undefined} />
    </HydrationBoundary>
  );
}
