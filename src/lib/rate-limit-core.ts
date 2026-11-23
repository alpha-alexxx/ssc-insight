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
 * Cost of one request in the SHARED L2 window's units. Reads pay nothing —
 * `decideRateLimit` skips their consultation entirely when L1 allows; a write
 * costs 5, so the 300-unit window admits ~60 writes per minute. AI no longer
 * shares this window: coupling the most expensive class to the shared 300
 * units made writes and AI contend for the same allowance, so AI has its own
 * 20-per-minute window (AI_RATE_LIMIT) where every generation costs 1.
 */
export const RATE_COST: Record<Exclude<RateClass, "ai">, number> = {
  read: 1,
  write: 5,
};

/** The AI class's own cross-instance budget: 20 generations per 60 seconds. */
export const AI_RATE_LIMIT = 20;
export const AI_WINDOW_SECONDS = 60;

/** AI's cost inside its dedicated window: every generation counts as one. */
export const AI_L2_COST = 1;

/** L2 window: 300 units per 60 seconds, per identity. */
export const L2_WINDOW = { limit: 300, windowSeconds: 60 } as const;

/**
 * Per-call ceiling for an Upstash consultation. The SDK's default is 5000 ms,
 * which would hold a route handler open far longer than any database call this
 * app makes; 250 ms keeps Redis from ever becoming the bottleneck.
 */
export const L2_TIMEOUT_MS = 250;

/** Command budget against the provider's daily allowance (10k/day free tier). */
export const BUDGET_CAPS = { softCap: 8000, hardCap: 9500 } as const;

/**
 * Per-instance abuse escalation for repeat offenders. A client that keeps
 * hammering a drained bucket gets a doubled wait per consecutive denial, so
 * scripted abuse backs off exponentially instead of polling at the bucket's
 * base refill rate. Per-instance only — L2 remains the cross-instance
 * authority — and the cap keeps one bad client from being told to wait
 * forever. Reset on any allowed verdict.
 */
export const ESCALATION_CAP_SECONDS = 120;

export function escalatedRetryAfter(
  baseRetryAfterSeconds: number,
  deniedStreak: number,
): number {
  if (deniedStreak <= 1) return Math.max(1, Math.ceil(baseRetryAfterSeconds));
  // Clamp the exponent so a huge streak cannot overflow the multiplication
  // before the cap applies.
  const escalated =
    baseRetryAfterSeconds * 2 ** Math.min(deniedStreak - 1, 10);
  return Math.min(ESCALATION_CAP_SECONDS, Math.ceil(escalated));
}

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
  /**
   * The in-memory bucket's verdict. `retryAfter` is the bucket's own estimate —
   * it must survive into the response, or a rate-limited client is told to wait
   * 1 s while the bucket actually needs several.
   */
  l1: { allowed: boolean; remaining: number; retryAfter?: number; limit?: number };
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
  l1: { allowed: boolean; remaining: number; retryAfter?: number; limit?: number },
  reason: "no-redis" | "budget" | "breaker",
): LimitDecision {
  if (!l1.allowed) {
    // Use the bucket's own wait. The old hard-coded 1 s made the query client's
    // Retry-After-aware delay retry too early and loop (the write bucket refills
    // at 0.5/s, so a real wait can be 4 s).
    return { outcome: "denied", retryAfter: l1.retryAfter ?? 1, limit: l1.limit ?? 0 };
  }
  return { outcome: "degraded", reason, remaining: l1.remaining, limit: l1.limit ?? 0 };
}

/**
 * Response headers for a settled decision. Names match the previous
 * single-layer implementation, so `ApiError.retryAfterSeconds` and the query
 * client's `retryDelay` keep working with no client change.
 */
export type RateLimitHeaders = Record<string, string>;

export function rateLimitHeadersFor(decision: LimitDecision): RateLimitHeaders {
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

/** An L2 consultation's answer, or null when the call could not happen. */
export type L2Verdict = {
  allowed: boolean;
  remaining: number;
  limit: number;
  retryAfter: number;
};

/**
 * Merge the three verdicts (policy plan, L1 bucket, L2 window) into one
 * decision.
 *
 * Precedence:
 *  - A plan that already settled the request locally (degraded/unavailable L2)
 *    stands; a null L2 verdict re-derives it so the L1 verdict is never lost.
 *  - An L2 denial refuses even when L1 allowed — L2 is the cross-instance
 *    authority.
 *  - An L2 allow recorded after an L1 denial is labelled "l1-override": the
 *    request passed because the *global* budget was intact, not because the
 *    local bucket had room.
 *  - A read (or a degraded class) never reached L2, so L1's allow stands.
 */
export function resolveLimiterOutcome(input: {
  plan: RateLimitPlan;
  l1: { allowed: boolean; remaining: number; retryAfter?: number; limit?: number };
  l2: L2Verdict | null;
}): LimitDecision {
  const { plan, l1, l2 } = input;

  // The policy settled it without asking L2 (no Redis, open breaker, budget),
  // or the consultation itself failed. Either way L1's verdict is the limit.
  if (plan.preemptiveDeny) return plan.preemptiveDeny;
  if (!plan.consultL2) {
    return l1.allowed
      ? {
          outcome: "allowed",
          source: "l1",
          remaining: l1.remaining,
          // The real ceiling, not 0: `X-RateLimit-Limit: 0` with a remaining
          // count of 118 is a nonsense pair that breaks any remaining/limit math.
          limit: l1.limit ?? 0,
        }
      : { outcome: "denied", retryAfter: l1.retryAfter ?? 1, limit: l1.limit ?? 0 };
  }

  if (l2 === null) {
    // Consulted but unavailable (timeout / SDK error / circuit opened mid-call).
    return l1.allowed
      ? {
          outcome: "degraded",
          reason: "breaker",
          remaining: l1.remaining,
          limit: l1.limit ?? 0,
        }
      : { outcome: "denied", retryAfter: l1.retryAfter ?? 1, limit: l1.limit ?? 0 };
  }

  if (!l2.allowed) {
    return { outcome: "denied", retryAfter: l2.retryAfter, limit: l2.limit };
  }
  return {
    outcome: "allowed",
    source: l1.allowed ? "l2" : "l1-override",
    remaining: l2.remaining,
    limit: l2.limit,
  };
}
