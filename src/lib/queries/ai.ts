import { queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { AiStatus } from "@/lib/ai/client-types";
import type { AiActivityEntry } from "@/lib/ai/usage";

/**
 * AI domain keys. The status probe and the activity ledger are cacheable
 * server resources — chat and coach are streaming conversations whose state
 * stays in use-ai-workspace (a stream is not a query cache entry).
 */

export const aiKeys = {
  all: ["ai"] as const,
  status: () => [...aiKeys.all, "status"] as const,
  usage: () => [...aiKeys.all, "usage"] as const,
};

export const aiStatusQueryOptions = queryOptions({
  queryKey: aiKeys.status(),
  // Status changes when the user edits AI settings or the quota flips; both
  // paths invalidate explicitly, so reads stay cheap and deduplicated.
  staleTime: 60_000,
  queryFn: ({ signal }) => api<AiStatus>("/api/ai/status", { signal }),
});

export type AiUsageResponse = { entries: AiActivityEntry[] };

export const aiUsageQueryOptions = queryOptions({
  queryKey: aiKeys.usage(),
  // The ledger moves on every AI call; the rail refreshes on quota events.
  staleTime: 30_000,
  queryFn: ({ signal }) => api<AiUsageResponse>("/api/ai/usage", { signal }),
});
