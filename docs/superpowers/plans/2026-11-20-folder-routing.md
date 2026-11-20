# Folder-Based Routing and Upstash Rate Limiting — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve every workspace route from its own Server Component with its own colocated components, loading skeleton and error boundary, and replace the single-process rate limiter with an in-memory + Upstash two-layer system.

**Architecture:** Hybrid RSC-first. The `(workspace)` layout keeps only the session guard and the providers that must survive navigation; each page authenticates, loads its own data through a shared service layer, seeds the TanStack cache under the same keys the client hooks use, and dehydrates. Charts, forms and chat stay client islands.

**Tech Stack:** Next.js 16.4.6 (App Router, webpack, Cache Components disabled), React 19, TanStack Query v5, Zustand, zod 4, `@upstash/ratelimit` + `@upstash/redis`, Prisma 7 + Neon, `node:test` + `tsx`.

**Spec:** `docs/superpowers/specs/2026-11-20-folder-routing-design.md`

## Global Constraints

- App Router server components by default; `"use client"` only at interaction boundaries.
- Cache Components are **not** enabled. No shared caching, no `revalidate` on personalized data.
- Every personalized response stays `private, no-store`. `docs/caching.md`'s SWR windows are unchanged.
- Ownership is always the session user from `requireUser()`. Never a `userId` from `params`/`searchParams`.
- Route handlers keep authenticating independently; the proxy keeps guarding pages only.
- `src/lib/routes.ts` stays the single source of view identity; `tests/routes.test.ts` stays its enforcement point.
- Follow `DESIGN.md` and the responsive token system in `globals.css`. No palette hexes in components.
- Node 22.20+; webpack, not Turbopack. `npm run typecheck && npm run lint && npm test` before any task is called done.
- Baseline measured at Task 0: typecheck clean, lint 0 errors / 9 pre-existing warnings, 385/385 tests pass.

## Baseline and environment facts (measured in Task 0)

- `node_modules` was absent in this worktree; `npm ci` installed 823 packages and generated the Prisma client.
- Next is **16.4.6**. `experimental.staleTimes` exists (`dist/docs/.../staleTimes.md`).
- **`error.tsx` receives `{ error, retry }`** in this version. `retry()` re-fetches and re-renders; `reset()` re-renders without re-fetching. Use `retry`.
- Without Cache Components, a dynamic layout that reads `cookies()` blocks navigation before `loading.tsx` renders.
- `src/lib/rate-limit-middleware.ts` has **zero callers** (verified by grep).
- The four AI streaming routes (`chat`, `coach`, `extract`, `status`) bypass `defineRoute` and have no rate limit.

## Review Focus

1. **A page that forgets `requireUser()`** — renders another account's data. Test: Task 2 asserts it on every `page.tsx`.
2. **Filter typing causing RSC round trips** — the documented no-tick-round-trip invariant. Test: Task 7 asserts `useFiltersState` never calls `router.push/replace`.
3. **Two routes importing one `_<segment>/` file** — colocation silently degrading. Test: Task 2 import-graph scan.
4. **Prefetch key ≠ client key** — double fetch or dead payload. Test: Task 7 asserts key equality per route.
5. **A header-contract change breaking `ApiError.retryAfterSeconds`** — 429s stop honouring `Retry-After`. Test: Task 5 asserts `X-RateLimit-*` and `Retry-After` on 200 and 429 with an unchanged body.

---

### Task 0: Toolchain and baseline

**Files:** none modified.

- [x] **Step 1: Install dependencies**
Run: `npm ci`
Expected: postinstall runs `prisma generate` and `fix-duo-icons`; exit 0.

- [x] **Step 2: Generate route types**
Run: `npx next typegen`
Expected: "Types generated successfully".

- [x] **Step 3: Record the baseline**
Run: `npm run typecheck && npm run lint && npm test`
Expected: typecheck silent; lint 0 errors (9 pre-existing warnings); tests 385 pass / 0 fail.

- [x] **Step 4: Read the version-specific docs**
Read `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/{loading,error}.md`, `05-config/01-next-config-js/staleTimes.md`.
Expected: note that `error.tsx` props are `{ error, retry }`.

