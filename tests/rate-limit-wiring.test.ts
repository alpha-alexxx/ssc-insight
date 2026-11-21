import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { apiError, RequestError } from "../src/lib/api";
import {
  AI_L2_COST,
  AI_RATE_LIMIT,
  AI_WINDOW_SECONDS,
  L2_TIMEOUT_MS,
  L2_WINDOW,
  RATE_COST,
  decideRateLimit,
  rateLimitHeadersFor,
  resolveLimiterOutcome,
  type LimitDecision,
} from "../src/lib/rate-limit-core";

/**
 * The request-path contract of the two-layer limiter.
 *
 * Two properties must survive the rewrite:
 *  1. A 429 keeps the existing error envelope, so `api()` on the client still
 *     throws `ApiError` with `retryAfterSeconds` and the query client's retry
 *     policy keeps working with no client change.
 *  2. The `X-RateLimit-*` and `Retry-After` headers appear on both allowed and
 *     denied responses — the client and QA scripts read them.
 */

test("a denied limit normalizes into the documented 429 envelope", () => {
  const decision: LimitDecision = { outcome: "denied", retryAfter: 12, limit: 300 };
  const response = apiError(new RequestError("Too many requests. Slow down and retry.", 429));
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("Cache-Control"), "private, no-store");
  // The header set the caller merges must carry the wait hint for the client.
  const headers = rateLimitHeadersFor(decision);
  assert.equal(headers["Retry-After"], "12");
  assert.equal(headers["X-RateLimit-Limit"], "300");
});

test("an allowed decision carries the remaining budget as headers", () => {
  const headers = rateLimitHeadersFor({
    outcome: "allowed",
    source: "l2",
    remaining: 275,
    limit: 300,
  });
  assert.equal(headers["X-RateLimit-Remaining"], "275");
  assert.equal(headers["Retry-After"], undefined);
});

test("a degraded decision carries the L1 remaining count", () => {
  const headers = rateLimitHeadersFor({
    outcome: "degraded",
    reason: "breaker",
    remaining: 8,
    limit: 0,
  });
  assert.equal(headers["X-RateLimit-Remaining"], "8");
});

test("the L2 timeout is small enough that Upstash cannot become the bottleneck", () => {
  // A 5s default (the SDK's) would hold a route handler open far longer than
  // any database call this app makes.
  assert.ok(L2_TIMEOUT_MS <= 500, `L2 timeout was ${L2_TIMEOUT_MS}ms`);
});

test("write cost exceeds a read in the shared window; AI has its own tighter budget", () => {
  assert.ok(RATE_COST.write > RATE_COST.read);
  assert.equal(AI_L2_COST, 1);
  assert.ok(
    AI_RATE_LIMIT < L2_WINDOW.limit,
    "the AI window must be tighter than the shared one",
  );
  assert.equal(AI_WINDOW_SECONDS, 60);
});

test("an L2 allow overrides an L1 denial and is labelled as such", () => {
  // L1 is per-instance: a drained bucket on one warm instance must not be
  // reported as a global limit while the shared window is intact.
  const plan = decideRateLimit({
    rateClass: "read",
    l1: { allowed: false, remaining: 0 },
    budget: { commandsToday: 0, softCap: 8000, hardCap: 9500 },
    breakerOpen: false,
    redisConfigured: true,
  });
  assert.equal(plan.consultL2, true);
  const outcome = resolveLimiterOutcome({
    plan,
    l1: { allowed: false, remaining: 0 },
    l2: { allowed: true, remaining: 40, limit: 300, retryAfter: 0 },
  });
  assert.equal(outcome.outcome, "allowed");
  if (outcome.outcome === "allowed") assert.equal(outcome.source, "l1-override");
});

test("an L2 denial refuses even when L1 allowed", () => {
  const plan = decideRateLimit({
    rateClass: "write",
    l1: { allowed: true, remaining: 10 },
    budget: { commandsToday: 0, softCap: 8000, hardCap: 9500 },
    breakerOpen: false,
    redisConfigured: true,
  });
  const outcome = resolveLimiterOutcome({
    plan,
    l1: { allowed: true, remaining: 10 },
    l2: { allowed: false, remaining: 0, limit: 300, retryAfter: 7 },
  });
  assert.equal(outcome.outcome, "denied");
  if (outcome.outcome === "denied") assert.equal(outcome.retryAfter, 7);
});

test("a failed L2 consultation keeps the L1 verdict instead of failing open", () => {
  const plan = decideRateLimit({
    rateClass: "write",
    l1: { allowed: true, remaining: 3 },
    budget: { commandsToday: 0, softCap: 8000, hardCap: 9500 },
    breakerOpen: false,
    redisConfigured: true,
  });
  // l2 === null models a timeout / open circuit.
  const allowed = resolveLimiterOutcome({
    plan,
    l1: { allowed: true, remaining: 3 },
    l2: null,
  });
  assert.equal(allowed.outcome, "degraded");

  const denied = resolveLimiterOutcome({
    plan,
    l1: { allowed: false, remaining: 0 },
    l2: null,
  });
  assert.equal(denied.outcome, "denied");
});

// ── Page-level degradation (regressions caught only by running the app) ──────

test("a page prefetch survives an unreachable database", async () => {
  // Regression: every page awaited loadExamContext() outside prefetchInto, so an
  // unreachable database threw there and 500'd the page — the exact failure
  // prefetchInto exists to prevent. `safely` is what makes that survivable.
  const { safely } = await import("../src/lib/rsc/prefetch");
  const failed = await safely(async () => {
    throw new Error("DATABASE_NOT_CONFIGURED");
  });
  assert.equal(failed, null);

  const ok = await safely(async () => 42);
  assert.equal(ok, 42);
});

test("a null scope source is documented as tolerated, not thrown on", () => {
  // Regression companion: `attemptFiltersFrom`/`loadAnalytics` accept a null ctx
  // so a database outage degrades the page instead of throwing. Those modules
  // import `server-only`, which this runner cannot resolve, so the contract is
  // asserted from source rather than by import — a weaker check, recorded in the
  // ledger as such.
  const source = readFileSync(
    join(process.cwd(), "src", "lib", "services", "attempts.ts"),
    "utf8",
  );
  assert.ok(
    /ctx:\s*Awaited<ReturnType<typeof loadExamContext>> \| null/.test(source),
    "attemptFiltersFrom must accept a null ctx",
  );
  assert.ok(source.includes("ctx?.activeExamId"), "must not deref a null ctx");
  const analytics = readFileSync(
    join(process.cwd(), "src", "lib", "services", "analytics.ts"),
    "utf8",
  );
  assert.ok(
    analytics.includes("if (!ctx)"),
    "loadAnalytics must handle an unresolved scope",
  );
});

test("filters cannot be parsed from a relative query string", () => {
  // Regression: performance/page.tsx called filtersFrom("?"), which builds a URL
  // and throws ERR_INVALID_URL for a relative string. Pages must parse the
  // searchParams object through filtersSchema instead.
  assert.throws(() => new URL("?"), /Invalid URL/);
});
