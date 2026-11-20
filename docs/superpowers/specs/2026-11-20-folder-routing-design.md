# Folder-Based Routing and Upstash Rate Limiting — Design

Status: approved 2026-11-20. Implements the architecture shift described in
`docs/superpowers/plans/2026-11-20-folder-routing.md`.

## Problem

Every workspace route has a file, but none of them renders anything. The
thirteen pages under `src/app/(workspace)/` are `return null` placeholders and
`(workspace)/layout.tsx` deliberately discards `children`:

```tsx
export default async function WorkspaceLayout({ children }) {
  void children;                       // the routed page is thrown away
  ...
  return <WorkspaceShell ... />;       // one client component renders every view
}
```

`WorkspaceShell` (1,248 lines) reads `usePathname()`, resolves it through
`viewForPathname()`, and switches between views in one `AnimatePresence` tree.
The consequences that motivate this shift:

1. **No route owns its rendering.** A route's URL, its loading state, its error
   state and its data requirements live in four different places.
2. **No loading or error surface exists.** There are zero `loading.tsx` and zero
   `error.tsx` files in the repository. A first load shows whatever the shell's
   client queries resolve to; a render error escapes to the single root
   `ErrorBoundary`.
3. **First paint is always empty.** Nothing is fetched on the server, so every
   cold load pays a client round trip before any real content appears.
4. **The shell is a de-facto global store.** Filters, compare selection, the
   edit target, dialogs, busy flags and the AI prefill all live in one
   component and are prop-drilled into memoized panels.
5. **Rate limiting cannot scale past one instance.** `src/lib/rate-limit.ts` is
   an in-process `Map` of token buckets. On Vercel each serverless instance has
   its own buckets, so the effective global limit is `limit × instances`.

## Goals

- Each route is a real Server Component that authenticates, loads its own data,
  and renders its own components from a folder beside it.
- Every workspace route has a skeleton loading UI, an error boundary, and — for
  dynamic routes — a not-found surface.
- Rate limiting becomes a two-layer system: in-memory L1 for burst absorption,
  Upstash Redis L2 for cross-instance authority, shaped to stay inside the
  free tier.
- No behavior change to the product. The `CLAUDE.md` invariants (analytical
  scopes, trash boundary, ownership, backup, planner, themes) all hold.

## Non-goals

- Server Actions. The `{ data }` / `{ error: { code, message } }` REST surface
  stays, and every route handler keeps authenticating independently.
- Cache Components. They stay disabled; personalized data stays
  `private, no-store`.
- Prisma schema or migration changes.
- Shared/CDN caching. `docs/caching.md`'s "no shared caching anywhere" rule
  stands.
- Component, browser or visual-regression tests. The project has none and this
  work does not add them.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Rendering model | Hybrid RSC-first with persistent providers | Route ownership without deleting the client data layer |
| Colocation | `<route>/_<segment>/` | Underscore is Next's private-folder convention; the segment name keeps the folder recognizable |
| Rate limiting | L1 in-memory + L2 Upstash, tiered costs | Reads cost zero Redis commands in the normal path |
| Migration | Incremental strangler | Every task ships; `tests/routes.test.ts` stays green throughout |
| Upstash credentials | Optional | Dev and CI run on L1 with no Redis |

## Architecture

### The layout keeps only what must survive navigation

```
(workspace)/layout.tsx          Server Component
  requireUser()                  → redirect on 401/503
  <PrivateWorkspace userId>      client session re-verification (unchanged)
    <QueryProvider>              TanStack cache, dies with the session
      <ExamScopeProvider>        /api/exams: scope + resolved targets
        <ToastProvider>
          <WorkspaceFrame>       client: sidebar, header, palette, AI sheet
            {children}           ← the routed page, for the first time
```

`WorkspaceFrame` owns exactly what the previous shell owned globally:

- `usePathname()` → `viewForPathname()` → `AppFrame` (sidebar + sticky header)
- `CommandPalette` + `useKeyboardShortcuts`
- `AiChatSheet` + `useAiWorkspace()` — the drawer must survive navigation and
  keep its streaming transcript, so its state cannot move into a route