- [x] **Step 5: Install the Upstash packages**
Run: `npm install @upstash/ratelimit @upstash/redis`

### Task 1: Spec and plan documents

- [x] **Step 1:** Write `docs/superpowers/specs/2026-11-20-folder-routing-design.md`.
- [x] **Step 2:** Write this plan file.
- [ ] **Step 3: Commit**
```bash
git add docs/superpowers
git commit -m "docs: add folder-routing and rate-limiting spec and plan"
```

### Task 2: Route, colocation and client-boundary guards

**Files:**
- Modify: `tests/routes.test.ts`
- Create: `tests/colocation.test.ts`

**Interfaces produced:** none (test-only).

- [ ] **Step 1: Write the failing route-file test**

Add to `tests/routes.test.ts`:

```ts
test("every workspace route has a page, a loading skeleton and an error boundary", () => {
  const missing: string[] = [];
  for (const view of ALL_VIEWS) {
    if (view === "plan") continue; // nested dynamic routes, checked separately
    const dir = join(process.cwd(), "src", "app", "(workspace)", VIEW_HREF[view].replace(/^\//, ""));
    for (const file of ["page.tsx", "loading.tsx", "error.tsx"]) {
      if (!existsSync(join(dir, file))) missing.push(`${view} -> ${file}`);
    }
  }
  assert.deepEqual(missing, []);
});

test("no workspace page is a client component", () => {
  const offenders: string[] = [];
  for (const view of ALL_VIEWS) {
    const file = join(process.cwd(), "src", "app", "(workspace)",
      VIEW_HREF[view].replace(/^\//, ""), "page.tsx");
    if (!existsSync(file)) continue;
    if (/^\s*["']use client["']/m.test(readFileSync(file, "utf8"))) offenders.push(view);
  }
  assert.deepEqual(offenders, []);
});

test("every workspace page authenticates with requireUser", () => {
  const offenders: string[] = [];
  for (const view of ALL_VIEWS) {
    const file = join(process.cwd(), "src", "app", "(workspace)",
      VIEW_HREF[view].replace(/^\//, ""), "page.tsx");
    if (!existsSync(file)) continue;
    if (!/requireUser\s*\(/.test(readFileSync(file, "utf8"))) offenders.push(view);
  }
  assert.deepEqual(offenders, []);
});

test("dynamic plan routes have a not-found file", () => {
  for (const rel of ["plan/[date]", "plan/week/[date]"]) {
    assert.ok(existsSync(join(process.cwd(), "src", "app", "(workspace)", rel, "not-found.tsx")), rel);
  }
});
```

- [ ] **Step 2: Write the failing colocation test**

Create `tests/colocation.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname, relative, resolve } from "node:path";

const APP = join(process.cwd(), "src", "app");

/** Every file under an underscore-prefixed folder, with its owning route dir. */
function privateFolders(dir: string, out: { file: string; owner: string }[] = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (!statSync(full).isDirectory()) continue;
    if (entry.startsWith("_")) {
      collect(full, dir, out);
    } else {
      privateFolders(full, out);
    }
  }
  return out;
}

function collect(dir: string, owner: string, out: { file: string; owner: string }[]) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) collect(full, owner, out);
    else out.push({ file: full, owner });
  }
}

test("a route's private folder is never imported from outside that route", () => {
  const sources: string[] = [];
  (function walk(d: string) {
    for (const e of readdirSync(d)) {
      const p = join(d, e);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(ts|tsx)$/.test(e)) sources.push(p);
    }
  })(join(process.cwd(), "src"));

  const violations: string[] = [];
  for (const { file, owner } of privateFolders(APP)) {
    const marker = `/_${relative(dirname(file), file).split("/")[0]}`;
    for (const source of sources) {
      if (source.startsWith(owner)) continue;
      const text = readFileSync(source, "utf8");
      if (text.includes(`/${relative(APP, dirname(file)).split("/").find((s) => s.startsWith("_"))}/`))
        violations.push(`${relative(dirname(source), file)} imported by ${relative(process.cwd(), source)}`);
    }
  }
  assert.deepEqual(violations, []);
});
```

