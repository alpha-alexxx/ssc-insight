import "server-only";
import { createHash } from "node:crypto";
import { budgetState, checkBudget, spendCommand } from "./rate-limit-budget";
import {
  decideRateLimit,
  resolveLimiterOutcome,
  type LimitDecision,
  type RateClass,
  type RateLimitHeaders,
  rateLimitHeadersFor,
} from "./rate-limit-core";
import { consumeUpstash, breakerOpen, redisConfigured } from "./rate-limit-upstash";
import { istDateKey } from "./format";

/**
 * In-memory token-bucket rate limiter.
 *
 * - One bucket per identity (user id when authenticated, hashed IP otherwise).
 * - Refills continuously up to `capacity` tokens at `refillPerSecond`.
 * - Single-process: appropriate for a single-instance deployment. For
 *   multi-instance, replace with Redis-backed token bucket.
 *
 * Public surface is intentionally tiny: `consume(key, cost?)` returns a result
 * the caller can attach as headers and use to decide 429 vs continue.
 */

type Bucket = { tokens: number; lastRefill: number };

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  /** Seconds until the bucket would have enough tokens for one more request. */
  retryAfter: number;
  limit: number;
};

export class TokenBucketRateLimiter {
  private readonly buckets = new Map<string, Bucket>();
  private readonly capacity: number;
  private readonly refillPerSecond: number;
  /** Auto-expire idle buckets so a long-tail of identities cannot exhaust RAM. */
  private readonly idleTtlMs: number;
  private lastSweep = Date.now();

  constructor(opts: { capacity: number; refillPerSecond: number; idleTtlMs?: number }) {
    this.capacity = opts.capacity;
    this.refillPerSecond = opts.refillPerSecond;
    this.idleTtlMs = opts.idleTtlMs ?? 30 * 60 * 1000;
  }

  consume(key: string, cost = 1): RateLimitResult {
    this.maybeSweep();
    const now = Date.now();
    const bucket = this.buckets.get(key);
    if (!bucket) {
      const tokens = Math.max(0, this.capacity - cost);
      this.buckets.set(key, { tokens, lastRefill: now });
      return {
        allowed: tokens >= 0,
        remaining: Math.max(0, tokens),
        retryAfter: tokens < 0 ? Math.ceil((-tokens) / this.refillPerSecond) : 0,
        limit: this.capacity,
      };
    }
    const elapsedSec = (now - bucket.lastRefill) / 1000;
    const refilled = Math.min(
      this.capacity,
      bucket.tokens + elapsedSec * this.refillPerSecond,
    );
    if (refilled < cost) {
      bucket.tokens = refilled;
      bucket.lastRefill = now;
      return {
        allowed: false,
        remaining: Math.floor(refilled),
        retryAfter: Math.ceil((cost - refilled) / this.refillPerSecond),
        limit: this.capacity,
      };
    }
    bucket.tokens = refilled - cost;
    bucket.lastRefill = now;
    return {
      allowed: true,
      remaining: Math.floor(bucket.tokens),
      retryAfter: 0,
      limit: this.capacity,
    };
  }

  private maybeSweep() {
    const now = Date.now();
    if (now - this.lastSweep < this.idleTtlMs / 2) return;
    this.lastSweep = now;
    const cutoff = now - this.idleTtlMs;
    for (const [key, bucket] of this.buckets) {
      if (bucket.lastRefill < cutoff) this.buckets.delete(key);
    }
  }
}

/**
 * Identity for rate limiting. Authenticated users get their user id verbatim;
 * anonymous requests get a hash of the client IP (never the raw IP, to avoid
 * storing PII in the limiter map longer than necessary).
 */
export function rateLimitKey(opts: { userId?: string; ip?: string }) {
  if (opts.userId) return `u:${opts.userId}`;
  if (opts.ip) {
    const hash = createHash("sha256").update(opts.ip).digest("hex").slice(0, 24);
    return `a:${hash}`;
  }
  return "a:anon";
}

