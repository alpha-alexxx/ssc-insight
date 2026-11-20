/**
 * Pure rate-limit policy — no `server-only`, no network, no clock.
 *
 * The system has two layers:
 *   L1  an in-memory token bucket per instance (src/lib/rate-limit.ts). Free,
 *       absorbs bursts, and is per-process so it is NOT a global limit.
 *   L2  a Upstash sliding window (src/lib/rate-limit-upstash.ts). Correct
 *       across instances, but every consultation spends a Redis command from a
 *       10k/day allowance.
 *
 * This module owns the only decision that matters: when is L2 worth spending a
 * command on. Keeping it pure is what lets the policy be tested exhaustively
 * without Redis, a clock, or a running server.
 *
 * The asymmetry to respect: L1 is per-instance, so its denial is *not* proof of
 * abuse — a burst can drain one instance while the global budget is untouched.
 * An L1 denial therefore asks L2 rather than refusing outright. The reverse is
 * also true: L1's allow is not proof of compliance, so writes and AI calls
 * check L2 anyway.
 */

export type RateClass = "read" | "write" | "ai";

/**
 * Cost of one request in L2 units. A weighted limiter with a single 300-unit
 * window per minute means: ~300 reads, ~60 writes, or ~12 AI calls per minute.
 * That is generous for one person and stops scripted abuse.
 */
export const RATE_COST: Record<RateClass, number> = {
  read: 1,
  write: 5,
  ai: 25,
};

/** L2 window: 300 units per 60 seconds, per identity. */
export const L2_WINDOW = { limit: 300, windowSeconds: 60 } as const;

/** Command budget against the provider's daily allowance (10k/day free tier). */
export const BUDGET_CAPS = { softCap: 8000, hardCap: 9500 } as const;

export type BudgetState = {
  /** Redis commands already spent today, as far as this instance knows. */
  commandsToday: number;
  softCap: number;
  hardCap: number;
};

export type LimitDecision =
  | {
      outcome: "allowed";
      /** Where the allow came from — "l1-override" means L1 denied but L2 allowed. */
      source: "l1" | "l2" | "l1-override";
      remaining: number;
      limit: number;
    }
  | { outcome: "denied"; retryAfter: number; limit: number }
  | {
      outcome: "degraded";
      /** Why L2 was skipped. */
      reason: "no-redis" | "budget" | "breaker";
      remaining: number;
      limit: number;
    };

export type RateLimitInput = {
  rateClass: RateClass;
  /** The in-memory bucket's verdict for this request. */
  l1: { allowed: boolean; remaining: number };
  budget: BudgetState;
  breakerOpen: boolean;
  redisConfigured: boolean;
};

export type RateLimitPlan = {
  /** Whether the caller must await the Upstash limiter. */
  consultL2: boolean;
  /**
   * A decision that settles the request without consulting L2. Only ever set
   * when L2 is unusable or unaffordable.
   */
  preemptiveDeny?: LimitDecision;
};

/**
 * Decide whether this request needs an L2 consultation.
 *
 * Precedence: unusable L2 (no Redis, open breaker) and unaffordable L2 (hard
 * cap) settle the request locally; then the soft cap degrades the cheap classes
 * while keeping AI — the expensive, abusable one — protected; then the class
 * decides, with reads never paying for a round trip.
 */
export function decideRateLimit(input: RateLimitInput): RateLimitPlan {
  const { rateClass, l1, budget, breakerOpen, redisConfigured } = input;

  // L2 cannot be consulted at all: run on L1 alone. Degrading must NOT mean
  // "allow" — L1's verdict is still the limit, or a Redis outage would grant
  // unlimited writes.
  if (!redisConfigured || breakerOpen) {
    return {
      consultL2: false,
      preemptiveDeny: localFallback(l1, breakerOpen ? "breaker" : "no-redis"),
    };
  }

  // Over the hard cap the command allowance itself is at risk; stop spending it.
  if (budget.commandsToday >= budget.hardCap) {
    return { consultL2: false, preemptiveDeny: localFallback(l1, "budget") };
  }

  // Over the soft cap: reads and writes fall back to L1 (they are cheap to
  // brute-force and L1 still throttles them), while AI keeps its L2 protection
  // because a single call is by far the most expensive thing a user can do.
  if (budget.commandsToday >= budget.softCap && rateClass !== "ai") {
    return { consultL2: false, preemptiveDeny: localFallback(l1, "budget") };
  }

  // The normal path. Reads are free; writes and AI are worth the command; and
  // an L1 denial asks L2 whether the global budget is really exhausted.
  if (l1.allowed && rateClass === "read") return { consultL2: false };
  return { consultL2: true };
}

/** Settle a request locally when L2 is unavailable: L1's verdict stands. */
function localFallback(
  l1: { allowed: boolean; remaining: number },
  reason: "no-redis" | "budget" | "breaker",
): LimitDecision {
  if (!l1.allowed) {
    // Retry-After is supplied by the caller's bucket in the real path; when a
    // degraded request is refused, one second is a safe minimum because the
    // client's retry policy backs off independently.
    return { outcome: "denied", retryAfter: 1, limit: 0 };
  }
  return { outcome: "degraded", reason, remaining: l1.remaining, limit: 0 };
}

/**
 * Response headers for a settled decision. Names match the previous
 * single-layer implementation, so `ApiError.retryAfterSeconds` and the query
 * client's `retryDelay` keep working with no client change.
 */
export function rateLimitHeadersFor(decision: LimitDecision): HeadersInit {
  if (decision.outcome === "denied") {
    return {
      "X-RateLimit-Limit": String(decision.limit),
      "X-RateLimit-Remaining": "0",
      // Never serialise 0: a client that honours it retries immediately.
      "Retry-After": String(Math.max(1, Math.ceil(decision.retryAfter))),
    };
  }
  return {
    "X-RateLimit-Limit": String(decision.limit),
    "X-RateLimit-Remaining": String(Math.max(0, Math.floor(decision.remaining))),
  };
}

/** Short greppable label for logs: "allowed:l2", "denied", "degraded:breaker". */
export function describeDecision(decision: LimitDecision): string {
  if (decision.outcome === "denied") return "denied";
  if (decision.outcome === "degraded") return `degraded:${decision.reason}`;
  return `allowed:${decision.source}`;
}