- `MotionConfig reducedMotion="user"`, the skip link, and
  `ui-store`'s `plannerDate` bridge for the `/plan` bare-path redirect

The layout prefetches the two shell-lifetime resources once —
`examsQueryOptions` and `planQueryOptions` — so `ExamScopeProvider` starts
hydrated and five routes share one plan payload.

### Redistribution of the shell's local state

| State | New owner |
|---|---|
| `filters`, `scope`, `page`, `comparePage`, `pageSize`, `sort`, `dir` | `useFiltersState()` in `src/components/shared/` |
| compare `selected` ids | `/compare` route state, still mirrored to `?ids=` |
| `editing` attempt | `/add?id=<attemptId>` |
| `detail` dialog | per-route state + shared `AttemptDetailDialog` |
| `addPrefill` (AI draft) | `ui-store` one-shot nonce, like `quickAddNonce` |
| `busy` | per-route state |
| `plannerDate` | `ui-store` (unchanged) |
| AI coach/chat/drawer | `WorkspaceFrame` (unchanged owner) |

`useFiltersState` must keep the current contract exactly: state is mirrored
into the address bar with `history.replaceState`, never `router.push`, so
typing a search term performs **no** RSC round trip.

### Server prefetch contract

One module bridges services and the query cache:

```ts
// src/lib/rsc/prefetch.ts
export function prefetchInto(
  queryClient: QueryClient,
  entries: { key: QueryKey; load: () => Promise<unknown> }[],
): Promise<void>;
```

It runs `Promise.allSettled`, `setQueryData`s each success, and swallows every
failure. A failed prefetch degrades to the client fetching normally; it must
never turn a database blip into a 500 page.

Every page follows one shape:

```tsx
export default async function Page({ searchParams }) {
  const { id } = await requireUser();
  const queryClient = getQueryClient();
  await prefetchInto(queryClient, [{ key, load: () => service(id, …) }]);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RouteView />
    </HydrationBoundary>
  );
}
```

Two rules make this safe:

- **Keys come from `src/lib/queries/*`, never inline.** The prefetch key must be
  byte-identical to the key the client hook produces, or the payload is fetched
  twice and never used.
- **Loaders call services, not HTTP.** `src/lib/services/<resource>.ts` holds
  the logic both the page and the route handler use. This is the single most
  important part of the refactor: without it the RSC path and the API path drift
  and disagree about scope, ownership or trash filtering.

`requireUser` is wrapped in React `cache()` so the layout and the page share one
session lookup per request rather than performing two.

### Colocation rule

- `<route>/_<segment>/` holds components used by **exactly one** route.
- The moment a second route imports one, it moves to `src/components/shared/`.
- `src/components/` keeps only the genuinely cross-cutting set: `ui/*`,
  `icon`, `toast`, `theme-*`, `exam-context`, `query-provider`, `app-frame`,
  `workspace-frame`, `page-header`, `metric-strip`, `dashboard-panels`,
  `attempt-outcome-card`, `motion-swap`, `error-boundary`, `private-workspace`,
  `command-palette`, `ai-chat-sheet`, `ai-coach-card`, and `shared/`.
- Sibling routes that share material use a private folder at the common
  segment: `src/app/(workspace)/plan/_plan-shared/`.

`tests/colocation.test.ts` enforces this by importing-graph scan, because a
human review reliably misses it.

### Loading, error and not-found surfaces

- `loading.tsx` composes the route's **real geometry** from the existing
  `Skeleton`, `MetricStripSkeleton` and `WeekStripSkeleton`: same header, same
  column count, same chart heights. No spinner.
- `error.tsx` is a thin client file over `src/components/shared/route-error.tsx`.
  This Next version passes **`{ error, retry }`**; `retry()` re-fetches and
  re-renders the segment and is the documented choice. `reset()` exists but only
  re-renders without re-fetching, which would loop on a server data failure.
- `not-found.tsx` is only needed for the two dynamic plan routes, which call
  `notFound()` on an unparseable date segment.
- `src/app/global-error.tsx` covers root-layout failures and must render its own
  `<html>`/`<body>`.

