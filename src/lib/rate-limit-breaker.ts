/**
 * Circuit breaker for the Upstash L2 limiter — pure, no `server-only`, no I/O.
 *
 * Why a breaker at all: the L2 limiter is a network dependency on the request
 * path. Without one, a Upstash outage means every write either waits out a
 * timeout or fails — the user cannot save a mock because a rate limiter is
 * down. With one, three consecutive failures open the circuit for a minute and
 * the app runs on L1 alone, which still enforces a real per-instance limit.
 *
 * Kept separate from `rate-limit-upstash.ts` so the state machine is unit
 * testable without the SDK, a network, or Next's `server-only` alias.
 */

/** Consecutive failures that open the circuit. */
export const BREAKER_THRESHOLD = 3;
/** How long the circuit stays open before a probe is allowed. */
export const BREAKER_OPEN_MS = 60_000;

export type BreakerState = {
  failures: number;
  /** Epoch ms the circuit opened, or null when closed. */
  openedAt: number | null;
};

export function initialBreaker(): BreakerState {
  return { failures: 0, openedAt: null };
}

/** True while requests must skip L2. Closes the circuit once the window elapses. */
export function isBreakerOpen(state: BreakerState, now: number): boolean {
  if (state.openedAt === null) return false;
  return now - state.openedAt < BREAKER_OPEN_MS;
}

/**
 * Reconcile an open circuit whose window has elapsed.
 *
 * Returns a closed state so the next request probes L2; if that probe fails,
 * {@link onFailure} re-opens it immediately (the failure counter is not reset
 * to zero, so one bad probe is enough to reopen).
 */
export function tickBreaker(state: BreakerState, now: number): BreakerState {
  if (state.openedAt === null) return state;
  if (now - state.openedAt < BREAKER_OPEN_MS) return state;
  return { failures: BREAKER_THRESHOLD - 1, openedAt: null };
}

export function onFailure(state: BreakerState, now: number): BreakerState {
  const failures = state.failures + 1;
  if (failures >= BREAKER_THRESHOLD) return { failures, openedAt: now };
  return { failures, openedAt: state.openedAt };
}

export function onSuccess(): BreakerState {
  return initialBreaker();
}
