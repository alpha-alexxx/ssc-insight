import type { QueryClient, QueryKey } from "@tanstack/react-query";

/**
 * Seed the TanStack cache from a Server Component before it renders.
 *
 * The whole point is that a page's first paint contains real data. Each route
 * page calls this with the query keys its client hooks already use, then
 * dehydrates the client into a `HydrationBoundary`; the hooks find their data
 * and skip their first fetch.
 *
 * Three rules, each of which is a real failure mode:
 *
 * 1. **Never throw.** A page whose database read fails must still render, so
 *    the client query can show the normal error banner. `allSettled` is what
 *    makes a data outage a degraded page instead of a 500.
 * 2. **Never cache a failure.** A rejected load writes nothing at all, so the
 *    hook sees a cold key and performs its own first fetch. Writing an error
 *    state here would make the failure permanent for the request.
 * 3. **Never write `undefined`.** A key holding `undefined` looks hydrated but
 *    renders as empty forever; skipping it keeps the hook in charge.
 *
 * Loaders call the service layer directly (`src/lib/services/*`), never HTTP,
 * so a prefetch neither needs a session cookie on a loopback request nor
 * consumes the caller's rate-limit budget.
 */
export async function prefetchInto(
  queryClient: QueryClient,
  entries: { key: QueryKey; load: () => Promise<unknown> }[],
): Promise<void> {
  if (entries.length === 0) return;
  // `Promise.resolve().then(...)` wraps each loader so a SYNCHRONOUS throw is
  // converted into a rejection. Without it, `entries.map((e) => e.load())` runs
  // every loader eagerly and one sync throw escapes before allSettled runs,
  // rejecting the page and discarding every sibling's payload too.
  const results = await Promise.allSettled(
    entries.map((entry) => Promise.resolve().then(entry.load)),
  );
  results.forEach((result, index) => {
    if (result.status !== "fulfilled") return;
    if (result.value === undefined) return;
    queryClient.setQueryData(entries[index].key, result.value);
  });
}

/**
 * Load a scope-dependent resource for a page, tolerating a failed exam context.
 *
 * `loadExamContext` is the first database read every workspace page makes, and
 * it throws when the database is unreachable. Called before `prefetchInto`, that
 * throw would turn a data outage into a 500 page — the exact failure
 * `prefetchInto` exists to prevent. This wrapper makes the scope optional so a
 * page can still render, and the client query then surfaces the normal error
 * banner.
 */
export async function safely<T>(load: () => Promise<T>): Promise<T | null> {
  try {
    return await load();
  } catch {
    return null;
  }
}
