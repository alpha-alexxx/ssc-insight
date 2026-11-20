"use client";
import type { UseQueryResult } from "@tanstack/react-query";
import type { Attempt } from "@/lib/domain";

/**
 * Compare-selection helpers.
 *
 * `useAttemptPage` and `useAttemptsByIds` used to live here too; both lost their
 * last caller when /history and /compare became their own routes (each now reads
 * its own query directly). They were deleted rather than kept "just in case",
 * because a hook with no callers reads as load-bearing architecture to the next
 * person and invites a future reader to wire it back up instead of using the
 * route-local query.
 */

/** Resolved attempts for the selection, in selection order (404s from deleted
 * attempts drop out). A selection can come from any surface, so each id is
 * hydrated independently and a missing one must not break the comparison. */
export function collectSelectedAttempts(
  results: UseQueryResult<Attempt, Error>[],
): Attempt[] {
  return results
    .map((result) => result.data)
    .filter((attempt): attempt is Attempt => !!attempt);
}
