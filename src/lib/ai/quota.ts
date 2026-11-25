import { AiError } from "./errors";
import { estimateTokens } from "./tokens";

/** Bounded context builder target, used for conservative pre-call reserves. */
export const CONTEXT_TOKEN_ESTIMATE = 12_000;

export type AiQuotaUsage = { requests: number; tokens: number };
export type AiQuotaLimits = { requests: number; tokens: number };
export type ReservationPlan =
  { allowed: true } | { allowed: false; reason: "requests" | "tokens" };

export function planReservation(
  used: AiQuotaUsage,
  limits: AiQuotaLimits,
  reservation: number,
): ReservationPlan {
  if (limits.requests !== Infinity && used.requests >= limits.requests)
    return { allowed: false, reason: "requests" };
  // A personal key has no daily token ceiling at all; only a real number can
  // be exceeded.
  if (
    Number.isFinite(limits.tokens) &&
    used.tokens + Math.max(0, reservation) > limits.tokens
  )
    return { allowed: false, reason: "tokens" };
  return { allowed: true };
}

/**
 * What to reserve before a call. There is no reply ceiling any more, so the
 * completion cannot be reserved exactly: `outputTokens` is a conservative
 * estimate supplied by the caller for a metered (env) key and 0 for a personal
 * key, whose daily budget is unlimited.
 */
export function reservationTokens(input: {
  promptText: string;
  contextTokens?: number;
  outputTokens?: number;
  providerCalls: number;
}) {
  const calls = Math.min(2, Math.max(1, Math.floor(input.providerCalls)));
  return (
    estimateTokens(input.promptText) +
    (input.contextTokens ?? 0) +
    Math.max(0, Math.floor(input.outputTokens ?? 0)) * calls
  );
}

/** A failed call may already have been billed; never charge less than reserved. */
export function chargedOnFailure(knownTokens: number, reservedTokens: number) {
  return Math.max(Math.max(0, knownTokens), Math.max(0, reservedTokens));
}

export function chargedForAiFailure(
  error: unknown,
  reservedTokens: number,
  knownTokens = 0,
) {
  if (error instanceof AiError && error.billability === "none")
    return Math.max(0, Math.floor(knownTokens));
  return chargedOnFailure(knownTokens, reservedTokens);
}