/** Extract a best-effort client IP without trusting forwarded headers blindly. */
export function clientIp(request: Request): string | undefined {
  // In production behind a trusted proxy, set TRUSTED_PROXY=1 and forward via
  // X-Forwarded-For set by the proxy. Locally we fall back to the socket peer.
  const xff = request.headers.get("x-forwarded-for");
  if (process.env.TRUSTED_PROXY === "true" && xff) {
    return xff.split(",")[0]?.trim();
  }
  return undefined;
}

/**
 * Default limiter: 120 req / 30s burst, 2 req/sec sustained. Generous for a
 * single-user dashboard but stops brute force on /api/*.
 */
export const apiRateLimiter = new TokenBucketRateLimiter({
  capacity: 120,
  refillPerSecond: 2,
});

/**
 * Stricter limiter for state-changing endpoints: 20 writes / 30s burst,
 * 0.5 writes/sec sustained. Stops scripted abuse of create/update/delete
 * without affecting normal interactive use.
 */
export const writeRateLimiter = new TokenBucketRateLimiter({
  capacity: 20,
  refillPerSecond: 0.5,
});

/** Headers a caller can copy onto a 429 response. Does NOT include
 * Cache-Control — the route owns that header (SWR for GETs, no-store for
 * everything else). */
export function rateLimitHeaders(result: RateLimitResult): RateLimitHeaders {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "Retry-After": String(Math.max(1, result.retryAfter)),
  };
}

// ── Two-layer consumption ───────────────────────────────────────────────────

/**
 * Consume one request against both layers and return the settled decision.
 *
 * L1 (the token bucket above) is free and per-instance. L2 (Upstash) is the
 * cross-instance authority but spends a Redis command from the daily budget, so
 * `decideRateLimit` decides whether the consultation is worth it: reads never
 * pay, writes and AI always check, and a drained L1 bucket asks L2 instead of
 * refusing outright.
 *
 * Failure posture: a missing configuration, an open circuit or a timeout all
 * degrade to L1 — never to "allow unconditionally", and never to a failed
 * request. A rate limiter must not be able to take the app down.
 */
export async function consumeRateLimit(
  rateClass: RateClass,
  identity: string,
): Promise<LimitDecision> {
  const limiter = rateClass === "write" ? writeRateLimiter : apiRateLimiter;
  const bucket = limiter.consume(identity);
  const day = istDateKey(new Date());
  const budget = budgetState(day);

  const plan = decideRateLimit({
    rateClass,
    l1: {
      allowed: bucket.allowed,
      remaining: bucket.remaining,
      retryAfter: bucket.retryAfter,
      limit: bucket.limit,
    },
    budget,
    breakerOpen: breakerOpen(),
    redisConfigured: redisConfigured(),
  });

  let l2: Awaited<ReturnType<typeof consumeUpstash>> = null;
  if (plan.consultL2) {
    l2 = await consumeUpstash(identity, rateClass);
    // Charge the budget only for a command we actually issued.
    if (l2 !== null) {
      const spent = spendCommand(day);
      if (checkBudget(spent) === "soft" && checkBudget(budget) !== "soft") {
        // One line on the first crossing, not per request.
        console.warn("[rate-limit] daily Upstash command soft cap reached; reads and writes now run on L1 only");
      }
    }
  }

  return resolveLimiterOutcome({
    plan,
    l1: {
      allowed: bucket.allowed,
      remaining: bucket.remaining,
      retryAfter: bucket.retryAfter,
      limit: bucket.limit,
    },
    l2,
  });
}

/** Headers for a settled two-layer decision. */
export function rateLimitHeadersForDecision(decision: LimitDecision): RateLimitHeaders {
  return rateLimitHeadersFor(decision);
}

/** The identity for the current request: user id when signed in, hashed IP otherwise. */
export function requestIdentity(userId: string | undefined, request: Request): string {
  return rateLimitKey({ userId, ip: clientIp(request) });
}