**Known constraint, measured not assumed:** `loading.tsx` renders for the page
segment, but without Cache Components a dynamic layout blocks navigation until
the layout finishes. The workspace layout reads `cookies()`, so the skeleton
appears once the layout resolves. The first load is server-rendered data rather
than a skeleton; on client navigation the skeleton covers the page segment.
`experimental.staleTimes.dynamic = 30` lets a re-visit render instantly from
Next's client router cache. This is recorded in `docs/caching.md` rather than
claimed as a full instant-loading experience.

### Rate limiting

Three modules plus the existing bucket:

| File | Responsibility |
|---|---|
| `rate-limit-core.ts` | Pure policy. No `server-only`, no network. Unit-tested. |
| `rate-limit-budget.ts` | Per-instance daily Redis-command budget, IST-day rollover |
| `rate-limit-upstash.ts` | `server-only`. `Redis.fromEnv()` + `Ratelimit.slidingWindow`, 250 ms timeout, circuit breaker |
| `rate-limit.ts` | Keeps the token bucket + identity helpers; adds `consumeRateLimit(class, identity)` |

Decision table:

```
L1 allow + read             → allow.            Zero Redis commands.
L1 allow + write (cost 5)   → consult L2.       Registry mutation.
L1 allow + ai    (cost 25)  → consult L2.       Expensive generation.
L1 deny  + any              → consult L2.       L1 is per-instance and
                                                conservative; L2 arbitrates
                                                sustained abuse.
```

One weighted limiter per identity (`slidingWindow(300, "60 s")`) where the class
chooses the cost, plus an anonymous limiter for the public surface. A single
`EVAL` per consulted request; `ephemeralCache` short-circuits identities L2 has
already blocked, so a determined abuser does not cost one command per attempt.

**Budget.** Soft cap 8,000 commands/day, hard cap 9,500/day against a 10,000/day
provider allowance. At the soft cap reads and writes degrade to L1-only while
`ai` keeps L2 protection; at the hard cap everything runs L1-only. One
`console.warn` on the first crossing.

**Failure modes, stated explicitly:**

- No credentials → L1 only, one boot warning, headers still present.
- Redis error or timeout → L1 only for that request, counted by the breaker.
  After three consecutive failures the circuit opens for 60 s and all traffic
  runs L1-only. This is a deliberate refinement of "fail closed on writes": a
  Upstash outage must never stop a user saving a mock. Backpressure survives
  because L1's write bucket is still 20 per 30 s per instance.
- 429 responses keep the current body (`REQUEST_ERROR`) and the current header
  names, so `ApiError.retryAfterSeconds` and the query client's `retryDelay`
  keep working with no client change.

The four AI streaming routes bypass `defineRoute` and currently have **no** rate
limit at all; they gain an explicit `ai`-class limit. `AiUsage` remains the real
AI budget.

## Invariants that must not move

These are asserted by the existing 385-test suite and by `CLAUDE.md`; this
design changes no route, method, envelope, schema or ownership rule:

- Ownership is always the verified session user. No page reads a user id from
  `params` or `searchParams`.
- Every mock-attempt read carries `deletedAt: null` (the ESLint boundary holds).
- Analytical scopes never double-count; derived sections never inherit a parent
  override.
- Backup format, planner merge semantics and trash retention are untouched.
- `private, no-store` on personalized responses; no shared caching anywhere.

## Risk register

| Risk | Mitigation |
|---|---|
| Prefetch key drifts from client key | `tests/rsc-prefetch.test.ts` asserts key equality per route |
| A page forgets `requireUser()` | `tests/routes.test.ts` asserts it on every page |
| Route components leak across routes | `tests/colocation.test.ts` import scan |
| Server prefetch makes navigation slower | `staleTimes.dynamic`; prefetch is one round trip per route, not per widget |
| Upstash free tier exhausted | Command budget with degrade, not a hard stop |
| A Upstash outage blocks writes | Circuit breaker to L1-only |
| Design regression on desktop | `tools/shot.mjs` before/after at 1280 and 1440 px |
