import { test } from "node:test";
import assert from "node:assert/strict";
import { apiError, RequestError } from "../src/lib/api";
import {
  L2_TIMEOUT_MS,
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

test("write and AI costs exceed a read, so one window budgets correctly", () => {
  assert.ok(RATE_COST.write > RATE_COST.read);
  assert.ok(RATE_COST.ai > RATE_COST.write);
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
