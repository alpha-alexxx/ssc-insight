import "server-only";
import { listTrash } from "@/lib/trash";
import { trashQuerySchema } from "@/lib/trash-core";

/**
 * Read services — the one implementation behind both an API route and its
 * Server Component page.
 *
 * Why this layer exists: a route page cannot call its own `/api/*` handler
 * without a loopback request that carries the session cookie, needs an absolute
 * URL, and would consume the caller's rate-limit budget. Calling the same
 * *service* from both places is the only way the two paths cannot drift on
 * scope, ownership, or the trash filter.
 *
 * Route handlers keep their job: parse the request, call the service, wrap the
 * result in the `{ data }` envelope and cache headers.
 */

export type TrashQueryInput = {
  kind?: string | undefined;
  q?: string | undefined;
  status?: string | undefined;
  sort?: string | undefined;
  page?: string | number | undefined;
  limit?: string | number | undefined;
};

/** One page of recoverable records, always scoped to the verified owner. */
export function loadTrashPage(userId: string, query: TrashQueryInput) {
  // The schema is the single validation contract: defaults, bounds and the
  // kind/status enums all come from trash-core.
  const parsed = trashQuerySchema.parse(query);
  return listTrash(userId, parsed);
}