- [ ] **Step 3: Run to verify both fail**
Run: `npx tsx --test tests/routes.test.ts tests/colocation.test.ts`
Expected: FAIL — missing `loading.tsx`/`error.tsx`, missing `not-found.tsx`, and the placeholder pages do not call `requireUser`.

- [ ] **Step 4: Add minimal stubs so the guards go green**

For each workspace route, add `loading.tsx` rendering the shared `<RouteSkeleton />` and `error.tsx` delegating to `<RouteError>`, plus `not-found.tsx` for the two plan routes. Each page gains a `requireUser()` call. Tasks 8–19 replace the stubs with real content.

- [ ] **Step 5: Run to verify they pass**
Run: `npx tsx --test tests/routes.test.ts tests/colocation.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**
```bash
git add tests/routes.test.ts tests/colocation.test.ts src/app
git commit -m "test: guard route files, client boundaries and colocation"
```

### Task 3: Pure rate-limit policy

**Files:**
- Create: `src/lib/rate-limit-core.ts`, `tests/rate-limit-core.test.ts`

**Interfaces produced:**
```ts
export type RateClass = "read" | "write" | "ai";
export const RATE_COST: Record<RateClass, number>;
export type BudgetState = { commandsToday: number; softCap: number; hardCap: number };
export type LimitDecision =
  | { outcome: "allowed"; source: "l1" | "l2" | "l1-override"; remaining: number; limit: number }
  | { outcome: "denied"; retryAfter: number; limit: number }
  | { outcome: "degraded"; reason: "no-redis" | "budget" | "breaker"; remaining: number; limit: number };
export function decideRateLimit(input: {
  rateClass: RateClass;
  l1: { allowed: boolean; remaining: number };
  budget: BudgetState;
  breakerOpen: boolean;
  redisConfigured: boolean;
}): { consultL2: boolean; preemptiveDeny?: LimitDecision };
export function rateLimitHeadersFor(decision: LimitDecision): HeadersInit;
```

- [ ] **Step 1: Write the failing tests** covering: read+L1-allow ⇒ no L2; write+L1-allow ⇒ L2; ai+L1-allow ⇒ L2; L1-deny ⇒ L2; soft cap ⇒ read/write degrade but ai consults; hard cap ⇒ all degrade; no Redis ⇒ degrade; open breaker ⇒ degrade; headers include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `Retry-After` ≥ 1.
- [ ] **Step 2: Run to verify it fails** — module missing.
- [ ] **Step 3: Implement** the decision table exactly as the spec states it; `RATE_COST` is `{ read: 1, write: 5, ai: 25 }`.
- [ ] **Step 4: Run to verify it passes.**
- [ ] **Step 5: Commit** `feat: pure rate-limit decision policy`

### Task 4: Command budget and Upstash adapter

**Files:**
- Create: `src/lib/rate-limit-budget.ts`, `src/lib/rate-limit-upstash.ts`, `tests/rate-limit-budget.test.ts`

**Interfaces produced:**
```ts
// rate-limit-budget.ts
export function nextBudget(prev: BudgetState, nowDay: string, day: string): BudgetState;
export function checkBudget(state: BudgetState): "ok" | "soft" | "hard";
// rate-limit-upstash.ts
export function redisConfigured(): boolean;
export function consumeUpstash(identity: string, rateClass: RateClass): Promise<
  { allowed: boolean; remaining: number; limit: number; retryAfter: number } | null>;
