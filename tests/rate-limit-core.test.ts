import { test } from "node:test";
import assert from "node:assert/strict";
import {
  RATE_COST,
  decideRateLimit,
  rateLimitHeadersFor,
  describeDecision,
  type BudgetState,
} from "../src/lib/rate-limit-core";

/**
 * Rate-limit policy table.
 *
 * The cost of getting this wrong is asymmetric: too eager and every request
 * spends a Upstash command (10k/day is ~7 req/min sustained, which the
 * dashboard's fan-out burns through), too lax and a determined abuser is only
 * limited per serverless instance. These are the pure decisions, so they are
 * tested without network or clock.
 */

const budget = (commandsToday = 0): BudgetState => ({
  commandsToday,
  softCap: 8000,
  hardCap: 9500,
});

const base = {
  budget: budget(),
  breakerOpen: false,
  redisConfigured: true,
};

test("a read that L1 already allows never consults Upstash", () => {
  const decision = decideRateLimit({
    ...base,
    rateClass: "read",
    l1: { allowed: true, remaining: 100 },
  });
  assert.equal(decision.consultL2, false);
  assert.equal(decision.preemptiveDeny, undefined);
});

test("a write that L1 allows consults Upstash", () => {
  const decision = decideRateLimit({
    ...base,
    rateClass: "write",
    l1: { allowed: true, remaining: 10 },
  });
  assert.equal(decision.consultL2, true);
});

test("an AI request that L1 allows consults Upstash", () => {
  const decision = decideRateLimit({
    ...base,
    rateClass: "ai",
    l1: { allowed: true, remaining: 10 },
  });
  assert.equal(decision.consultL2, true);
});

test("an L1 denial consults Upstash instead of denying outright", () => {
  // L1 is per-instance: a burst that exhausts one instance's bucket must not
  // be reported as a global rate limit while the global budget is intact.
  for (const rateClass of ["read", "write", "ai"] as const) {
    const decision = decideRateLimit({
      ...base,
      rateClass,
      l1: { allowed: false, remaining: 0 },
    });
    assert.equal(decision.consultL2, true, rateClass);
    assert.equal(decision.preemptiveDeny, undefined, rateClass);
  }
});

test("each class carries a distinct cost", () => {
  assert.deepEqual(RATE_COST, { read: 1, write: 5, ai: 25 });
});

test("crossing the soft cap degrades reads and writes but keeps AI protected", () => {
  for (const rateClass of ["read", "write"] as const) {
    const decision = decideRateLimit({
      ...base,
      budget: budget(8000),
      rateClass,
      l1: { allowed: true, remaining: 5 },
    });
    assert.equal(decision.consultL2, false, rateClass);
    assert.equal(decision.preemptiveDeny?.outcome, "degraded", rateClass);
    if (decision.preemptiveDeny?.outcome === "degraded") {
      assert.equal(decision.preemptiveDeny.reason, "budget", rateClass);
    }
  }
  const ai = decideRateLimit({
    ...base,
    budget: budget(8000),
    rateClass: "ai",
    l1: { allowed: true, remaining: 5 },
  });
  assert.equal(ai.consultL2, true);
});

test("crossing the hard cap degrades every class", () => {
  for (const rateClass of ["read", "write", "ai"] as const) {
    const decision = decideRateLimit({
      ...base,
      budget: budget(9500),
      rateClass,
      l1: { allowed: true, remaining: 5 },
    });
    assert.equal(decision.consultL2, false, rateClass);
    assert.equal(decision.preemptiveDeny?.outcome, "degraded", rateClass);
  }
});

test("without Redis configured every class degrades to L1", () => {
  const decision = decideRateLimit({
    ...base,
    redisConfigured: false,
    rateClass: "write",
    l1: { allowed: true, remaining: 5 },
  });
  assert.equal(decision.consultL2, false);
  assert.equal(decision.preemptiveDeny?.outcome, "degraded");
  if (decision.preemptiveDeny?.outcome === "degraded") {
    assert.equal(decision.preemptiveDeny.reason, "no-redis");
  }
});

test("an open breaker degrades to L1 for every class", () => {
  for (const rateClass of ["read", "write", "ai"] as const) {
    const decision = decideRateLimit({
      ...base,
      breakerOpen: true,
      rateClass,
      l1: { allowed: true, remaining: 5 },
    });
    assert.equal(decision.consultL2, false, rateClass);
    if (decision.preemptiveDeny?.outcome === "degraded") {
      assert.equal(decision.preemptiveDeny.reason, "breaker", rateClass);
    }
  }
});

test("a degraded decision still carries the L1 remaining count", () => {
  const decision = decideRateLimit({
    ...base,
    redisConfigured: false,
    rateClass: "read",
    l1: { allowed: true, remaining: 42 },
  });
  assert.equal(decision.preemptiveDeny?.outcome, "degraded");
  if (decision.preemptiveDeny?.outcome === "degraded") {
    assert.equal(decision.preemptiveDeny.remaining, 42);
  }
});

test("headers expose the limit, the remaining count and a positive Retry-After", () => {
  const allowed = rateLimitHeadersFor({
    outcome: "allowed",
    source: "l2",
    remaining: 12,
    limit: 300,
  });
  assert.deepEqual(allowed, {
    "X-RateLimit-Limit": "300",
    "X-RateLimit-Remaining": "12",
  });

  const denied = rateLimitHeadersFor({ outcome: "denied", retryAfter: 30, limit: 300 });
  assert.equal(denied["X-RateLimit-Limit"], "300");
  assert.equal(denied["X-RateLimit-Remaining"], "0");
  assert.equal(denied["Retry-After"], "30");

  // A sub-second wait must never serialise as 0 or the client retries instantly.
  const subSecond = rateLimitHeadersFor({ outcome: "denied", retryAfter: 0, limit: 300 });
  assert.equal(subSecond["Retry-After"], "1");
});

test("a degraded class with L1 already exhausted is denied rather than allowed", () => {
  // Degrading to L1 must not bypass L1. This is the bug a naive "degrade =
  // allow" would ship: refuse only L2, and a Redis outage would grant
  // unlimited writes.
  const decision = decideRateLimit({
    ...base,
    redisConfigured: false,
    rateClass: "write",
    l1: { allowed: false, remaining: 0 },
  });
  assert.equal(decision.consultL2, false);
  assert.equal(decision.preemptiveDeny?.outcome, "denied");
});

test("describeDecision yields a short greppable label", () => {
  assert.equal(
    describeDecision({ outcome: "allowed", source: "l1", remaining: 3, limit: 300 }),
    "allowed:l1",
  );
  assert.equal(describeDecision({ outcome: "denied", retryAfter: 5, limit: 300 }), "denied");
  assert.equal(
    describeDecision({ outcome: "degraded", reason: "breaker", remaining: 0, limit: 300 }),
    "degraded:breaker",
  );
});
