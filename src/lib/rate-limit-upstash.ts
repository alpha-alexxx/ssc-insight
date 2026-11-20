import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import {
  initialBreaker,
  isBreakerOpen,
  onFailure,
  onSuccess,
  tickBreaker,
  type BreakerState,
} from "./rate-limit-breaker";
import { L2_WINDOW, RATE_COST, type RateClass } from "./rate-limit-core";

/**
 * Upstash L2 limiter — the cross-instance authority.
 *
 * Shaped deliberately for the free tier:
 * - One weighted sliding window per identity. The class picks the cost, so one
 *   Redis key serves reads, writes and AI calls instead of three keys and three
 *   commands.
 * - `analytics: false` (the SDK default). Analytics adds a command per check and
 *   is billed on the free plan.
 * - `dynamicLimits: false` (the default) — that would add a GET to every check.
 * - `ephemeralCache` kept with an explicit map so a warm instance shares it. An
 *   identity L2 has already blocked is then refused locally. Caveat: the SDK
 *   skips the cache for *weighted* requests, so this short-circuits only the
 *   unweighted path.
 * - `timeout: 250` — a slow Upstash must not become a slow app. The SDK's
 *   default is 5000 ms.
 *
 * Failure handling lives in `rate-limit-breaker.ts` (pure and unit-tested). When
 * the circuit is open — or the call fails — this module returns null and the
 * caller falls back to L1. It never returns "allowed unconditionally".
 */

/** Per-call ceiling; deliberately far below the SDK's 5000 ms default. */
const L2_TIMEOUT_MS = 250;

export type UpstashResult = {
  allowed: boolean;
  remaining: number;
  limit: number;
  /** Seconds the caller should wait; 0 when allowed. */
  retryAfter: number;
};

let breaker: BreakerState = initialBreaker();
let limiter: Ratelimit | null | undefined;

/** True when both Upstash env vars are present. */
export function redisConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

/**
 * The limiter, created once per instance, or null when unconfigured.
 * Constructed lazily so a missing or malformed configuration never throws at
 * import time — the app must boot and run without Upstash.
 */
function getLimiter(): Ratelimit | null {
  if (limiter !== undefined) return limiter;
  if (!redisConfigured()) {
    limiter = null;
    return limiter;
  }
  try {
    limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(L2_WINDOW.limit, "60 s"),
      prefix: "ssc:rl",
      timeout: L2_TIMEOUT_MS,
      analytics: false,
      ephemeralCache: new Map<string, number>(),
    });
  } catch {
    // A malformed URL must not crash the request path.
    limiter = null;
  }
  return limiter;
}

/** True while the circuit is open — callers then run L1-only. */
export function breakerOpen(now = Date.now()): boolean {
  breaker = tickBreaker(breaker, now);
  return isBreakerOpen(breaker, now);
}

/**
 * Consult L2 for one identity at one class's cost.
 *
 * Returns null when the consultation could not happen (unconfigured, circuit
 * open, timeout, SDK error). The caller then falls back to L1.
 */
export async function consumeUpstash(
  identity: string,
  rateClass: RateClass,
): Promise<UpstashResult | null> {
  if (!redisConfigured()) return null;

  const now = Date.now();
  if (breakerOpen(now)) return null;

  const active = getLimiter();
  if (!active) return null;

  const cost = RATE_COST[rateClass];
  try {
    // One weighted command: `rate` consumes `cost` units of the window.
    const response = await active.limit(identity, { rate: cost });
    breaker = onSuccess();
    const retryAfter =
      response.success || !response.reset
        ? 0
        : Math.max(1, Math.ceil((response.reset - now) / 1000));
    return {
      allowed: response.success,
      remaining: Math.max(0, response.remaining),
      limit: response.limit,
      retryAfter,
    };
  } catch {
    // Network error, bad credentials, or the SDK's own timeout rejection.
    breaker = onFailure(breaker, now);
    return null;
  }
}

/** Test seam: reset the limiter and the breaker between cases. */
export function resetUpstashForTests(): void {
  limiter = undefined;
  breaker = initialBreaker();
}

/** Test seam: current breaker internals, without exposing the object. */
export function breakerSnapshotForTests(): { failures: number; open: boolean } {
  return { failures: breaker.failures, open: breaker.openedAt !== null };
}
