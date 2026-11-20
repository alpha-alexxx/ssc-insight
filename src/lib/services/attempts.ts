import "server-only";
import {
  attemptListSchema,
  filtersSchema,
  type Filters,
} from "@/lib/domain";
import {
  LIST_ATTEMPTS_MAX,
  listAttempts,
  listAttemptsPaged,
  type ListAttemptsPagedParams,
} from "@/lib/repository";
import { loadExamContext } from "@/lib/exam-settings";

/**
 * Attempt reads, shared by the `/api/mock-attempts` handler and the /history,
 * /compare, /calendar, /dashboard and /plan pages.
 *
 * The rules that must hold on every path:
 * - Attempts are always scoped to the user's active tier. The switcher decides
 *   the scope, and the combined "all" view leaves the tier open.
 * - A request without `page` is the unpaged full list the calendar, plan and
 *   dashboard lookups depend on; `page` opts into the paged envelope.
 * - Every read goes through the repository's `attemptWhere`, so the trash
 *   filter (`deletedAt: null`) applies everywhere at once.
 */

export type AttemptQueryInput = Record<string, string | undefined>;

/** Filters for one request, derived from the parsed query plus the live scope. */
/**
 * Filters for one request. A null `ctx` means the scope could not be resolved
 * right now (database unreachable); the exam/tier are then left unset, which
 * matches the pre-existing behaviour for a scope-less read and lets the page
 * render while the client query reports the real failure.
 */
export function attemptFiltersFrom(
  list: ReturnType<typeof attemptListSchema.parse>,
  ctx: Awaited<ReturnType<typeof loadExamContext>> | null,
): Filters {
  return {
    examId: ctx?.activeExamId,
    type: list.type,
    subject: list.subject,
    platform: list.platform,
    from: list.from,
    to: list.to,
    search: list.search,
    // attemptWhere skips "all", so the combined view stays unfiltered.
    tier: list.tier ?? ctx?.activeTierId,
  };
}

/**
 * The filters the CLIENT can express — i.e. the ones `filtersSchema` allows.
 *
 * `attemptFiltersFrom` additionally injects the server-resolved `examId` and
 * `tier`. Those must never enter a prefetch key: the client hook builds its key
 * from `useFiltersState()`'s filters, which cannot contain them, so a key
 * carrying them never matches and the dehydrated payload is silently discarded.
 * Key from this; load with the full filters.
 */
export function clientFiltersFrom(
  list: ReturnType<typeof attemptListSchema.parse>,
): Filters {
  return filtersSchema.parse({
    type: list.type,
    subject: list.subject,
    platform: list.platform,
    from: list.from,
    to: list.to,
    search: list.search,
    tier: list.tier,
  });
}

/** Parse a raw query object the way the API route does. */
export function parseAttemptListQuery(input: AttemptQueryInput) {
  return attemptListSchema.parse(input);
}

/**
 * The unpaged full list (bounded by LIST_ATTEMPTS_MAX), plus the truncation
 * flags the API surfaces as headers.
 */
export async function loadAttemptList(
  userId: string,
  filters: Filters,
): Promise<{ items: Awaited<ReturnType<typeof listAttempts>>; truncated: boolean }> {
  const items = await listAttempts(userId, filters);
  return { items, truncated: items.length >= LIST_ATTEMPTS_MAX };
}

/** One page of the history/compare list, optionally with KPI aggregates. */
export function loadAttemptPage(
  userId: string,
  filters: Filters,
  paging: ListAttemptsPagedParams,
) {
  return listAttemptsPaged(userId, filters, paging);
}

/**
 * The unfiltered attempt list for the active scope, or null when the scope
 * could not be resolved (database unreachable).
 *
 * A page prefetches this for its lookup list; returning null means "skip the
 * prefetch" instead of throwing, so the page still renders and the client query
 * reports the failure the way it always has.
 */
export async function loadScopedAttemptsOrNull(
  userId: string,
  ctx: Awaited<ReturnType<typeof loadExamContext>> | null,
) {
  if (!ctx) return null;
  return listAttempts(userId, {
    examId: ctx.activeExamId,
    tier: ctx.activeTierId,
    type: "all",
    subject: "all",
  });
}