export function breakerOpen(): boolean;
```

- [ ] **Step 1: Write the failing tests** (injected clock, no network): IST-day rollover resets the count; 8,000 ⇒ `"soft"`; 9,500 ⇒ `"hard"`; the counter never decreases; three consecutive adapter failures open the breaker; it closes after 60 s.
- [ ] **Step 2: Run to verify it fails.**
- [ ] **Step 3: Implement.** `Ratelimit.slidingWindow(300, "60 s")` with `ephemeralCache`, `timeout: 250`, lazy `Redis.fromEnv()`, and `AbortSignal.timeout(250)`. Soft cap 8,000, hard cap 9,500.
- [ ] **Step 4: Run to verify it passes.**
- [ ] **Step 5: Commit** `feat: upstash L2 limiter with a daily command budget`

### Task 5: Wire the limiter into the request path

**Files:**
- Modify: `src/lib/rate-limit.ts`, `src/lib/route-handler.ts`, `src/app/api/ai/{chat,coach,extract,status}/route.ts`
- Delete: `src/lib/rate-limit-middleware.ts`

- [ ] **Step 1: Write the failing test** asserting the 429 envelope is unchanged (`error.code === "REQUEST_ERROR"`) and that `X-RateLimit-*` plus `Retry-After` appear on both a 200 and a 429.
- [ ] **Step 2: Run to verify it fails.**
- [ ] **Step 3: Implement.** `consumeRateLimit(rateClass, identity)` composes Tasks 3–4; `defineRoute` maps `kind: "write"` → `write` else `read` and awaits it. The AI streaming routes call it with the `ai` class after `requireUser()` and before `reserveAiUsage`. Delete the dead `rate-limit-middleware.ts`. `/api/health` and `/api/cron/*` stay exempt.
- [ ] **Step 4: Run `npm run typecheck && npm test`.**
- [ ] **Step 5: Commit** `feat: two-layer rate limiting on API and AI routes`

### Task 6: Document the Upstash configuration

**Files:** `.env.example`, `README.md`, `docs/caching.md`, `CLAUDE.md`, `AGENTS.md`

- [ ] **Step 1:** Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` as optional, with the L1-only fallback contract.
- [ ] **Step 2:** Document budgets, caps, the decision table and the circuit breaker.
- [ ] **Step 3: Commit** `docs: document upstash rate limiting`

### Task 7: RSC foundation

**Files:**
- Create: `src/lib/rsc/prefetch.ts`, `src/components/workspace-frame.tsx`, `src/components/shared/{route-error,route-skeleton,empty-scope-notice,use-filters-state}.tsx`, `src/app/global-error.tsx`
- Modify: `src/lib/auth/require-user.ts`, `src/app/(workspace)/layout.tsx`

**Interfaces produced:**
```ts
// src/lib/rsc/prefetch.ts
export function prefetchInto(qc: QueryClient, entries: { key: QueryKey; load: () => Promise<unknown> }[]): Promise<void>;
// src/components/shared/use-filters-state.ts
export function useFiltersState(): { filters; scope; page; comparePage; pageSize; sort; dir; setScope; updateFilters; setPage; setPageSize; changeSort; changePage };
```

- [ ] **Step 1: Write the failing tests.** `prefetchInto` resolves when one loader rejects and still seeds the others; `useFiltersState` contains no `router.push`/`router.replace`; each migrated route's prefetch keys equal the matching `queryOptions.queryKey`.
- [ ] **Step 2: Run to verify they fail.**
- [ ] **Step 3: Implement** `prefetchInto` with `Promise.allSettled`; wrap `requireUser` in React `cache()`; rewrite the layout to guard → providers → `<WorkspaceFrame>{children}</WorkspaceFrame>`, prefetching `examsQueryOptions` and `planQueryOptions`; build `WorkspaceFrame` from the old shell's chrome, palette, AI sheet and shortcuts; extract `useFiltersState` with the `history.replaceState` mirror; add `RouteError` (props `{ error, retry }` — not `reset`) and `RouteSkeleton`.
- [ ] **Step 4:** Keep a temporary `MIGRATED_ROUTES` scaffold so unmigrated routes still render while migrations land.
- [ ] **Step 5: Run `npm run typecheck && npm run build`.**
- [ ] **Step 6: Commit** `feat: RSC foundation, persistent providers and route primitives`

### Tasks 8–19: Route migrations

Each task runs the same five-step cycle. Replace `dashboard` with the route's components per the table below.

- [ ] **Step 1:** Move the route's components into `<route>/_<segment>/`; lift anything now imported by two routes into `src/components/shared/`. Run `npm run typecheck`.
- [ ] **Step 2:** Extract the read logic from the route's `/api/*` handler into `src/lib/services/<resource>.ts`; the handler keeps its envelope and calls the service. Run `npm test`.
- [ ] **Step 3:** Replace `page.tsx` with `requireUser()` → `prefetchInto` → `HydrationBoundary`. Remove the route's branch from the scaffold.
- [ ] **Step 4:** Replace the `loading.tsx` and `error.tsx` stubs with the route's real geometry; add `not-found.tsx` for the plan routes.
- [ ] **Step 5:** Run `npm run typecheck && npm run lint && npm test`, then commit `feat(<route>): serve <route> as a server route with its own components`.

| Task | Route | Prefetched keys | Skeleton shape |
|---|---|---|---|
| 8 | `/` | none (already server) | none |
| 9 | `/performance` | `analyticsKeys.request(scope)` | header + 2 chart boxes + findings rows |
| 10 | `/history` | `attemptKeys.list(params)` | header + filter row + 10 rows + pagination |
| 11 | `/compare` | `attemptKeys.detail(id)` per `?ids=` | header + 4 comparison columns |
| 12 | `/trash` | `trashKeys.list(params)` | header + 6 rows + detail rail |
| 13 | `/my-tasks` | `todoKeys.tasks()`, `planKeys.current()` | header + overview strip + board columns |
| 14 | `/calendar` | `planKeys.current()`, `todoKeys.calendar(range)`, `attemptKeys.full()` | header + month grid + metric strip |
| 15 | `/plan/[date]` | `planKeys.current()`, `todoKeys.tasks()` | header + day column + rail; `not-found` on a bad date |
| 16 | `/plan/week/[date]` | `planKeys.current()` | header + 7 day columns; `not-found` |
| 17 | `/add` | `attemptKeys.detail(id)` when `?id=` | header + form sections |
| 18 | `/settings` | `examsKeys.all` | header + rail + active panel |
| 19 | `/dashboard` (last) | `analyticsKeys.request("all")`, `attemptKeys.full()`, `planKeys.current()` | header + metric strip + two-column panels + charts |

### Task 20: Retire the shell

- [ ] **Step 1:** Delete `src/components/workspace-shell.tsx`, `src/components/use-workspace-data.ts`, the `MIGRATED_ROUTES` scaffold and every emptied file.
- [ ] **Step 2:** Replace the shell's `addPrefill` pathway with the `ui-store` nonce.
- [ ] **Step 3:** Run `npm run typecheck && npm run lint && npm test && npm run build`.
- [ ] **Step 4: Commit** `refactor: delete the workspace shell`

### Task 21: Verification and documentation closeout

- [ ] **Step 1:** Full gate: `npx prisma generate && npx next typegen && npm run typecheck && npm run lint && npm test && npm run build`.
- [ ] **Step 2:** `tools/shot.mjs` for all 12 workspace routes at 1280 and 1440 px; desktop must be pixel-identical. `tools/resp-probe.mjs` unchanged at 375/768/1024.
- [ ] **Step 3:** `npm run dev` smoke pass: navigate every route, force a 429, and load `/plan/not-a-date` expecting `not-found.tsx`.
- [ ] **Step 4:** Update `CLAUDE.md` **and** `AGENTS.md` together (routing model, colocation rule, rate limiting, shell removal), plus `README.md` and `docs/caching.md`.
- [ ] **Step 5:** `graphify update .`
- [ ] **Step 6: Commit** `docs: record folder routing and rate limiting`

## Rulings carried into this plan

- **Task 2 / all `error.tsx` files:** the plan said `reset()`; this Next version passes `{ error, retry }` and documents `retry()` as correct. Use `retry`. Cost if wrong: the error surface fails to clear on a transient failure.
- **Task 4:** "fail closed on writes" was refined to "fail to L1" with a circuit breaker, because a Upstash outage must never stop a save and L1's write bucket still applies backpressure. Cost if wrong: cross-instance write limiting is briefly weaker during an outage.
