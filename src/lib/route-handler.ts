import "server-only";
import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import type { AccountUser } from "@/lib/auth/session-policy";
import { apiError, ok, okCached, RequestError } from "@/lib/api";
import {
  consumeRateLimit,
  rateLimitHeadersForDecision,
  requestIdentity,
} from "@/lib/rate-limit";
import { describeDecision, type LimitDecision } from "@/lib/rate-limit-core";
import { accessLog } from "@/lib/access-log";
import { isSameOrigin, VARY_ORIGIN } from "@/lib/origin-core";
import { newRequestId } from "@/lib/middleware-utils";

/**
 * Unified API route handler — the single entry point every /api route goes
 * through, so cross-cutting concerns live in exactly one place:
 *
 *   request → request-id → session → rate limit → handler → envelope
 *                                  ↓ on any failure
 *                          normalized error JSON
 *
 * What the wrapper guarantees for every route:
 * - Correlation: honors the proxy's `x-request-id`, generates one otherwise,
 *   and echoes it on every response (success, rate-limited, or error).
 * - Timing: `Server-Timing: app;dur=…` (appended after the proxy's entry).
 * - Rate limiting: token bucket per user/IP — generous for reads, strict for
 *   writes — with RFC-style X-RateLimit-* / Retry-After headers on ALL
 *   responses, including the 429 itself.
 * - Sessions: requireUser() unless the route opts out (health); SessionError
 *   maps to 401/503 via the shared error normalizer.
 * - Errors: anything thrown (Zod, RequestError, Prisma codes, unknown) is
 *   normalized by apiError() — no stack traces or driver strings leak.
 * - Observability: one structured access-log line per request (stdout JSON,
 *   same discipline as audit events).
 *
 * Routes stay business-focused: they parse input, call the repository, and
 * return either `{ data, status?, cache?, headers? }` or a bare Response for
 * non-JSON payloads (CSV export, attachments).
 */

export type RouteResult = {
  data: unknown;
  status?: number;
  /** SWR cache policy (private responses). Omit for `private, no-store`. */
  cache?: { maxAgeSec: number; swrSec: number };
  /** Extra headers merged into the response (e.g. X-List-Truncated). */
  headers?: HeadersInit;
};

export type RouteContext<P> = {
  request: NextRequest;
  params: P;
  user: AccountUser;
  requestId: string;
  /** Wrapper clock start — reuse for audit `ms` so all timers agree. */
  startedAt: number;
};

export type RouteOptions = {
  /** "read" (default) uses the generous limiter; "write" the strict one. */
  kind?: "read" | "write";
  /** "required" (default) resolves the session; "public" skips it. */
  auth?: "required" | "public";
  /** Set false for infrastructure endpoints that must never be throttled. */
  rateLimit?: boolean;
  /**
   * Failure hook for routes that audit errors/denials. Receives the raw
   * error (a RequestError with status 429 means the bucket was exhausted).
   */
  onError?: (
    error: unknown,
    userId: string | undefined,
    startedAt: number,
  ) => void;
};

export function defineRoute<P = Record<string, never>>(
  options: RouteOptions,
  handler: (ctx: RouteContext<P>) => Promise<RouteResult | Response>,
): (request: NextRequest, context: { params: Promise<P> }) => Promise<Response> {
  return async (request, context) => {
    const requestId = request.headers.get("x-request-id") ?? newRequestId();
    const startedAt = Date.now();
    const pathname = request.nextUrl.pathname;
    let userId: string | undefined;

    const decorate = (response: Response, rl?: LimitDecision): Response => {
      response.headers.set("x-request-id", requestId);
      response.headers.set("Vary", VARY_ORIGIN);
      if (rl) {
        for (const [key, value] of new Headers(rateLimitHeadersForDecision(rl)).entries()) {
          response.headers.set(key, value);
        }
      }
      const appDur = Date.now() - startedAt;
      const previous = response.headers.get("Server-Timing");
      response.headers.set(
        "Server-Timing",
        previous ? `${previous}, app;dur=${appDur}` : `app;dur=${appDur}`,
      );
      return response;
    };

    const log = (status: number, note?: string) => {
      accessLog({
        method: request.method,
        path: pathname,
        status,
        ms: Date.now() - startedAt,
        rid: requestId,
        uid: userId,
        where: "route",
        ...(note ? { note } : {}),
      });
    };

    try {
      // 0. Same-origin: any request that carries an Origin must match the
      //    host, whatever the method. Unsafe methods were always checked in
      //    readBody; GETs are now too, so a cross-site fetch never reaches
      //    the handler at all (CORS would have stopped the browser from
      //    reading the response, but the handler should never even run).
      //    Non-browser clients — no Origin header — pass.
      const origin = request.headers.get("origin");
      const host = request.headers.get("host") ?? request.nextUrl.host;
      if (!isSameOrigin(origin, host)) {
        const response = apiError(
          new RequestError("Cross-origin changes are not allowed", 403),
        );
        log(403, "csrf");
        return decorate(response);
      }

      // 1. Session (route handlers are the real security boundary — the
      //    proxy guard is convenience, this is enforcement).
      const user =
        options.auth === "public" ? null : await requireUser();
      userId = user?.id;

      // 2. Rate limit per identity, across both layers (in-memory L1 + Upstash
      //    L2). Consumed exactly once; the decision decorates success AND
      //    failure responses so a client can always read its remaining budget.
      let rl: LimitDecision | undefined;
      if (options.rateLimit !== false) {
        rl = await consumeRateLimit(
          options.kind === "write" ? "write" : "read",
          requestIdentity(userId, request),
        );
        if (rl.outcome === "denied") {
          const denied = new RequestError(
            "Too many requests. Slow down and retry.",
            429,
          );
          options.onError?.(denied, userId, startedAt);
          log(429, `rate-limited:${describeDecision(rl)}`);
          return decorate(apiError(denied), rl);
        }
      }

      // 3. Business logic.
      const params = context?.params ? await context.params : ({} as P);
      const result = await handler({
        request,
        params,
        user: user as AccountUser,
        requestId,
        startedAt,
      });

      // 4. Envelope: JSON helper result or pass-through Response.
      let response: Response;
      if (result instanceof Response) {
        response = result;
      } else {
        response = result.cache
          ? okCached(result.data, result.cache, result.status ?? 200)
          : ok(result.data, result.status ?? 200);
        if (result.headers) {
          for (const [key, value] of new Headers(result.headers).entries()) {
            response.headers.set(key, value);
          }
        }
      }
      log(response.status);
      return decorate(response, rl);
    } catch (error) {
      // 5. Everything thrown is normalized; handlers hook onError for audits.
      options.onError?.(error, userId, startedAt);
      const response = apiError(error);
      log(response.status, "error");
      return decorate(response);
    }
  };
}
